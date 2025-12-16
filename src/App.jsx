import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import SiteLayout from "./assets/components/layouts/SiteLayout.jsx";
import AppLayout from "./assets/components/layouts/AppLayout.jsx";

// Public pages
import LandingPage from "./pages/LandingPage.jsx";
import Features from "./pages/Features.jsx";
import Pricing from "./pages/Pricing.jsx";
import Login from "./pages/Login.jsx";
import Cancel from "./pages/Cancel.jsx"; 
import CommentLimitModal from "./pages/CommentLimitModal.jsx";

// App pages
import DashboardPage from "./pages/DashboardPage.jsx";
import MealPlannerPage from "./pages/MealPlannerPage.jsx";
import GroceryLabPage from "./pages/GroceryLabPage.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";
import PTModePage from "./pages/PTModePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        {/* PUBLIC SITE: Marketing & Auth */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/comment-limit" element={<CommentLimitModal />} />
        </Route>

        {/* PRIVATE APP AREA: Dashboard & Labs */}
        <Route path="/app" element={<AppLayout />}>  
          <Route index element={<DashboardPage />} />  
          <Route path="meal-plans" element={<MealPlannerPage />} />  
          <Route path="grocery-lab" element={<GroceryLabPage />} />  
          <Route path="pt" element={<PTModePage />} />  
          <Route path="settings" element={<SettingsPage />} />
          <Route path="coming-soon" element={<ComingSoon />} />
          
          {/* INTERNAL CATCH-ALL: 
              If inside /app/something-wrong, stay in /app instead of bouncing to landing */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>  

        {/* GLOBAL CATCH-ALL: Send fully broken links to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />  
      </Routes>  
    </div>
  );
}