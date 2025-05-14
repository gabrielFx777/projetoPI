import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import PlanTrip from "./pages/PlanTrip";
import { Itinerary } from "./pages/Itinerary";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute";
import { PublicRoute } from "./components/PublicRoute";
import { AnimatePresence } from "framer-motion";
import { PageTransitionWithLottie } from "./components/PageTransitionWithLottie";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransitionWithLottie>
              <Home />
            </PageTransitionWithLottie>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <PageTransitionWithLottie>
                <Login />
              </PageTransitionWithLottie>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransitionWithLottie>
              <Register />
            </PageTransitionWithLottie>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PageTransitionWithLottie>
              <Dashboard />
            </PageTransitionWithLottie>
          }
        />
        <Route
          path="/plan-trip"
          element={
            <PrivateRoute>
              <PageTransitionWithLottie>
                <PlanTrip />
              </PageTransitionWithLottie>
            </PrivateRoute>
          }
        />
        <Route
          path="/itinerary/:id"
          element={
            <PrivateRoute>
              <PageTransitionWithLottie>
                <Itinerary />
              </PageTransitionWithLottie>
            </PrivateRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50">
          <Header />
          <main className="flex-grow">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
