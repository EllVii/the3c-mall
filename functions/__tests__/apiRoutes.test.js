/** @jest-environment node */

import { onRequest as onCatchAllRequest } from "../api/[[path]].js";
import {
  onRequest as onNearbyRequest,
  onRequestGet as onNearbyGet,
} from "../api/stores/nearby.js";
import {
  onRequestOptions as onWaitlistOptions,
  onRequestPost as onWaitlistPost,
} from "../api/report/waitlist.js";

async function responseJson(response) {
  return response.json();
}

describe("Cloudflare Pages API routes", () => {
  describe("catch-all API", () => {
    test("reports a missing D1 binding", async () => {
      const response = await onCatchAllRequest({
        request: new Request("https://the3cmall.app/api/health"),
        env: {},
      });

      expect(response.status).toBe(503);
      await expect(responseJson(response)).resolves.toMatchObject({
        code: "database_not_configured",
      });
    });
  });

  describe("nearby store API", () => {
    test("rejects an invalid latitude", async () => {
      const response = await onNearbyGet({
        request: new Request("https://the3cmall.app/api/stores/nearby"),
        env: {},
      });

      expect(response.status).toBe(400);
      await expect(responseJson(response)).resolves.toMatchObject({
        code: "invalid_latitude",
      });
    });

    test("rejects an invalid longitude", async () => {
      const response = await onNearbyGet({
        request: new Request(
          "https://the3cmall.app/api/stores/nearby?lat=33.5&lng=200",
        ),
        env: {},
      });

      expect(response.status).toBe(400);
      await expect(responseJson(response)).resolves.toMatchObject({
        code: "invalid_longitude",
      });
    });

    test("reports missing Kroger credentials", async () => {
      const response = await onNearbyGet({
        request: new Request(
          "https://the3cmall.app/api/stores/nearby?lat=33.5387&lng=-112.186",
        ),
        env: {},
      });

      expect(response.status).toBe(503);
      await expect(responseJson(response)).resolves.toMatchObject({
        code: "kroger_not_configured",
      });
    });

    test("rejects unsupported methods", async () => {
      const response = await onNearbyRequest({
        request: new Request("https://the3cmall.app/api/stores/nearby", {
          method: "POST",
        }),
        env: {},
      });

      expect(response.status).toBe(405);
      expect(response.headers.get("allow")).toBe("GET");
    });
  });

  describe("waitlist API", () => {
    test("reports a missing D1 binding", async () => {
      const response = await onWaitlistPost({
        request: new Request("https://the3cmall.app/api/report/waitlist", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: "person@example.com" }),
        }),
        env: {},
        waitUntil: jest.fn(),
      });

      expect(response.status).toBe(503);
      await expect(responseJson(response)).resolves.toMatchObject({
        code: "database_not_configured",
      });
    });

    test("validates email before touching the database schema", async () => {
      const response = await onWaitlistPost({
        request: new Request("https://the3cmall.app/api/report/waitlist", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: "not-an-email" }),
        }),
        env: { DB: {} },
        waitUntil: jest.fn(),
      });

      expect(response.status).toBe(400);
      await expect(responseJson(response)).resolves.toMatchObject({
        code: "bad_request",
      });
    });

    test("rejects cross-origin writes", async () => {
      const response = await onWaitlistPost({
        request: new Request("https://the3cmall.app/api/report/waitlist", {
          method: "POST",
          headers: {
            origin: "https://example.com",
            "content-type": "application/json",
          },
          body: JSON.stringify({ email: "person@example.com" }),
        }),
        env: { DB: {}, APP_ORIGIN: "https://the3cmall.app" },
        waitUntil: jest.fn(),
      });

      expect(response.status).toBe(403);
      await expect(responseJson(response)).resolves.toMatchObject({
        code: "origin_rejected",
      });
    });

    test("supports CORS preflight", () => {
      const response = onWaitlistOptions();
      expect(response.status).toBe(204);
      expect(response.headers.get("access-control-allow-methods")).toContain(
        "POST",
      );
    });
  });
});
