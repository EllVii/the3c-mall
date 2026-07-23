import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DIST_DIR = path.resolve("dist");
const TEMPLATE_PATH = path.join(DIST_DIR, "index.html");
const MARKETING_ORIGIN = "https://the3cmall.com";
const APP_ORIGIN = "https://the3cmall.app";
const SOCIAL_IMAGE = `${MARKETING_ORIGIN}/brand/3c-mall-entrance.jpg`;

const pages = [
  {
    output: "index.html",
    title: "3C Mall | Smart Meal Planning & Grocery Cost Comparison",
    description:
      "Plan meals, compare grocery costs, organize household shopping, and get guided support with the 3C Mall lifestyle app.",
    canonical: `${MARKETING_ORIGIN}/`,
    robots:
      "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    schemaType: "home",
  },
  {
    output: "features/index.html",
    title: "Meal Planning & Grocery Comparison Features | 3C Mall",
    description:
      "Explore 3C Mall features for guided meal planning, grocery cost comparison, household organization, fitness, and community support.",
    canonical: `${MARKETING_ORIGIN}/features`,
    robots:
      "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    schemaType: "webpage",
  },
  {
    output: "pricing/index.html",
    title: "3C Mall Pricing | Meal Planning and Grocery Tools",
    description:
      "Compare 3C Mall plans for meal planning, estimated grocery comparisons, household profiles, pickup, and optional delivery tools.",
    canonical: `${MARKETING_ORIGIN}/pricing`,
    robots:
      "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    schemaType: "pricing",
  },
  {
    output: "terms/index.html",
    title: "Terms of Service | 3C Mall",
    description:
      "Review the terms that govern access to and use of the 3C Mall website and lifestyle planning application.",
    canonical: `${MARKETING_ORIGIN}/terms`,
    robots:
      "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    schemaType: "webpage",
  },
  {
    output: "privacy/index.html",
    title: "Privacy Policy | 3C Mall",
    description:
      "Learn how 3C Mall handles account, household, grocery planning, and application data.",
    canonical: `${MARKETING_ORIGIN}/privacy`,
    robots:
      "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    schemaType: "webpage",
  },
  {
    output: "login/index.html",
    title: "Sign In | 3C Mall",
    description: "Secure sign-in for the 3C Mall application.",
    canonical: `${APP_ORIGIN}/login`,
    robots: "noindex, nofollow, noarchive",
    schemaType: null,
  },
  {
    output: "app/index.html",
    title: "3C Mall App",
    description:
      "Secure access to the 3C Mall meal planning and grocery organization application.",
    canonical: `${APP_ORIGIN}/app`,
    robots: "noindex, nofollow, noarchive",
    schemaType: null,
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function replaceOrInsert(html, pattern, replacement) {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace("</head>", `  ${replacement}\n  </head>`);
}

function buildSchema(page) {
  if (!page.schemaType) return null;

  const organization = {
    "@type": "Organization",
    "@id": `${MARKETING_ORIGIN}/#organization`,
    name: "3C Mall",
    url: `${MARKETING_ORIGIN}/`,
    logo: {
      "@type": "ImageObject",
      url: `${MARKETING_ORIGIN}/icons/icon-512.png`,
    },
  };

  const website = {
    "@type": "WebSite",
    "@id": `${MARKETING_ORIGIN}/#website`,
    url: `${MARKETING_ORIGIN}/`,
    name: "3C Mall",
    alternateName: "The 3C Mall",
    description: pages[0].description,
    publisher: { "@id": `${MARKETING_ORIGIN}/#organization` },
  };

  const appService = {
    "@type": "Service",
    "@id": `${APP_ORIGIN}/app#service`,
    name: "3C Mall Web Application",
    serviceType: "Meal planning and grocery cost comparison application",
    url: `${APP_ORIGIN}/app`,
    description: pages[0].description,
    image: SOCIAL_IMAGE,
    provider: { "@id": `${MARKETING_ORIGIN}/#organization` },
    creator: {
      "@type": "Organization",
      name: "Ell Vii's Automations",
      url: "https://ellviisautomations.com/",
    },
    offers: [
      { "@type": "Offer", name: "Basic", price: "0", priceCurrency: "USD" },
      { "@type": "Offer", name: "Pro", price: "14.99", priceCurrency: "USD" },
      { "@type": "Offer", name: "Family", price: "24.99", priceCurrency: "USD" },
    ],
  };

  const graph = [organization, website];
  if (page.schemaType === "home" || page.schemaType === "pricing") {
    graph.push(appService);
  }
  if (page.schemaType === "webpage" || page.schemaType === "pricing") {
    graph.push({
      "@type": "WebPage",
      "@id": `${page.canonical}#webpage`,
      url: page.canonical,
      name: page.title,
      description: page.description,
      isPartOf: { "@id": `${MARKETING_ORIGIN}/#website` },
      about: { "@id": `${APP_ORIGIN}/app#service` },
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

function applyMetadata(template, page) {
  let html = template;
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const canonical = escapeHtml(page.canonical);
  const robots = escapeHtml(page.robots);

  html = replaceOrInsert(html, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  html = replaceOrInsert(
    html,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${description}" />`,
  );
  html = replaceOrInsert(
    html,
    /<meta\s+name=["']robots["'][^>]*>/i,
    `<meta name="robots" content="${robots}" />`,
  );
  html = replaceOrInsert(
    html,
    /<meta\s+name=["']googlebot["'][^>]*>/i,
    `<meta name="googlebot" content="${robots}" />`,
  );
  html = replaceOrInsert(
    html,
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${canonical}" />`,
  );

  const socialTags = [
    [/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${title}" />`],
    [/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${description}" />`],
    [/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}" />`],
    [/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${title}" />`],
    [/<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${description}" />`],
  ];

  for (const [pattern, replacement] of socialTags) {
    html = replaceOrInsert(html, pattern, replacement);
  }

  const schema = buildSchema(page);
  const schemaPattern = /<script[^>]*id=["']seo-structured-data["'][^>]*>[\s\S]*?<\/script>/i;
  if (schema) {
    html = replaceOrInsert(
      html,
      schemaPattern,
      `<script type="application/ld+json" id="seo-structured-data">${JSON.stringify(schema)}</script>`,
    );
  } else {
    html = html.replace(schemaPattern, "");
  }

  return html;
}

const template = await readFile(TEMPLATE_PATH, "utf8");

for (const page of pages) {
  const outputPath = path.join(DIST_DIR, page.output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, applyMetadata(template, page), "utf8");
}

const notFound = applyMetadata(template, {
  output: "404.html",
  title: "Page Not Found | 3C Mall",
  description: "The requested 3C Mall page could not be found.",
  canonical: `${MARKETING_ORIGIN}/404`,
  robots: "noindex, nofollow, noarchive",
  schemaType: null,
});
await writeFile(path.join(DIST_DIR, "404.html"), notFound, "utf8");

console.log(`Generated SEO HTML for ${pages.length} routes plus 404.html.`);
