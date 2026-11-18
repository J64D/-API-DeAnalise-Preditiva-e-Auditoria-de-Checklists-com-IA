import "dotenv/config";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";

const migrationPath = fileURLToPath(new URL("../../migrations/001_security_schema.sql", import.meta.url));

try {
  const migration = await readFile(migrationPath, "utf8");
  await pool.query(migration);
  console.log("Sentinel security schema is up to date.");
} finally {
  await pool.end();
}
