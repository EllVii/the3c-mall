import { json } from "../../_shared/http.js";

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return json(
      {
        status: "error",
        message: "D1 binding DB is not configured",
        d1: { connected: false },
      },
      500,
    );
  }

  try {
    const row = await env.DB.prepare("SELECT 1 AS ok").first();
    return json({
      status: row?.ok === 1 ? "success" : "error",
      message: row?.ok === 1 ? "Cloudflare D1 connection verified" : "D1 query returned an unexpected result",
      d1: {
        binding: "DB",
        connected: row?.ok === 1,
        timestamp: new Date().toISOString(),
      },
    }, row?.ok === 1 ? 200 : 500);
  } catch (error) {
    console.error("D1 health check failed", error);
    return json(
      {
        status: "error",
        message: "D1 health check failed",
        d1: { binding: "DB", connected: false },
      },
      500,
    );
  }
}
