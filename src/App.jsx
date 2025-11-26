import { Routes, Route } from "react-router-dom";
import SiteLayout from "./components/layouts/SiteLayout";
import AppLayout from "./components/layouts/AppLayout";

import Home from "./pages/Home";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import ComingSoon from "./pages/ComingSoon";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const appInComingSoonMode = false; // set true to lock the app temporarily

  return (
    <Routes>
      {/* Public website */}
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* App */}
      <Route
        path="/app/*"
        element={
          appInComingSoonMode ? (
            <ComingSoon />
          ) : (
            <AppLayout>
              <Dashboard />
            </AppLayout>
          )
        }
      />
    </Routes>
  );
}

export default App;
