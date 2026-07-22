const DEFAULT_KROGER_ORIGIN = "https://api.kroger.com";
const TOKEN_SCOPE = "product.compact";

let cachedToken = null;
let cachedTokenExpiresAt = 0;

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

function apiOrigin(env) {
  return String(env.KROGER_API_ORIGIN || DEFAULT_KROGER_ORIGIN).replace(/\/+$/, "");
}

function basicAuthorization(clientId, clientSecret) {
  return `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
}

async function requestTokenWithBasic(origin, clientId, clientSecret) {
  return fetch(`${origin}/v1/connect/oauth2/token`, {
    method: "POST",
    headers: {
      authorization: basicAuthorization(clientId, clientSecret),
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: TOKEN_SCOPE,
    }),
  });
}

async function requestTokenWithForm(origin, clientId, clientSecret) {
  return fetch(`${origin}/v1/connect/oauth2/token`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: TOKEN_SCOPE,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
}

async function getAccessToken(env) {
  if (cachedToken && Date.now() < cachedTokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const clientId = String(env.KROGER_CLIENT_ID || "").trim();
  const clientSecret = String(env.KROGER_CLIENT_SECRET || "").trim();
  if (!clientId || !clientSecret) {
    const error = new Error("Kroger credentials are not configured in Cloudflare");
    error.status = 503;
    error.code = "kroger_not_configured";
    throw error;
  }

  const origin = apiOrigin(env);
  let response = await requestTokenWithBasic(origin, clientId, clientSecret);

  // Some Kroger application configurations accept client credentials in the
  // form body instead of HTTP Basic authentication. Retry once without ever
  // exposing either credential to the browser or application logs.
  if (!response.ok && (response.status === 400 || response.status === 401)) {
    response = await requestTokenWithForm(origin, clientId, clientSecret);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) {
    const error = new Error(
      payload.error_description || payload.error || "Kroger authentication failed",
    );
    error.status = response.status || 502;
    error.code = "kroger_auth_failed";
    throw error;
  }

  cachedToken = payload.access_token;
  cachedTokenExpiresAt = Date.now() + Number(payload.expires_in || 1800) * 1000;
  return cachedToken;
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
    const token = await getAccessToken(context.env);
    const query = new URLSearchParams({
      "filter.latLong.near": `${lat},${lng}`,
      "filter.radiusInMiles": String(radius),
      "filter.limit": String(limit),
    });

    const response = await fetch(`${apiOrigin(context.env)}/v1/locations?${query}`, {
      headers: {
        authorization: `Bearer ${token}`,
        accept: "application/json",
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return json(
        {
          error: "Kroger store lookup failed",
          code: "kroger_lookup_failed",
          message:
            payload?.errors?.[0]?.reason ||
            payload?.errors?.reason ||
            payload?.error_description ||
            payload?.error ||
            `Kroger returned HTTP ${response.status}`,
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
