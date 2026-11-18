CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY,
  event_type VARCHAR(40) NOT NULL CHECK (event_type IN (
    'login.success',
    'login.failure',
    'mfa.failure',
    'privilege.change',
    'policy.change',
    'sensitive.access'
  )),
  actor_email VARCHAR(254) NOT NULL,
  source_ip VARCHAR(45) NOT NULL,
  source_system VARCHAR(100) NOT NULL,
  resource VARCHAR(200),
  outcome VARCHAR(12) NOT NULL CHECK (outcome IN ('success', 'failure')),
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS security_events_occurred_at_idx ON security_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS security_events_actor_ip_idx ON security_events (actor_email, source_ip, event_type, occurred_at DESC);

CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES security_events(id),
  fingerprint VARCHAR(320) NOT NULL,
  rule_key VARCHAR(60) NOT NULL,
  severity VARCHAR(12) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolution_note VARCHAR(500)
);

CREATE INDEX IF NOT EXISTS security_alerts_status_created_idx ON security_alerts (status, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS security_alerts_active_fingerprint_idx
  ON security_alerts (fingerprint)
  WHERE status IN ('OPEN', 'INVESTIGATING');

CREATE TABLE IF NOT EXISTS security_alert_history (
  id UUID PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES security_alerts(id),
  previous_status VARCHAR(16) NOT NULL,
  new_status VARCHAR(16) NOT NULL,
  note VARCHAR(500),
  changed_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS security_alert_history_created_idx ON security_alert_history (created_at DESC);
