import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

const failures = [];
const warnings = [];
const passed = [];

function check(condition, message) {
  if (condition) passed.push(message);
  else failures.push(message);
}

function includesAll(content, values, label) {
  for (const value of values) {
    check(content.includes(value), `${label}: ${value}`);
  }
}

const [
  app,
  redirects,
  catchAllApi,
  waitlistApi,
  nearbyStoresApi,
  migration,
  wrangler,
  apiClient,
  storeLocator,
  krogerClient,
] = await Promise.all([
  read("src/App.jsx"),
  read("public/_redirects"),
  read("functions/api/[[path]].js"),
  read("functions/api/report/waitlist.js"),
  read("functions/api/stores/nearby.js"),
  read("migrations/0001_phase_i_core.sql"),
  read("wrangler.example.jsonc"),
  read("src/lib/apiClient.js"),
  read("src/pages/StoreLocatorPage.jsx"),
  read("src/utils/krogerService.js"),
]);

includesAll(
  app,
  [
    'path="/"',
    'path="/features"',
    'path="/pricing"',
    'path="/resources"',
    'path="/resources/:slug"',
    'path="/comment-limit"',
    'path="/terms"',
    'path="/privacy"',
    'path="/health/d1"',
    'path="/health/supabase"',
    'path="/login"',
    'path="/app"',
    'path="dashboard"',
    'path="profile"',
    'path="user-profile"',
    'path="meal-planner"',
    'path="grocery-lab"',
    'path="cancel"',
    'path="community"',
    'path="fitness"',
    'path="stores"',
    'path="pt"',
    'path="recipes"',
    'path="recipes/:id"',
    'path="pilot"',
    'path="coming-soon"',
  ],
  "React route",
);

includesAll(
  app,
  [
    'path="directory"',
    'path="map"',
    'path="meal-plans"',
    'path="store"',
    '<Navigate to="/app" replace />',
    '<Navigate to="/app/meal-planner" replace />',
    '<Navigate to="/app/stores" replace />',
  ],
  "React route alias",
);

includesAll(
  redirects,
  [
    "/features",
    "/pricing",
    "/resources",
    "/resources/budget-meal-planning",
    "/resources/grocery-unit-price-calculator",
    "/resources/compare-grocery-prices",
    "/terms",
    "/privacy",
    "/login",
    "/app",
    "/app/*",
    "/*",
  ],
  "Cloudflare Pages redirect",
);

const catchAllRoutes = [
  "POST /api/auth/signup",
  "GET /api/auth/verify-email",
  "POST /api/auth/login",
  "POST /api/auth/logout",
  "GET /api/auth/session",
  "POST /api/auth/request-password-reset",
  "POST /api/auth/reset-password",
  "POST /api/auth/change-password",
  "GET /api/profile",
  "PUT /api/profile",
  "GET /api/pilot/consent",
  "POST /api/pilot/consent",
  "POST /api/pilot/events",
  "POST /api/pilot/feedback",
  "POST /api/pilot/receipts",
  "POST /api/report/waitlist",
  "GET /api/admin/pilot-summary",
  "GET /api/health",
  "GET /api/health/d1",
];

for (const route of catchAllRoutes) {
  check(catchAllApi.includes(`case "${route}"`), `Cloudflare API route: ${route}`);
}

check(
  waitlistApi.includes("export async function onRequestPost"),
  "Dedicated waitlist POST function exists",
);
check(
  waitlistApi.includes("ensureSchema"),
  "Dedicated waitlist function repairs/ensures D1 schema",
);
check(
  nearbyStoresApi.includes("export async function onRequestGet"),
  "Nearby-store GET function exists",
);
check(
  nearbyStoresApi.includes("KROGER_CLIENT_ID") &&
    nearbyStoresApi.includes("KROGER_CLIENT_SECRET"),
  "Nearby-store function checks Kroger credentials",
);

const requiredTables = [
  "users",
  "sessions",
  "email_verification_tokens",
  "password_reset_tokens",
  "user_profile_data",
  "pilot_consents",
  "pilot_events",
  "pilot_feedback",
  "pilot_receipts",
  "waitlist",
  "rate_limits",
  "audit_log",
];
for (const table of requiredTables) {
  check(
    migration.includes(`CREATE TABLE IF NOT EXISTS ${table}`),
    `D1 migration table: ${table}`,
  );
}

check(
  wrangler.includes('"binding": "DB"') &&
    wrangler.includes('"database_name": "the3c-mall-production"'),
  "Wrangler example declares production D1 DB binding",
);
check(
  wrangler.includes('"binding": "RECEIPTS"') &&
    wrangler.includes('"bucket_name": "the3c-mall-phase-i-receipts"'),
  "Wrangler example declares R2 RECEIPTS binding",
);

const clientPaths = [
  "/api/auth/session",
  "/api/auth/signup",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/request-password-reset",
  "/api/auth/reset-password",
  "/api/auth/change-password",
  "/api/profile",
  "/api/pilot/consent",
  "/api/pilot/feedback",
  "/api/pilot/events",
];
for (const apiPath of clientPaths) {
  check(apiClient.includes(apiPath), `Frontend API client route: ${apiPath}`);
}
check(
  storeLocator.includes("/api/stores/nearby"),
  "Store locator calls the deployed nearby-store API",
);
check(
  !krogerClient.includes("localhost:3001"),
  "Browser API clients do not fall back to localhost in production",
);

if (
  krogerClient.includes("/api/kroger/search") ||
  krogerClient.includes("/api/kroger/product/")
) {
  warnings.push(
    "Legacy src/utils/krogerService.js still references product-search routes that are not implemented by Cloudflare Pages Functions. The file is currently not imported by the app.",
  );
}

warnings.push(
  "No CRM webhook, CRM API client, or CRM-specific input/output route was found. Waitlist input currently terminates in D1 plus email notifications only.",
);

console.log(`Route audit passed ${passed.length} checks.`);
for (const warning of warnings) console.warn(`WARNING: ${warning}`);

if (failures.length > 0) {
  console.error(`Route audit failed ${failures.length} checks:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
}
