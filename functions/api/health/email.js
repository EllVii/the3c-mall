import { getEmailHealth } from "../../_shared/email.js";
import { json } from "../../_shared/http.js";

export async function onRequestGet({ env }) {
  try {
    const email = await getEmailHealth(env);
    return json({
      status: email.configured ? "success" : "warning",
      message: email.configured
        ? "3C Mall transactional email is configured"
        : "3C Mall transactional email is not configured",
      email,
    });
  } catch (error) {
    console.error("Email health check failed", error);
    return json(
      {
        status: "error",
        message: "Email health check failed",
        email: { configured: false, provider: null, serviceBinding: false },
      },
      500,
    );
  }
}
