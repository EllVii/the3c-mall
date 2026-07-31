import {
  ApiError,
  apiRequest,
  getSession,
  saveProfileValue,
  submitPilotFeedback,
} from "../lib/apiClient.js";

function jsonResponse(payload, init = {}) {
  return new Response(JSON.stringify(payload), {
    status: init.status || 200,
    headers: { "content-type": "application/json" },
  });
}

describe("apiClient input and output contracts", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("serializes JSON input and includes the session cookie", async () => {
    fetch.mockResolvedValue(jsonResponse({ ok: true }));

    await apiRequest("/api/example", {
      method: "POST",
      body: { name: "3C Mall" },
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/example",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ name: "3C Mall" }),
        headers: expect.objectContaining({
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  test("returns parsed JSON output", async () => {
    fetch.mockResolvedValue(jsonResponse({ user: null }));

    await expect(getSession()).resolves.toEqual({ user: null });
  });

  test("surfaces API failures with status, code, and details", async () => {
    fetch.mockResolvedValue(
      jsonResponse(
        { error: "Consent is required", code: "consent_required" },
        { status: 403 },
      ),
    );

    await expect(submitPilotFeedback({ rating: 5 })).rejects.toMatchObject({
      name: "ApiError",
      status: 403,
      code: "consent_required",
      details: {
        error: "Consent is required",
        code: "consent_required",
      },
    });
  });

  test("surfaces network failures", async () => {
    fetch.mockRejectedValue(new TypeError("Network unavailable"));

    await expect(apiRequest("/api/health")).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        status: 0,
        code: "network_error",
      }),
    );
  });

  test("encodes profile keys and preserves output", async () => {
    fetch.mockResolvedValue(jsonResponse({ ok: true, key: "meal plan" }));

    const result = await saveProfileValue("meal plan", { dinners: 7 });

    expect(fetch).toHaveBeenCalledWith(
      "/api/profile?key=meal%20plan",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ value: { dinners: 7 } }),
      }),
    );
    expect(result).toEqual({ ok: true, key: "meal plan" });
  });

  test("ApiError keeps the supplied details", () => {
    const error = new ApiError("Failed", 500, "internal_error", { id: 1 });
    expect(error).toMatchObject({
      message: "Failed",
      status: 500,
      code: "internal_error",
      details: { id: 1 },
    });
  });
});
