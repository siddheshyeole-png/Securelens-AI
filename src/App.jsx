import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { ScanProvider } from "./context/ScanContext";

import { MainLayout } from "./layouts/MainLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ProtectedRoute } from "./components/Common/ProtectedRoute";

import { Home } from "./pages/Home/Home";
import { FeaturesPage } from "./pages/Features/FeaturesPage";
import { HowItWorksPage } from "./pages/HowItWorks/HowItWorksPage";
import { Pricing } from "./pages/Pricing/Pricing";
import { About } from "./pages/About/About";
import { Contact } from "./pages/Contact/Contact";
import { Login } from "./pages/Login/Login";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { Upload } from "./pages/Upload/Upload";
import { Analysis } from "./pages/Analysis/Analysis";
import { Report } from "./pages/Report/Report";
import { History } from "./pages/History/History";
import { Profile } from "./pages/Profile/Profile";
import { Settings } from "./pages/Settings/Settings";
import { NotFound } from "./pages/NotFound/NotFound";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes with Header & Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Authentication Layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login />} />
        </Route>

        {/* Protected Authenticated Routes inside Dashboard Layout */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Main Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/upload" element={<Upload />} />
          <Route path="/dashboard/reports" element={<Report />} />
          <Route path="/dashboard/reports/:reportId" element={<Report />} />
          <Route path="/dashboard/analysis" element={<Analysis />} />
          <Route path="/dashboard/analysis/:analysisId" element={<Analysis />} />
          <Route path="/dashboard/history" element={<History />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/settings" element={<Settings />} />

          {/* Alias Protected Routes */}
          <Route path="/upload" element={<Upload />} />
          <Route path="/reports" element={<Report />} />
          <Route path="/report" element={<Report />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ScanProvider>
        <Router>
          <AnimatedRoutes />
        </Router>
      </ScanProvider>
    </AuthProvider>
  );
}

export default App;
