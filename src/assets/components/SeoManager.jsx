import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const MARKETING_ORIGIN = "https://the3cmall.com";
const APP_ORIGIN = "https://the3cmall.app";
const SOCIAL_IMAGE = `${MARKETING_ORIGIN}/brand/3c-mall-entrance.jpg`;

const PUBLIC_ROUTES = {
  "/": {
    title: "3C Mall | Smart Meal Planning & Grocery Cost Comparison",
    description:
      "Plan meals, compare grocery costs, organize household shopping, and get guided support with the 3C Mall lifestyle app.",
    canonical: `${MARKETING_ORIGIN}/`,
    schemaType: "home",
  },
  "/features": {
    title: "Meal Planning & Grocery Comparison Features | 3C Mall",
    description:
      "Explore 3C Mall features for guided meal planning, grocery cost comparison, household organization, fitness, and community support.",
    canonical: `${MARKETING_ORIGIN}/features`,
    schemaType: "webpage",
  },
  "/pricing": {
    title: "3C Mall Pricing | Meal Planning and Grocery Tools",
    description:
      "Compare 3C Mall plans for meal planning, estimated grocery comparisons, household profiles, pickup, and optional delivery tools.",
    canonical: `${MARKETING_ORIGIN}/pricing`,
    schemaType: "pricing",
  },
  "/terms": {
    title: "Terms of Service | 3C Mall",
    description:
      "Review the terms that govern access to and use of the 3C Mall website and lifestyle planning application.",
    canonical: `${MARKETING_ORIGIN}/terms`,
    schemaType: "webpage",
  },
  "/privacy": {
    title: "Privacy Policy | 3C Mall",
    description:
      "Learn how 3C Mall handles account, household, grocery planning, and application data.",
    canonical: `${MARKETING_ORIGIN}/privacy`,
    schemaType: "webpage",
  },
};

function upsertMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
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

function buildSchema(metadata) {
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
    description: PUBLIC_ROUTES["/"].description,
    publisher: { "@id": `${MARKETING_ORIGIN}/#organization` },
  };

  const appService = {
    "@type": "Service",
    "@id": `${APP_ORIGIN}/app#service`,
    name: "3C Mall Web Application",
    serviceType: "Meal planning and grocery cost comparison application",
    url: `${APP_ORIGIN}/app`,
    description: PUBLIC_ROUTES["/"].description,
    image: SOCIAL_IMAGE,
    provider: { "@id": `${MARKETING_ORIGIN}/#organization` },
    creator: {
      "@type": "Organization",
      name: "Ell Vii's Automations",
      url: "https://ellviisautomations.com/",
    },
    offers: [
      {
        "@type": "Offer",
        name: "Basic",
        price: "0",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "14.99",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "Family",
        price: "24.99",
        priceCurrency: "USD",
      },
    ],
  };

  const graph = [organization, website];

  if (metadata.schemaType === "home" || metadata.schemaType === "pricing") {
    graph.push(appService);
  }

  if (metadata.schemaType === "webpage" || metadata.schemaType === "pricing") {
    graph.push({
      "@type": "WebPage",
      "@id": `${metadata.canonical}#webpage`,
      url: metadata.canonical,
      name: metadata.title,
      description: metadata.description,
      isPartOf: { "@id": `${MARKETING_ORIGIN}/#website` },
      about: { "@id": `${APP_ORIGIN}/app#service` },
    });
  }

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
    const metadata = PUBLIC_ROUTES[normalizedPath];
    const indexable = Boolean(metadata);
    const fallbackTitle = normalizedPath.startsWith("/app")
      ? "3C Mall App"
      : "3C Mall";
    const fallbackDescription =
      "Secure access to the 3C Mall meal planning and grocery organization application.";
    const fallbackCanonical = `${APP_ORIGIN}${normalizedPath || "/app"}`;

    const title = metadata?.title || fallbackTitle;
    const description = metadata?.description || fallbackDescription;
    const canonical = metadata?.canonical || fallbackCanonical;
    const robots = indexable
      ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      : "noindex, nofollow, noarchive";

    document.title = title;
    document.documentElement.lang = "en-US";

    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", robots);
    upsertMeta("name", "googlebot", robots);
    upsertMeta("property", "og:type", "website");
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
    upsertCanonical(canonical);
    updateStructuredData(metadata, indexable);
  }, [pathname]);

  return null;
}
