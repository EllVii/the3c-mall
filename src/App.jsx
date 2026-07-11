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
import ResetPassword from "./pages/ResetPassword.jsx";
import CommentLimitModal from "./pages/CommentLimitModal.jsx";
import TermsOfService from "./pages/TermsOfService.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";

// App pages
import DashboardPage from "./pages/DashboardPage.jsx";
import MealPlannerPage from "./pages/MealPlannerPage.jsx";
import GroceryLabPage from "./pages/GroceryLabPage.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";
import PTModePage from "./pages/PTModePage.jsx";
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
import D1HealthCheck from "./pages/D1HealthCheck.jsx";

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
  const showAlphaChip = import.meta.env.VITE_ALPHA_CHIP === "1";

  const host = window.location.hostname.toLowerCase();
  const isDotApp = host === "the3cmall.app" || host.endsWith(".the3cmall.app") || host === "localhost" || host === "127.0.0.1";

  useEffect(() => {
    const isDotCom = host === "the3cmall.com" || host.endsWith(".the3cmall.com");
    const marketingRoutes = ["/", "/features", "/pricing"];

    if (isDotCom && pathname.startsWith("/app")) {
      const target = `https://the3cmall.app${pathname}${window.location.search}${window.location.hash}`;
      window.location.replace(target);
      return;
    }

    if (isDotCom && pathname === "/login") {
      const target = `https://the3cmall.app/login${window.location.search}${window.location.hash}`;
      window.location.replace(target);
      return;
    }

    if (isDotApp && marketingRoutes.includes(pathname)) {
      const target = `https://the3cmall.app/app${window.location.search}${window.location.hash}`;
      window.location.replace(target);
      return;
    }

    const isAppRoute = pathname.startsWith("/app");
    const isPTMode = pathname.includes("/app/pt") || pathname.includes("trainer") || pathname.includes("pt-dashboard");
    const html = document.documentElement;
    const body = document.body;

    html.classList.toggle("app-mode", isAppRoute && !isPTMode);
    body.classList.toggle("app-mode", isAppRoute && !isPTMode);

    if (!isAppRoute) window.scrollTo(0, 0);
  }, [pathname, host, isDotApp]);

  const appContent = (
    <div className="app-shell">
      {showAlphaChip && <AlphaRouteChip />}

      <QuickTutorial open={showTutorial} onComplete={completeTutorial} />

      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/comment-limit" element={<CommentLimitModal />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/health/d1" element={<D1HealthCheck />} />
          <Route path="/health/supabase" element={<Navigate to="/health/d1" replace />} />
        </Route>

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
          <Route path="cancel" element={<Cancel />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="fitness" element={<FitnessZone />} />
          <Route path="stores" element={<StoreLocatorPage />} />
          <Route path="store" element={<Navigate to="/app/stores" replace />} />
          <Route path="pt" element={<PTModePage />} />
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="recipes/:id" element={<RecipeDetailPage />} />
          <Route path="coming-soon" element={<ComingSoon />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );

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
