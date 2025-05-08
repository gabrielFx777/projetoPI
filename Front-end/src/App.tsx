import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Usando o PrivateRoute para proteger essas rotas */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/plan-trip"
                element={
                  <PrivateRoute>
                    <PlanTrip />
                  </PrivateRoute>
                }
              />
              <Route
                path="/itinerary/:id"
                element={
                  <PrivateRoute>
                    <Itinerary />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
