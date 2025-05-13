import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { userName, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-8">Carregando...</div>;
  }

  if (userName) {
    return <Navigate to="/dashboard" replace />; // redireciona se já logado
  }

  return <>{children}</>;
};
