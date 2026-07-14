export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  let body = options.body;

  if (body !== undefined && body !== null && typeof body !== "string" && !(body instanceof FormData)) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(body);
  }

  const response = await fetch(path, {
    ...options,
    body,
    headers,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof payload === "object" && payload?.error
      ? payload.error
      : `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function apiGet(path, options = {}) {
  return apiRequest(path, { ...options, method: "GET" });
}

export function apiPost(path, body, options = {}) {
  return apiRequest(path, { ...options, method: "POST", body });
}

export function apiPut(path, body, options = {}) {
  return apiRequest(path, { ...options, method: "PUT", body });
}

export function apiDelete(path, options = {}) {
  return apiRequest(path, { ...options, method: "DELETE" });
}
