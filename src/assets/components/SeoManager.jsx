import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  APP_ORIGIN,
  DEVELOPER_ORIGIN,
  INDEX_ROBOTS,
  MARKETING_ORIGIN,
  SEO_ROUTES,
  SOCIAL_IMAGE,
} from "../../utils/publicSeoRoutes.js";

const DEVELOPER_ORGANIZATION_ID = `${DEVELOPER_ORIGIN}/#organization`;

function upsertMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function removeMeta(attribute, key) {
  document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove();
}

function upsertCanonical(href) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function upsertAuthorLink(href) {
  let element = document.head.querySelector('link[rel="author"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "author");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function buildBreadcrumbSchema(metadata) {
  if (!metadata.breadcrumbs?.length) return null;

  return {
    "@type": "BreadcrumbList",
    "@id": `${metadata.canonical}#breadcrumb`,
    itemListElement: metadata.breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function buildSchema(metadata) {
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

  const webpageType = metadata.schemaType === "collection" ? "CollectionPage" : "WebPage";
  const webpage = {
    "@type": webpageType,
    "@id": `${metadata.canonical}#webpage`,
    url: metadata.canonical,
    name: metadata.title,
    description: metadata.description,
    isPartOf: { "@id": `${MARKETING_ORIGIN}/#website` },
    about: { "@id": `${APP_ORIGIN}/app#service` },
    creator: { "@id": DEVELOPER_ORGANIZATION_ID },
    breadcrumb: metadata.breadcrumbs?.length
      ? { "@id": `${metadata.canonical}#breadcrumb` }
      : undefined,
  };

  if (metadata.hasPart?.length) {
    webpage.hasPart = metadata.hasPart.map((url) => ({ "@id": `${url}#article` }));
  }

  const graph = [developerOrganization, organization, website, webpage];

  if (metadata.schemaType === "home" || metadata.schemaType === "pricing") {
    graph.push(appService);
  }

  if (metadata.schemaType === "article") {
    const articleId = `${metadata.canonical}#article`;
    webpage.mainEntity = { "@id": articleId };
    graph.push({
      "@type": "Article",
      "@id": articleId,
      headline: metadata.headline,
      description: metadata.description,
      url: metadata.canonical,
      mainEntityOfPage: { "@id": `${metadata.canonical}#webpage` },
      image: SOCIAL_IMAGE,
      datePublished: metadata.datePublished,
      dateModified: metadata.dateModified,
      keywords: metadata.keywords,
      author: { "@id": DEVELOPER_ORGANIZATION_ID },
      publisher: { "@id": `${MARKETING_ORIGIN}/#organization` },
    });
  }

  const breadcrumb = buildBreadcrumbSchema(metadata);
  if (breadcrumb) graph.push(breadcrumb);

  return { "@context": "https://schema.org", "@graph": graph };
}

function updateStructuredData(metadata, indexable) {
  let script = document.getElementById("seo-structured-data");

  if (!indexable) {
    script?.remove();
    return;
  }

  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "seo-structured-data";
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(buildSchema(metadata));
}

export default function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalizedPath = pathname !== "/" ? pathname.replace(/\/$/, "") : "/";
    const metadata = SEO_ROUTES[normalizedPath];
    const indexable = metadata?.robots === INDEX_ROBOTS;
    const isPrivatePath = normalizedPath.startsWith("/app") || normalizedPath === "/login";
    const fallbackTitle = normalizedPath.startsWith("/app") ? "3C Mall App" : "3C Mall";
    const fallbackDescription =
      "Secure access to the 3C Mall meal planning and grocery organization application.";
    const fallbackOrigin = isPrivatePath ? APP_ORIGIN : MARKETING_ORIGIN;
    const fallbackCanonical = `${fallbackOrigin}${normalizedPath || "/"}`;

    const title = metadata?.title || fallbackTitle;
    const description = metadata?.description || fallbackDescription;
    const canonical = metadata?.canonical || fallbackCanonical;
    const robots = metadata?.robots || "noindex, nofollow, noarchive";
    const isArticle = metadata?.schemaType === "article";

    document.title = title;
    document.documentElement.lang = "en-US";

    upsertMeta("name", "description", description);
    upsertMeta("name", "author", "Ell Vii's Automations");
    upsertMeta("name", "robots", robots);
    upsertMeta("name", "googlebot", robots);
    upsertMeta("property", "og:type", isArticle ? "article" : "website");
    upsertMeta("property", "og:site_name", "3C Mall");
    upsertMeta("property", "og:locale", "en_US");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", SOCIAL_IMAGE);
    upsertMeta(
      "property",
      "og:image:alt",
      "3C Mall meal planning and grocery lifestyle application",
    );
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", SOCIAL_IMAGE);

    if (isArticle) {
      upsertMeta("property", "article:published_time", metadata.datePublished);
      upsertMeta("property", "article:modified_time", metadata.dateModified);
      upsertMeta("property", "article:author", `${DEVELOPER_ORIGIN}/`);
    } else {
      removeMeta("property", "article:published_time");
      removeMeta("property", "article:modified_time");
      removeMeta("property", "article:author");
    }

    upsertCanonical(canonical);
    upsertAuthorLink(`${DEVELOPER_ORIGIN}/`);
    updateStructuredData(metadata, indexable);
  }, [pathname]);

  return null;
}
