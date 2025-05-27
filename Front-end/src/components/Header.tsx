import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MenuIcon, XIcon, GlobeIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Link as ScrollLink } from "react-scroll";

export function Header() {
  const { userName, setUserName } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserName(parsedUser.nome);
      } catch {
        setUserName(null);
      }
    } else {
      setUserName(null);
    }
  }, [setUserName]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUserName(null);
    navigate("/");
  };

  return (
    <header
      className="bg-white sticky top-0 z-50"
      style={{ boxShadow: "0 35px 60px -15px rgba(0, 0, 0, 0.3)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo e navegação principal */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <GlobeIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                TravelPlan
              </span>
            </Link>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium"
              >
                Início
              </Link>
              <Link
                to="/plan-trip"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium"
              >
                Planejar Viagem
              </Link>
              <ScrollLink
                to="features"
                smooth={true}
                offset={-70}
                duration={500}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium cursor-pointer"
              >
                Recursos
              </ScrollLink>
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium"
              >
                Visão Geral
              </Link>
            </nav>
          </div>

          {/* Área de login / perfil */}
          <div className="hidden md:flex items-center space-x-4">
            {userName ? (
              <>
                <span className="text-sm font-medium text-gray-700">
                  Olá, {userName}
                </span>
                <Link
                  to="/edit-profile"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md"
                >
                  Editar Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md"
                >
                  Logoff
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          {/* Botão de menu mobile */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600"
            >
              Início
            </Link>
            <Link
              to="/plan-trip"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600"
            >
              Planejar Viagem
            </Link>
            <Link
              to="/#features"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600"
            >
              Recursos
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600"
            >
              Dashboard
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 px-2 space-y-1">
            {userName ? (
              <>
                <span className="block px-3 py-2 text-base font-medium text-gray-700">
                  Olá, {userName}
                </span>
                <Link
                  to="/edit-profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-blue-500 hover:bg-blue-600"
                >
                  Editar Perfil
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-red-500 hover:bg-red-600"
                >
                  Logoff
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
