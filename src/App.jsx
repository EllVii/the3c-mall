// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Auth
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

// Tutorial
import { TutorialProvider, useTutorial } from "./context/TutorialContext.jsx";
import QuickTutorial from "./assets/components/QuickTutorial.jsx";

// Alpha helper (safe)
import AlphaRouteChip from "./assets/components/AlphaRouteChip.jsx";

// Layouts
import SiteLayout from "./assets/components/layouts/SiteLayout.jsx";
import AppLayout from "./assets/components/layouts/AppLayout.jsx";

// Public pages
import LandingPage from "./pages/LandingPage.jsx";
import Features from "./pages/Features.jsx";
import Pricing from "./pages/Pricing.jsx";
import Login from "./pages/Login.jsx";
import CommentLimitModal from "./pages/CommentLimitModal.jsx";
import TermsOfService from "./pages/TermsOfService.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";

// App pages
import DashboardPage from "./pages/DashboardPage.jsx";
import MealPlannerPage from "./pages/MealPlannerPage.jsx";
import GroceryLabPage from "./pages/GroceryLabPage.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";
import PTModePage from "./pages/PTModePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import Cancel from "./pages/Cancel.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

// Onboarding & navigation
import MapHomeScreen from "./assets/components/MapHomeScreen.jsx";

// App pages (new)
import CommunityPage from "./pages/CommunityPage.jsx";
import FitnessZone from "./pages/FitnessZone.jsx";
import StoreLocatorPage from "./pages/StoreLocatorPage.jsx";

// Recipe Center Pages
import RecipesPage from "./pages/RecipesPage.jsx";
import RecipeDetailPage from "./pages/RecipeDetailPage.jsx";

// Dev/Diagnostic pages
import SupabaseHealthCheck from "./pages/SupabaseHealthCheck.jsx";

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppContent() {
  const { pathname } = useLocation();
  const { showTutorial, completeTutorial } = useTutorial();
  const showAlphaChip = import.meta.env.VITE_ALPHA_CHIP === "1"; // Only show if explicitly enabled
  
  // Check if we're on the .app domain (or localhost for local dev)
  const host = window.location.hostname.toLowerCase();
  const isDotApp = host === "the3cmall.app" || host.endsWith(".the3cmall.app") || host === "localhost" || host === "127.0.0.1";

  useEffect(() => {
    const isDotCom = host === "the3cmall.com" || host.endsWith(".the3cmall.com");
    const marketingRoutes = ["/", "/features", "/pricing"];

    // Redirect .com /app routes to .app domain
    if (isDotCom && pathname.startsWith("/app")) {
      const target = `https://the3cmall.app${pathname}${window.location.search}${window.location.hash}`;
      window.location.replace(target);
      return;
    }

    // Redirect .com login to .app login
    if (isDotCom && pathname === "/login") {
      const target = `https://the3cmall.app/login${window.location.search}${window.location.hash}`;
      window.location.replace(target);
      return;
    }

    // Keep login on .app domain (moved from .com to .app)
    // No redirect needed - login stays on .app

    // Redirect .app marketing routes to /app on .app domain
    if (isDotApp && marketingRoutes.includes(pathname)) {
      const target = `https://the3cmall.app/app${window.location.search}${window.location.hash}`;
      window.location.replace(target);
      return;
    }

    const isAppRoute = pathname.startsWith("/app");
    const isPTMode = pathname.includes("/app/pt") || pathname.includes("trainer") || pathname.includes("pt-dashboard");
    const html = document.documentElement;
    const body = document.body;

    html.classList.toggle("app-mode", isAppRoute && !isPTMode); // Don't set app-mode for PT routes (allows scroll)
    body.classList.toggle("app-mode", isAppRoute && !isPTMode);

    // optional: always jump to top on marketing pages
    if (!isAppRoute) window.scrollTo(0, 0);
  }, [pathname]);

  // Wrap app routes with BetaGate on .app domain
  const appContent = (
    <div className="app-shell">
      {showAlphaChip && <AlphaRouteChip />}

      {/* Quick Tutorial - shows on first load or when triggered from Settings */}
      <QuickTutorial open={showTutorial} onComplete={completeTutorial} />

      <Routes>
        {/* PUBLIC SITE */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/comment-limit" element={<CommentLimitModal />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          
          {/* Dev/Diagnostic Routes */}
          <Route path="/health/supabase" element={<SupabaseHealthCheck />} />
        </Route>

        {/* PRIVATE APP AREA */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MapHomeScreen />} />
          <Route path="directory" element={<MapHomeScreen />} />
          <Route path="map" element={<Navigate to="/app/directory" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="user-profile" element={<UserProfilePage />} />
          <Route path="meal-planner" element={<MealPlannerPage />} />
          <Route path="meal-plans" element={<Navigate to="/app/meal-planner" replace />} />
          <Route path="grocery-lab" element={<GroceryLabPage />} />

          {/* ✅ Cancel inside app */}
          <Route path="cancel" element={<Cancel />} />

          {/* New routes */}
          <Route path="community" element={<CommunityPage />} />
          <Route path="fitness" element={<FitnessZone />} />
          <Route path="stores" element={<StoreLocatorPage />} />
          <Route path="store" element={<Navigate to="/app/stores" replace />} />
          <Route path="stores" element={<StoreLocatorPage />} />

          <Route path="pt" element={<PTModePage />} />

          {/* Recipes */}
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="recipes/:id" element={<RecipeDetailPage />} />

          <Route path="coming-soon" element={<ComingSoon />} />

          {/* keep broken /app links inside app */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>

        {/* GLOBAL CATCH-ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );

  // LIVE MODE: BetaGate removed - all users can access the app
  // (Beta code validation disabled for production launch)
  return appContent;
}

export default function App() {
  return (
    <AuthProvider>
      <TutorialProvider>
        <AppContent />
      </TutorialProvider>
    </AuthProvider>
  );
}
