import {
  json,
  methodNotAllowed,
  readJson,
  requireSameOrigin,
  routePath,
  toErrorResponse,
} from "../../../_shared/http.js";
import { requireSession } from "../../../_shared/auth.js";

function validateKey(params) {
  const key = routePath(params, "key");
  if (!/^[A-Za-z0-9._:-]{1,100}$/.test(key)) {
    const error = new Error("Invalid preference key");
    error.status = 400;
    throw error;
  }
  return key;
}

export async function onRequest(context) {
  const { request, env, params } = context;

  try {
    if (!env.DB) {
      const error = new Error("D1 binding DB is not configured");
      error.status = 500;
      throw error;
    }

    const session = await requireSession(request, env);
    const key = validateKey(params);

    if (request.method === "GET") {
      const row = await env.DB.prepare(
        `SELECT preference_value, updated_at
         FROM user_preferences
         WHERE user_id = ? AND preference_key = ?
         LIMIT 1`,
      )
        .bind(session.user.id, key)
        .first();

      if (!row) return json({ value: null, updatedAt: null });

      let value = null;
      try {
        value = JSON.parse(row.preference_value);
      } catch {
        value = row.preference_value;
      }

      return json({ value, updatedAt: row.updated_at });
    }

    if (request.method === "PUT") {
      requireSameOrigin(request);
      const body = await readJson(request, 65_536);
      const serialized = JSON.stringify(body.value ?? null);
      if (serialized.length > 60_000) {
        const error = new Error("Preference value is too large");
        error.status = 413;
        throw error;
      }

      const now = new Date().toISOString();
      await env.DB.prepare(
        `INSERT INTO user_preferences
          (id, user_id, preference_key, preference_value, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id, preference_key) DO UPDATE SET
           preference_value = excluded.preference_value,
           updated_at = excluded.updated_at`,
      )
        .bind(crypto.randomUUID(), session.user.id, key, serialized, now, now)
        .run();

      return json({ success: true, updatedAt: now });
    }

    if (request.method === "DELETE") {
      requireSameOrigin(request);
      await env.DB.prepare(
        "DELETE FROM user_preferences WHERE user_id = ? AND preference_key = ?",
      )
        .bind(session.user.id, key)
        .run();
      return json({ success: true });
    }

    return methodNotAllowed(["GET", "PUT", "DELETE"]);
  } catch (error) {
    console.error("Profile preference route failed", error);
    return toErrorResponse(error, "Profile preference request failed");
  }
}
