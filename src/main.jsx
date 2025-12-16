import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// Import theme utilities
import { applyTheme, getThemeId } from "./utils/Settings/theme.js";

// Initialize the theme before the app renders to prevent white flickering
applyTheme(getThemeId());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);