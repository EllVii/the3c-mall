// src/App.jsx
import { Routes, Route } from "react-router-dom";

// Layouts
import SiteLayout from "./assets/components/layouts/SiteLayout.jsx";
import AppLayout from "./assets/components/layouts/AppLayout.jsx";

// Public / marketing pages
import LandingPage from "./pages/LandingPage.jsx";
import Features from "./pages/Features.jsx";
import Pricing from "./pages/Pricing.jsx";
import Login from "./pages/Login.jsx";
import Cancel from "./pages/Cancel.jsx";
import CommentLimitModal from "./pages/CommentLimitModal.jsx";

// App pages (inside the mall)
import DashboardPage from "./pages/DashboardPage.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";
import MealPlannerPage from "./pages/MealPlannerPage.jsx";
import GroceryLabPage from "./pages/GroceryLabPage.jsx"; // ✅ NEW

function App() {
  return (
    <div className="app-shell">
      <Routes>
        {/* Public site (marketing shell) */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />

          {/* New public-facing pages */}
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/comment-limit" element={<CommentLimitModal />} />
        </Route>

        {/* App area (logged-in mall) */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="coming-soon" element={<ComingSoon />} />
          <Route path="meal-plans" element={<MealPlannerPage />} />
          <Route path="grocery-lab" element={<GroceryLabPage />} /> {/* ✅ NEW */}
        </Route>
      </Routes>
    </div>
  );
}

export default App;
