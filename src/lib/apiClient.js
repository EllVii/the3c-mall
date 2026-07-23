const DEFAULT_HEADERS = {
  Accept: "application/json",
};

export class ApiError extends Error {
  constructor(message, status = 0, code = "api_error", details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiRequest(path, options = {}) {
  const requestOptions = {
    credentials: "include",
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {}),
    },
  };

  if (
    requestOptions.body &&
    !(requestOptions.body instanceof FormData) &&
    typeof requestOptions.body !== "string"
  ) {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  let response;
  try {
    response = await fetch(path, requestOptions);
  } catch (networkError) {
    if (requestOptions.signal?.aborted) {
      throw new ApiError(
        "The request took too long.",
        408,
        "request_timeout",
        networkError,
      );
    }

    throw new ApiError(
      "The 3C Mall service could not be reached.",
      0,
      "network_error",
      networkError,
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    throw new ApiError(
      payload?.error || `Request failed with status ${response.status}`,
      response.status,
      payload?.code || "request_failed",
      payload,
    );
  }

  return payload;
}

export function getSession(options = {}) {
  return apiRequest("/api/auth/session", options);
}

export function signUpAccount(email, password, metadata = {}) {
  return apiRequest("/api/auth/signup", {
    method: "POST",
    body: { email, password, metadata },
  });
}

export function signInAccount(email, password) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function signOutAccount() {
  return apiRequest("/api/auth/logout", { method: "POST", body: {} });
}

export function requestPasswordReset(email) {
  return apiRequest("/api/auth/request-password-reset", {
    method: "POST",
    body: { email },
  });
}

export function resetPasswordWithToken(token, password) {
  return apiRequest("/api/auth/reset-password", {
    method: "POST",
    body: { token, password },
  });
}

export function changePassword(password) {
  return apiRequest("/api/auth/change-password", {
    method: "POST",
    body: { password },
  });
}

export function getAccessRequests(adminToken, status = "pending") {
  return apiRequest(
    `/api/admin/access-requests?status=${encodeURIComponent(status)}`,
    {
      headers: { Authorization: `Bearer ${adminToken}` },
    },
  );
}

export function reviewAccessRequest(adminToken, userId, decision, note = "") {
  return apiRequest("/api/admin/access-requests", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { userId, decision, note },
  });
}

export function loadProfileValue(key) {
  return apiRequest(`/api/profile?key=${encodeURIComponent(key)}`);
}

export function saveProfileValue(key, value) {
  return apiRequest(`/api/profile?key=${encodeURIComponent(key)}`, {
    method: "PUT",
    body: { value },
  });
}

export function getPilotConsent() {
  return apiRequest("/api/pilot/consent");
}

export function acceptPilotConsent(
  familyCode,
  consentVersion = "phase-i-v1",
) {
  return apiRequest("/api/pilot/consent", {
    method: "POST",
    body: { accepted: true, familyCode, consentVersion },
  });
}

export function withdrawPilotConsent() {
  return apiRequest("/api/pilot/consent", {
    method: "POST",
    body: { withdraw: true },
  });
}

export function submitPilotFeedback(values) {
  return apiRequest("/api/pilot/feedback", {
    method: "POST",
    body: values,
  });
}

export function recordPilotEvent(
  eventName,
  properties = {},
  eventVersion = 1,
) {
  return apiRequest("/api/pilot/events", {
    method: "POST",
    body: { eventName, properties, eventVersion },
  });
}
