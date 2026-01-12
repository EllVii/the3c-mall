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

// Initialize the theme before the app renders to prevent white flickering
applyTheme(getThemeId());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
registerSW({ immediate: true });
