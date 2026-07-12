import { json } from "../../_shared/http.js";

const REQUIRED_TABLES = [
  "users",
  "sessions",
  "email_verification_tokens",
  "password_reset_tokens",
  "rate_limits",
  "profiles",
];

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return json(
      {
        status: "error",
        message: "D1 binding DB is not configured",
        d1: { connected: false, schemaReady: false },
      },
      500,
    );
  }

  try {
    const connection = await env.DB.prepare("SELECT 1 AS ok").first();
    const placeholders = REQUIRED_TABLES.map(() => "?").join(", ");
    const tableResult = await env.DB.prepare(
      `SELECT name
       FROM sqlite_schema
       WHERE type = 'table' AND name IN (${placeholders})
       ORDER BY name`,
    )
      .bind(...REQUIRED_TABLES)
      .all();

    const existingTables = (tableResult?.results || []).map((row) => row.name);
    const missingTables = REQUIRED_TABLES.filter((name) => !existingTables.includes(name));
    const connected = connection?.ok === 1;
    const schemaReady = connected && missingTables.length === 0;

    return json({
      status: schemaReady ? "success" : "warning",
      message: schemaReady
        ? "Cloudflare D1 connection and authentication schema verified"
        : "Cloudflare D1 is connected, but the authentication schema is incomplete",
      d1: {
        binding: "DB",
        connected,
        schemaReady,
        existingTables,
        missingTables,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("D1 health check failed", error);
    return json(
      {
        status: "error",
        message: "D1 health check failed",
        d1: { binding: "DB", connected: false, schemaReady: false },
      },
      500,
    );
  }
}
