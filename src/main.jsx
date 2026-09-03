import { registerSW } from "virtual:pwa-register";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// Import theme utilities
import { applyTheme, getThemeId } from "./utils/Settings/theme.js";

// Import ErrorBoundary for crash handling
import ErrorBoundary from "./assets/components/ErrorBoundary.jsx";

const UPDATE_READY_EVENT = "3c:pwa-update-ready";
const APPLY_UPDATE_EVENT = "3c:pwa-apply-update";
const host = window.location.hostname.toLowerCase();
const isAppInstallHost =
  host === "the3cmall.app" ||
  host.endsWith(".the3cmall.app") ||
  host === "localhost" ||
  host === "127.0.0.1";

// Initialize the theme before the app renders to prevent white flickering
applyTheme(getThemeId());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);

// PWA installation and update caching belongs to the secure app host. Keeping
// the marketing host free of an app service worker avoids turning public SEO
// pages into a second install surface with a different origin.
if (isAppInstallHost) {
  const updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh() {
      window.dispatchEvent(new Event(UPDATE_READY_EVENT));
    },
    onRegisteredSW(_swUrl, registration) {
      registration?.update().catch((error) => {
        console.warn("Service worker update check failed", error);
      });
    },
  });

  window.addEventListener(APPLY_UPDATE_EVENT, () => {
    updateServiceWorker(true).catch((error) => {
      console.warn("Service worker update failed", error);
    });
  });
}
