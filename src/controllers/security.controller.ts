import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import type { PoolClient } from "pg";
import { z } from "zod";
import { pool } from "../db/pool.js";

const eventSchema = z.object({
  eventType: z.enum([
    "login.success",
    "login.failure",
    "mfa.failure",
    "privilege.change",
    "policy.change",
    "sensitive.access",
  ]),
  actorEmail: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  sourceIp: z.union([z.ipv4(), z.ipv6()]),
  sourceSystem: z.string().trim().min(2).max(100).default("manual"),
  resource: z.string().trim().min(1).max(200).optional(),
  outcome: z.enum(["success", "failure"]),
  occurredAt: z.iso.datetime().optional(),
}).strict().refine(
  (event) => {
    if (event.eventType === "login.failure" || event.eventType === "mfa.failure") return event.outcome === "failure";
    if (event.eventType === "login.success") return event.outcome === "success";
    return true;
  },
  { path: ["outcome"], message: "Outcome does not match the event type." },
);

const alertUpdateSchema = z.object({
  status: z.enum(["INVESTIGATING", "RESOLVED"]),
  note: z.string().trim().max(500).optional(),
}).strict();

type AlertSeverity = "MEDIUM" | "HIGH" | "CRITICAL";

interface AlertRule {
  key: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  fingerprint: string;
}

function invalidInput(response: Response, issues: z.core.$ZodIssue[]) {
  return response.status(400).json({
    error: "Invalid request.",
    details: issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
  });
}

function parseLimit(value: unknown, fallback: number) {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return parsed >= 1 && parsed <= 100 ? parsed : null;
}

async function detectAlert(
  client: PoolClient,
  event: z.infer<typeof eventSchema>,
  eventId: string,
): Promise<Record<string, unknown> | null> {
  let rule: AlertRule | null = null;
  const fingerprintActor = `${event.actorEmail}:${event.sourceIp}`;

  if (event.eventType === "login.failure" || event.eventType === "mfa.failure") {
    const threshold = event.eventType === "login.failure" ? 5 : 3;
    const countResult = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM security_events
       WHERE actor_email = $1 AND source_ip = $2 AND event_type = $3
         AND occurred_at >= now() - interval '5 minutes'`,
      [event.actorEmail, event.sourceIp, event.eventType],
    );
    if (Number(countResult.rows[0].count) >= threshold) {
      const isLoginBurst = event.eventType === "login.failure";
      rule = {
        key: isLoginBurst ? "login_failure_burst" : "mfa_failure_burst",
        severity: "HIGH",
        title: isLoginBurst ? "Repeated login failures" : "Repeated MFA failures",
        description: `${countResult.rows[0].count} consecutive authentication failures for ${event.actorEmail} from ${event.sourceIp} in five minutes.`,
        fingerprint: `${isLoginBurst ? "login" : "mfa"}:${fingerprintActor}`,
      };
    }
  } else if (event.eventType === "privilege.change") {
    rule = {
      key: "privilege_change",
      severity: "CRITICAL",
      title: "Privilege change detected",
      description: `A privilege change was recorded for ${event.actorEmail}${event.resource ? ` on ${event.resource}` : ""}.`,
      fingerprint: `privilege:${fingerprintActor}:${event.resource || "unspecified"}`,
    };
  }

  if (!rule) return null;
  const alertId = randomUUID();
  const result = await client.query(
    `INSERT INTO security_alerts
       (id, event_id, fingerprint, rule_key, severity, title, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (fingerprint) WHERE status IN ('OPEN', 'INVESTIGATING')
     DO UPDATE SET event_id = EXCLUDED.event_id,
                   description = EXCLUDED.description,
                   updated_at = now()
     RETURNING id, event_id AS "eventId", rule_key AS "ruleKey", severity,
               title, description, status, created_at AS "createdAt",
               updated_at AS "updatedAt"`,
    [alertId, eventId, rule.fingerprint, rule.key, rule.severity, rule.title, rule.description],
  );
  return result.rows[0];
}

export class SecurityController {
  static async getOverview(_request: Request, response: Response) {
    const [metrics, recentEvents, recentAlerts] = await Promise.all([
      pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE occurred_at >= now() - interval '24 hours')::int AS "events24h",
           COUNT(*) FILTER (WHERE event_type IN ('login.failure', 'mfa.failure')
             AND occurred_at >= now() - interval '24 hours')::int AS "authFailures24h"
         FROM security_events`,
      ),
      pool.query(
        `SELECT id, event_type AS "eventType", actor_email AS "actorEmail",
                source_ip AS "sourceIp", source_system AS "sourceSystem",
                resource, outcome, occurred_at AS "occurredAt"
         FROM security_events ORDER BY occurred_at DESC LIMIT 8`,
      ),
      pool.query(
        `SELECT id, event_id AS "eventId", rule_key AS "ruleKey", severity,
                title, description, status, created_at AS "createdAt",
                updated_at AS "updatedAt"
         FROM security_alerts WHERE status IN ('OPEN', 'INVESTIGATING')
         ORDER BY created_at DESC LIMIT 5`,
      ),
    ]);

    const activeAlerts = await pool.query<{ count: number }>(
      "SELECT COUNT(*)::int AS count FROM security_alerts WHERE status IN ('OPEN', 'INVESTIGATING')",
    );

    response.json({
      metrics: { ...metrics.rows[0], activeAlerts: activeAlerts.rows[0].count },
      recentEvents: recentEvents.rows,
      recentAlerts: recentAlerts.rows,
    });
  }

  static async getEvents(request: Request, response: Response) {
    const limit = parseLimit(request.query.limit, 50);
    if (limit === null) return response.status(400).json({ error: "limit must be an integer from 1 to 100." });
    const result = await pool.query(
      `SELECT id, event_type AS "eventType", actor_email AS "actorEmail",
              source_ip AS "sourceIp", source_system AS "sourceSystem",
              resource, outcome, occurred_at AS "occurredAt"
       FROM security_events ORDER BY occurred_at DESC LIMIT $1`,
      [limit],
    );
    return response.json(result.rows);
  }

  static async createEvent(request: Request, response: Response) {
    const parsed = eventSchema.safeParse(request.body);
    if (!parsed.success) return invalidInput(response, parsed.error.issues);

    const event = parsed.data;
    const eventId = randomUUID();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `INSERT INTO security_events
           (id, event_type, actor_email, source_ip, source_system, resource, outcome, occurred_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::timestamptz, now()))
         RETURNING id, event_type AS "eventType", actor_email AS "actorEmail",
                   source_ip AS "sourceIp", source_system AS "sourceSystem",
                   resource, outcome, occurred_at AS "occurredAt"`,
        [
          eventId,
          event.eventType,
          event.actorEmail,
          event.sourceIp,
          event.sourceSystem,
          event.resource ?? null,
          event.outcome,
          event.occurredAt ?? null,
        ],
      );
      const alert = await detectAlert(client, event, eventId);
      await client.query("COMMIT");
      return response.status(201).json({ event: result.rows[0], alert });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async getAlerts(request: Request, response: Response) {
    const limit = parseLimit(request.query.limit, 50);
    if (limit === null) return response.status(400).json({ error: "limit must be an integer from 1 to 100." });

    const status = request.query.status;
    if (status !== undefined && (typeof status !== "string" || !["OPEN", "INVESTIGATING", "RESOLVED"].includes(status))) {
      return response.status(400).json({ error: "status must be OPEN, INVESTIGATING, or RESOLVED." });
    }

    const result = await pool.query(
      `SELECT id, event_id AS "eventId", rule_key AS "ruleKey", severity,
              title, description, status, created_at AS "createdAt",
              updated_at AS "updatedAt", resolution_note AS "resolutionNote"
       FROM security_alerts
       WHERE ($1::text IS NULL OR status = $1)
       ORDER BY created_at DESC LIMIT $2`,
      [status ?? null, limit],
    );
    return response.json(result.rows);
  }

  static async updateAlert(request: Request, response: Response) {
    const parsed = alertUpdateSchema.safeParse(request.body);
    if (!parsed.success) return invalidInput(response, parsed.error.issues);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const current = await client.query<{ status: string }>(
        "SELECT status FROM security_alerts WHERE id = $1 FOR UPDATE",
        [request.params.id],
      );
      if (!current.rowCount) {
        await client.query("ROLLBACK");
        return response.status(404).json({ error: "Alert not found." });
      }
      if (current.rows[0].status === "RESOLVED") {
        await client.query("ROLLBACK");
        return response.status(409).json({ error: "Resolved alerts cannot be changed." });
      }

      const previousStatus = current.rows[0].status;
      const { status, note } = parsed.data;
      if (previousStatus === status) {
        await client.query("ROLLBACK");
        return response.status(409).json({ error: "Alert already has this status." });
      }
      const updated = await client.query(
        `UPDATE security_alerts
         SET status = $1, resolution_note = $2, updated_at = now()
         WHERE id = $3
         RETURNING id, event_id AS "eventId", rule_key AS "ruleKey", severity,
                   title, description, status, created_at AS "createdAt",
                   updated_at AS "updatedAt", resolution_note AS "resolutionNote"`,
        [status, status === "RESOLVED" ? note ?? null : null, request.params.id],
      );
      await client.query(
        `INSERT INTO security_alert_history
           (id, alert_id, previous_status, new_status, note, changed_by)
         VALUES ($1, $2, $3, $4, $5, 'Sentinel Console')`,
        [randomUUID(), request.params.id, previousStatus, status, note ?? null],
      );
      await client.query("COMMIT");
      return response.json(updated.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async getAuditLog(request: Request, response: Response) {
    const limit = parseLimit(request.query.limit, 100);
    if (limit === null) return response.status(400).json({ error: "limit must be an integer from 1 to 100." });
    const result = await pool.query(
      `SELECT id, 'EVENT' AS kind, event_type AS action, actor_email AS actor,
              source_ip AS detail, outcome, occurred_at AS "createdAt"
       FROM security_events
       UNION ALL
       SELECT h.id, 'ALERT_STATUS' AS kind,
              h.previous_status || ' → ' || h.new_status AS action,
              h.changed_by AS actor, a.title || COALESCE(' · ' || h.note, '') AS detail,
              h.new_status AS outcome, h.created_at AS "createdAt"
       FROM security_alert_history h
       JOIN security_alerts a ON a.id = h.alert_id
       ORDER BY "createdAt" DESC LIMIT $1`,
      [limit],
    );
    return response.json(result.rows);
  }
}
