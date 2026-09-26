import { execFileSync } from "node:child_process";
import {
  INDEXABLE_ROUTE_PATHS,
  MARKETING_ORIGIN,
} from "../src/utils/publicSeoRoutes.js";

const INDEXNOW_KEY = "8045f89b8caa97e934100fd14e33fd48";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const HOST = new URL(MARKETING_ORIGIN).hostname;
const KEY_LOCATION = `${MARKETING_ORIGIN}/${INDEXNOW_KEY}.txt`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function changedFiles() {
  const before = process.env.INDEXNOW_BEFORE_SHA;
  const after = process.env.INDEXNOW_SHA || "HEAD";

  if (!before || /^0+$/.test(before)) return [];

  try {
    return execFileSync("git", ["diff", "--name-only", before, after], {
      encoding: "utf8",
    })
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);
  } catch (error) {
    console.warn("IndexNow could not calculate the changed-file set:", error.message);
    return [];
  }
}

function addRoutes(target, routes) {
  for (const route of routes) {
    if (INDEXABLE_ROUTE_PATHS.includes(route)) target.add(route);
  }
}

function routesForChanges(files) {
  const routes = new Set();
  const allRoutes = INDEXABLE_ROUTE_PATHS;
  const resourceRoutes = INDEXABLE_ROUTE_PATHS.filter((route) =>
    route.startsWith("/resources"),
  );

  const globalFiles = new Set([
    "index.html",
    "scripts/postbuild-seo.mjs",
    "src/utils/publicSeoRoutes.js",
    "src/assets/components/SeoManager.jsx",
    "src/assets/components/layouts/SiteLayout.jsx",
  ]);

  if (files.some((file) => globalFiles.has(file))) {
    addRoutes(routes, allRoutes);
    return routes;
  }

  const routeRules = [
    {
      matches: ["src/pages/LandingPage.jsx"],
      routes: ["/"],
    },
    {
      matches: ["src/pages/Features.jsx"],
      routes: ["/features"],
    },
    {
      matches: ["src/pages/Pricing.jsx"],
      routes: ["/pricing"],
    },
    {
      matches: ["src/pages/About.jsx"],
      routes: ["/about"],
    },
    {
      matches: [
        "src/pages/Resources.jsx",
        "src/pages/ResourceArticle.jsx",
        "src/data/resourceGuides.js",
      ],
      routes: resourceRoutes,
    },
    {
      matches: ["src/pages/PrivacyPolicy.jsx"],
      routes: ["/privacy"],
    },
    {
      matches: ["src/pages/TermsOfService.jsx"],
      routes: ["/terms"],
    },
  ];

  for (const rule of routeRules) {
    if (files.some((file) => rule.matches.includes(file))) {
      addRoutes(routes, rule.routes);
    }
  }

  return routes;
}

async function waitForPublishedKey() {
  for (let attempt = 1; attempt <= 18; attempt += 1) {
    try {
      const response = await fetch(KEY_LOCATION, {
        headers: { "cache-control": "no-cache" },
      });
      const value = response.ok ? (await response.text()).trim() : "";

      if (value === INDEXNOW_KEY) return;
    } catch (error) {
      if (attempt === 18) {
        console.warn("IndexNow ownership key check failed:", error.message);
      }
    }

    if (attempt < 18) await sleep(10000);
  }

  throw new Error(
    "The IndexNow ownership key was not available on the production host after deployment wait checks.",
  );
}

const files = changedFiles();
const routes = routesForChanges(files);

if (routes.size === 0) {
  console.log("IndexNow: no changed public content routes detected; nothing to submit.");
  process.exit(0);
}

await waitForPublishedKey();

const urlList = [...routes].map((route) =>
  new URL(route === "/" ? "/" : route, MARKETING_ORIGIN).href,
);

const response = await fetch(INDEXNOW_ENDPOINT, {
  method: "POST",
  headers: {
    "content-type": "application/json; charset=utf-8",
  },
  body: JSON.stringify({
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  }),
});

if (![200, 202].includes(response.status)) {
  const body = await response.text();
  throw new Error(
    `IndexNow submission failed with HTTP ${response.status}: ${body.slice(0, 500)}`,
  );
}

console.log(
  `IndexNow accepted ${urlList.length} changed public URL(s) with HTTP ${response.status}.`,
);
