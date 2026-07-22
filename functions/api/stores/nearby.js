const PRODUCTION_KROGER_ORIGIN = "https://api.kroger.com";
const CERTIFICATION_KROGER_ORIGIN = "https://api-ce.kroger.com";
const DEFAULT_TOKEN_SCOPE = "product.compact";

const tokenCache = new Map();

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extraHeaders,
    },
  });
}

function clampNumber(value, fallback, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, minimum), maximum);
}

function normalizeOrigin(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function candidateOrigins(env) {
  const configured = normalizeOrigin(env.KROGER_API_ORIGIN);
  return [...new Set([
    configured,
    PRODUCTION_KROGER_ORIGIN,
    CERTIFICATION_KROGER_ORIGIN,
  ].filter(Boolean))];
}

function environmentName(origin) {
  return origin.includes("api-ce.kroger.com") ? "certification" : "production";
}

function basicAuthorization(clientId, clientSecret) {
  return `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
}

function tokenBody(scope, clientId = null, clientSecret = null) {
  const body = new URLSearchParams({ grant_type: "client_credentials" });
  if (scope) body.set("scope", scope);
  if (clientId) body.set("client_id", clientId);
  if (clientSecret) body.set("client_secret", clientSecret);
  return body;
}

async function requestTokenWithBasic(origin, clientId, clientSecret, scope) {
  return fetch(`${origin}/v1/connect/oauth2/token`, {
    method: "POST",
    headers: {
      authorization: basicAuthorization(clientId, clientSecret),
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body: tokenBody(scope),
  });
}

async function requestTokenWithForm(origin, clientId, clientSecret, scope) {
  return fetch(`${origin}/v1/connect/oauth2/token`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body: tokenBody(scope, clientId, clientSecret),
  });
}

function krogerMessage(payload, status) {
  const raw =
    payload?.errors?.[0]?.reason ||
    payload?.errors?.[0]?.detail ||
    payload?.errors?.reason ||
    payload?.error_description ||
    payload?.error ||
    `Kroger returned HTTP ${status}`;
  return String(raw).replace(/\s+/g, " ").slice(0, 240);
}

async function readTokenResponse(response) {
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

async function authenticateAtOrigin(origin, clientId, clientSecret, scope) {
  let result = await readTokenResponse(
    await requestTokenWithBasic(origin, clientId, clientSecret, scope),
  );

  // Retain compatibility with Kroger application configurations that expect
  // client credentials in the form body instead of HTTP Basic authentication.
  if (!result.response.ok || !result.payload?.access_token) {
    result = await readTokenResponse(
      await requestTokenWithForm(origin, clientId, clientSecret, scope),
    );
  }

  return result;
}

async function getAccessContext(env) {
  const clientId = String(env.KROGER_CLIENT_ID || "").trim();
  const clientSecret = String(env.KROGER_CLIENT_SECRET || "").trim();
  if (!clientId || !clientSecret) {
    const error = new Error("Kroger credentials are not configured in the Cloudflare Production environment");
    error.status = 503;
    error.code = "kroger_not_configured";
    throw error;
  }

  const configuredScope = String(env.KROGER_TOKEN_SCOPE || "").trim();
  const scopes = configuredScope
    ? [configuredScope]
    : [DEFAULT_TOKEN_SCOPE, ""];
  const attempts = [];

  for (const origin of candidateOrigins(env)) {
    for (const scope of scopes) {
      const cacheKey = `${origin}|${scope || "no-scope"}`;
      const cached = tokenCache.get(cacheKey);
      if (cached && Date.now() < cached.expiresAt - 60_000) {
        return {
          token: cached.token,
          origin,
          environment: environmentName(origin),
          scope: scope || null,
        };
      }

      try {
        const { response, payload } = await authenticateAtOrigin(
          origin,
          clientId,
          clientSecret,
          scope,
        );

        if (response.ok && payload?.access_token) {
          const expiresAt = Date.now() + Number(payload.expires_in || 1800) * 1000;
          tokenCache.set(cacheKey, { token: payload.access_token, expiresAt });
          return {
            token: payload.access_token,
            origin,
            environment: environmentName(origin),
            scope: scope || null,
          };
        }

        attempts.push({
          environment: environmentName(origin),
          status: response.status,
          scope: scope || "none",
          message: krogerMessage(payload, response.status),
        });
      } catch (caught) {
        attempts.push({
          environment: environmentName(origin),
          status: 502,
          scope: scope || "none",
          message: String(caught?.message || "Network request failed").slice(0, 240),
        });
      }
    }
  }

  const error = new Error("Kroger did not accept the configured Client ID and Client Secret");
  error.status = attempts.some((attempt) => attempt.status === 401) ? 401 : 502;
  error.code = "kroger_auth_failed";
  error.attempts = attempts;
  throw error;
}

function distanceMiles(lat1, lon1, lat2, lon2) {
  const earthRadiusMiles = 3958.8;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizeLocation(location, userLat, userLng) {
  const address = location?.address || {};
  const geolocation = location?.geolocation || {};
  const lat = Number(geolocation.latitude);
  const lng = Number(geolocation.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const addressParts = [
    address.addressLine1,
    address.addressLine2,
    [address.city, address.state, address.zipCode].filter(Boolean).join(" "),
  ].filter(Boolean);

  return {
    id: String(location.locationId || crypto.randomUUID()),
    name: location.name || location.chain || "Kroger Family Store",
    storeType: "kroger",
    chain: location.chain || null,
    lat,
    lng,
    address: addressParts.join(", ") || "Address unavailable",
    phone: location.phone || null,
    hours: location.hours || null,
    distanceMiles: Number(distanceMiles(userLat, userLng, lat, lng).toFixed(2)),
  };
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const radius = clampNumber(url.searchParams.get("radius"), 10, 1, 50);
  const limit = Math.round(clampNumber(url.searchParams.get("limit"), 25, 1, 50));

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return json({ error: "A valid latitude is required", code: "invalid_latitude" }, 400);
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return json({ error: "A valid longitude is required", code: "invalid_longitude" }, 400);
  }

  try {
    const access = await getAccessContext(context.env);
    const query = new URLSearchParams({
      "filter.latLong.near": `${lat},${lng}`,
      "filter.radiusInMiles": String(radius),
      "filter.limit": String(limit),
    });

    const response = await fetch(`${access.origin}/v1/locations?${query}`, {
      headers: {
        authorization: `Bearer ${access.token}`,
        accept: "application/json",
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return json(
        {
          error: "Kroger store lookup failed",
          code: "kroger_lookup_failed",
          message: krogerMessage(payload, response.status),
          environment: access.environment,
          scope: access.scope,
          upstreamStatus: response.status,
        },
        response.status,
      );
    }

    const stores = (Array.isArray(payload.data) ? payload.data : [])
      .map((location) => normalizeLocation(location, lat, lng))
      .filter(Boolean)
      .sort((left, right) => left.distanceMiles - right.distanceMiles);

    return json({
      success: true,
      source: "kroger",
      environment: access.environment,
      scope: access.scope,
      stores,
      meta: payload.meta || null,
    });
  } catch (caught) {
    console.error("Kroger nearby-store request failed", {
      code: caught?.code || "unexpected_error",
      status: caught?.status || 500,
    });
    return json(
      {
        error: caught?.message || "Unexpected Kroger integration error",
        code: caught?.code || "kroger_error",
        attempts: Array.isArray(caught?.attempts) ? caught.attempts : undefined,
      },
      caught?.status || 500,
    );
  }
}

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return json({ error: "Method not allowed", code: "method_not_allowed" }, 405, {
      allow: "GET",
    });
  }
  return onRequestGet(context);
}
