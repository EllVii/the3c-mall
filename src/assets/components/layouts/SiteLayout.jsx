import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { betaMessaging } from "../../../utils/betaMessaging.js";
import "../../../styles/SiteLayout.css";

const MARKETING_ORIGIN = "https://the3cmall.com";
const APP_ORIGIN = "https://the3cmall.app";

const NAV_ITEMS = [
  { label: "Home", href: `${MARKETING_ORIGIN}/`, path: "/" },
  { label: "Features", href: `${MARKETING_ORIGIN}/features`, path: "/features" },
  { label: "Pricing", href: `${MARKETING_ORIGIN}/pricing`, path: "/pricing" },
];

export default function SiteLayout() {
  const { pathname } = useLocation();
  const normalizedPath = pathname !== "/" ? pathname.replace(/\/$/, "") : "/";

  return (
    <div className="site-shell">
      <a className="site-skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header">
        <div className="site-header-inner">
          <a className="site-brand" href={`${MARKETING_ORIGIN}/`} aria-label="3C Mall home">
            <img src="/icons/3c-mall.png" alt="" width="58" height="58" />
            <span>
              <strong>3C Mall</strong>
              <small>Concierge · Cost · Community</small>
            </span>
          </a>

          <nav className="site-nav" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = normalizedPath === item.path;
              return (
                <a
                  key={item.path}
                  href={item.href}
                  className={isActive ? "is-active" : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="site-header-actions">
            <span className="site-beta-status" title={betaMessaging.appBadge.tooltip}>
              {betaMessaging.appBadge.label}
            </span>
            <a className="site-action site-action-secondary" href={`${APP_ORIGIN}/login`}>
              Sign in
            </a>
            <a className="site-action site-action-primary" href={`${MARKETING_ORIGIN}/#beta-access`}>
              Join beta
            </a>
          </div>
        </div>
      </header>

      <main id="main-content" className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="site-footer-brand">
            <strong>3C Mall</strong>
            <span>{betaMessaging.website.footer}</span>
          </div>

          <nav className="site-footer-nav" aria-label="Footer navigation">
            <a href={`${MARKETING_ORIGIN}/features`}>Features</a>
            <a href={`${MARKETING_ORIGIN}/pricing`}>Pricing</a>
            <a href={`${MARKETING_ORIGIN}/privacy`}>Privacy Policy</a>
            <a href={`${MARKETING_ORIGIN}/terms`}>Terms of Service</a>
          </nav>

          <p className="site-developer-credit">
            3C Mall is designed, developed, and supported by{" "}
            <a
              href="https://ellviisautomations.com/"
              target="_blank"
              rel="author external noopener noreferrer"
              aria-label="Ell Vii's Automations website development, automation, CRM, and SEO services"
            >
              Ell Vii&apos;s Automations
            </a>
            , an Arizona website development, automation, CRM, and SEO company.
          </p>
        </div>
      </footer>
    </div>
  );
}
