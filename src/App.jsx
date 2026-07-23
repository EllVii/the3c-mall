// src/App.jsx
import React, { lazy, Suspense, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

// Auth
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

// Tutorial
import { TutorialProvider, useTutorial } from "./context/TutorialContext.jsx";

// SEO
import SeoManager from "./assets/components/SeoManager.jsx";

// Load layouts and routes only when they are needed.
const QuickTutorial = lazy(() => import("./assets/components/QuickTutorial.jsx"));
const AlphaRouteChip = lazy(() => import("./assets/components/AlphaRouteChip.jsx"));
const SiteLayout = lazy(() => import("./assets/components/layouts/SiteLayout.jsx"));
const AppLayout = lazy(() => import("./assets/components/layouts/AppLayout.jsx"));

const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const Features = lazy(() => import("./pages/Features.jsx"));
const Pricing = lazy(() => import("./pages/Pricing.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const CommentLimitModal = lazy(() => import("./pages/CommentLimitModal.jsx"));
const TermsOfService = lazy(() => import("./pages/TermsOfService.jsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.jsx"));
const D1HealthCheck = lazy(() => import("./pages/D1HealthCheck.jsx"));

const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx"));
const MealPlannerPage = lazy(() => import("./pages/MealPlannerPage.jsx"));
const GroceryLabPage = lazy(() => import("./pages/GroceryLabPage.jsx"));
const ComingSoon = lazy(() => import("./pages/ComingSoon.jsx"));
const PTModePage = lazy(() => import("./pages/PTModePage.jsx"));
const Cancel = lazy(() => import("./pages/Cancel.jsx"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const PilotStudyPage = lazy(() => import("./pages/PilotStudyPage.jsx"));
const MapHomeScreen = lazy(() => import("./assets/components/MapHomeScreen.jsx"));
const CommunityPage = lazy(() => import("./pages/CommunityPage.jsx"));
const FitnessZone = lazy(() => import("./pages/FitnessZone.jsx"));
const StoreLocatorPage = lazy(() => import("./pages/StoreLocatorPage.jsx"));
const RecipesPage = lazy(() => import("./pages/RecipesPage.jsx"));
const RecipeDetailPage = lazy(() => import("./pages/RecipeDetailPage.jsx"));

function LoadingScreen({ label = "Loading 3C Mall..." }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "1.5rem",
        textAlign: "center",
      }}
    >
      <p>{label}</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen label="Restoring your 3C Mall session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AuthArea() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

function AppContent() {
  const { pathname } = useLocation();
  const { showTutorial, completeTutorial } = useTutorial();
  const showAlphaChip = import.meta.env.VITE_ALPHA_CHIP === "1";
  const isAppPath = pathname.startsWith("/app");

  const host = window.location.hostname.toLowerCase();
  const isDotApp =
    host === "the3cmall.app" ||
    host.endsWith(".the3cmall.app") ||
    host === "localhost" ||
    host === "127.0.0.1";

  useEffect(() => {
    const isDotCom = host === "the3cmall.com" || host.endsWith(".the3cmall.com");
    const marketingRoutes = ["/", "/features", "/pricing"];

    if (isDotCom && pathname.startsWith("/app")) {
      window.location.replace(
        `https://the3cmall.app${pathname}${window.location.search}${window.location.hash}`,
      );
      return;
    }

    if (isDotCom && pathname === "/login") {
      window.location.replace(
        `https://the3cmall.app/login${window.location.search}${window.location.hash}`,
      );
      return;
    }

    if (isDotApp && marketingRoutes.includes(pathname)) {
      window.location.replace(
        `https://the3cmall.app/app${window.location.search}${window.location.hash}`,
      );
      return;
    }

    const isAppRoute = pathname.startsWith("/app");
    const isPTMode =
      pathname.includes("/app/pt") ||
      pathname.includes("trainer") ||
      pathname.includes("pt-dashboard");
    const html = document.documentElement;
    const body = document.body;

    html.classList.toggle("app-mode", isAppRoute && !isPTMode);
    body.classList.toggle("app-mode", isAppRoute && !isPTMode);

    if (!isAppRoute) window.scrollTo(0, 0);
  }, [host, isDotApp, pathname]);

  return (
    <>
      <SeoManager />

      <div className="app-shell">
        {showAlphaChip && (
          <Suspense fallback={null}>
            <AlphaRouteChip />
          </Suspense>
        )}

        {isAppPath && showTutorial && (
          <Suspense fallback={null}>
            <QuickTutorial open={showTutorial} onComplete={completeTutorial} />
          </Suspense>
        )}

        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/comment-limit" element={<CommentLimitModal />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/health/d1" element={<D1HealthCheck />} />
              <Route
                path="/health/supabase"
                element={<Navigate to="/health/d1" replace />}
              />
            </Route>

            <Route element={<AuthArea />}>
              <Route element={<SiteLayout />}>
                <Route path="/login" element={<Login />} />
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
                <Route
                  path="directory"
                  element={<Navigate to="/app" replace />}
                />
                <Route
                  path="map"
                  element={<Navigate to="/app" replace />}
                />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="user-profile" element={<UserProfilePage />} />
                <Route path="meal-planner" element={<MealPlannerPage />} />
                <Route
                  path="meal-plans"
                  element={<Navigate to="/app/meal-planner" replace />}
                />
                <Route path="grocery-lab" element={<GroceryLabPage />} />
                <Route path="cancel" element={<Cancel />} />
                <Route path="community" element={<CommunityPage />} />
                <Route path="fitness" element={<FitnessZone />} />
                <Route path="stores" element={<StoreLocatorPage />} />
                <Route
                  path="store"
                  element={<Navigate to="/app/stores" replace />}
                />
                <Route path="pt" element={<PTModePage />} />
                <Route path="recipes" element={<RecipesPage />} />
                <Route path="recipes/:id" element={<RecipeDetailPage />} />
                <Route path="pilot" element={<PilotStudyPage />} />
                <Route path="coming-soon" element={<ComingSoon />} />
                <Route path="*" element={<Navigate to="/app" replace />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

export default function App() {
  return (
    <TutorialProvider>
      <AppContent />
    </TutorialProvider>
  );
}
