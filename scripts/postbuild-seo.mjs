import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  APP_ORIGIN,
  DEVELOPER_ORIGIN,
  INDEX_ROBOTS,
  MARKETING_ORIGIN,
  SEO_ROUTES,
  SEO_ROUTE_ENTRIES,
  SOCIAL_IMAGE,
} from "../src/utils/publicSeoRoutes.js";

const DIST_DIR = path.resolve("dist");
const TEMPLATE_PATH = path.join(DIST_DIR, "index.html");
const DEVELOPER_ORGANIZATION_ID = `${DEVELOPER_ORIGIN}/#organization`;

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

function removeInstallMetadata(html) {
  return html
    .replace(/\s*<link\s+rel=["']manifest["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+name=["']apple-mobile-web-app-capable["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+name=["']apple-mobile-web-app-title["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+name=["']apple-mobile-web-app-status-bar-style["'][^>]*>\s*/gi, "\n");
}

function buildBreadcrumbSchema(page) {
  if (!page.breadcrumbs?.length) return null;

  return {
    "@type": "BreadcrumbList",
    "@id": `${page.canonical}#breadcrumb`,
    itemListElement: page.breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function pageSchemaType(schemaType) {
  if (schemaType === "collection") return "CollectionPage";
  if (schemaType === "about") return "AboutPage";
  return "WebPage";
}

function buildSchema(page) {
  if (page.robots !== INDEX_ROBOTS || !page.schemaType) return null;

  const developerOrganization = {
    "@type": "Organization",
    "@id": DEVELOPER_ORGANIZATION_ID,
    name: "Ell Vii's Automations",
    url: `${DEVELOPER_ORIGIN}/`,
    description:
      "Arizona technology company providing website development, SEO, CRM, chatbot, and business automation services.",
  };

  const organization = {
    "@type": "Organization",
    "@id": `${MARKETING_ORIGIN}/#organization`,
    name: "3C Mall",
    url: `${MARKETING_ORIGIN}/`,
    logo: {
      "@type": "ImageObject",
      url: `${MARKETING_ORIGIN}/icons/icon-512.png`,
    },
    creator: { "@id": DEVELOPER_ORGANIZATION_ID },
  };

  const website = {
    "@type": "WebSite",
    "@id": `${MARKETING_ORIGIN}/#website`,
    url: `${MARKETING_ORIGIN}/`,
    name: "3C Mall",
    alternateName: "The 3C Mall",
    description: SEO_ROUTES["/"].description,
    publisher: { "@id": `${MARKETING_ORIGIN}/#organization` },
    creator: { "@id": DEVELOPER_ORGANIZATION_ID },
    copyrightHolder: { "@id": DEVELOPER_ORGANIZATION_ID },
  };

  const appService = {
    "@type": "Service",
    "@id": `${APP_ORIGIN}/app#service`,
    name: "3C Mall Web Application",
    serviceType: "Meal planning and grocery cost comparison application",
    url: `${APP_ORIGIN}/app`,
    description: SEO_ROUTES["/"].description,
    image: SOCIAL_IMAGE,
    provider: { "@id": `${MARKETING_ORIGIN}/#organization` },
    creator: { "@id": DEVELOPER_ORGANIZATION_ID },
    offers: [
      { "@type": "Offer", name: "Basic", price: "0", priceCurrency: "USD" },
      { "@type": "Offer", name: "Pro", price: "14.99", priceCurrency: "USD" },
      { "@type": "Offer", name: "Family", price: "24.99", priceCurrency: "USD" },
    ],
  };

  const webpage = {
    "@type": pageSchemaType(page.schemaType),
    "@id": `${page.canonical}#webpage`,
    url: page.canonical,
    name: page.title,
    description: page.description,
    isPartOf: { "@id": `${MARKETING_ORIGIN}/#website` },
    about: { "@id": `${APP_ORIGIN}/app#service` },
    creator: { "@id": DEVELOPER_ORGANIZATION_ID },
    breadcrumb: page.breadcrumbs?.length
      ? { "@id": `${page.canonical}#breadcrumb` }
      : undefined,
  };

  if (page.hasPart?.length) {
    webpage.hasPart = page.hasPart.map((url) => ({ "@id": `${url}#article` }));
  }

  const graph = [developerOrganization, organization, website, webpage];

  if (page.schemaType === "home" || page.schemaType === "pricing") {
    graph.push(appService);
  }

  if (page.schemaType === "article") {
    const articleId = `${page.canonical}#article`;
    webpage.mainEntity = { "@id": articleId };
    graph.push({
      "@type": "Article",
      "@id": articleId,
      headline: page.headline,
      description: page.description,
      url: page.canonical,
      mainEntityOfPage: { "@id": `${page.canonical}#webpage` },
      image: SOCIAL_IMAGE,
      datePublished: page.datePublished,
      dateModified: page.dateModified,
      keywords: page.keywords,
      author: { "@id": DEVELOPER_ORGANIZATION_ID },
      publisher: { "@id": `${MARKETING_ORIGIN}/#organization` },
    });
  }

  const breadcrumb = buildBreadcrumbSchema(page);
  if (breadcrumb) graph.push(breadcrumb);

  return { "@context": "https://schema.org", "@graph": graph };
}

function applyMetadata(template, page) {
  let html = template;
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const canonical = escapeHtml(page.canonical);
  const robots = escapeHtml(page.robots);
  const isArticle = page.schemaType === "article";
  const isPublicMarketingPage =
    page.robots === INDEX_ROBOTS && page.canonical.startsWith(MARKETING_ORIGIN);

  if (isPublicMarketingPage) {
    html = removeInstallMetadata(html);
  }

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
  html = replaceOrInsert(
    html,
    /<link\s+rel=["']author["'][^>]*>/i,
    `<link rel="author" href="${DEVELOPER_ORIGIN}/" />`,
  );

  const socialTags = [
    [/<meta\s+property=["']og:type["'][^>]*>/i, `<meta property="og:type" content="${isArticle ? "article" : "website"}" />`],
    [/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${title}" />`],
    [/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${description}" />`],
    [/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}" />`],
    [/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${title}" />`],
    [/<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${description}" />`],
  ];

  for (const [pattern, replacement] of socialTags) {
    html = replaceOrInsert(html, pattern, replacement);
  }

  const articlePatterns = [
    /<meta\s+property=["']article:published_time["'][^>]*>\s*/i,
    /<meta\s+property=["']article:modified_time["'][^>]*>\s*/i,
    /<meta\s+property=["']article:author["'][^>]*>\s*/i,
  ];
  for (const pattern of articlePatterns) html = html.replace(pattern, "");

  if (isArticle) {
    const articleTags = [
      `<meta property="article:published_time" content="${escapeHtml(page.datePublished)}" />`,
      `<meta property="article:modified_time" content="${escapeHtml(page.dateModified)}" />`,
      `<meta property="article:author" content="${DEVELOPER_ORIGIN}/" />`,
    ].join("\n  ");
    html = html.replace("</head>", `  ${articleTags}\n  </head>`);
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

for (const [, page] of SEO_ROUTE_ENTRIES) {
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

console.log(`Generated SEO HTML for ${SEO_ROUTE_ENTRIES.length} routes plus 404.html.`);
