import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MenuIcon, XIcon, GlobeIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Importando o contexto
import { Link as ScrollLink } from 'react-scroll';

export function Header() {
  const { userName, setUserName } = useAuth();  // Usando o contexto para acessar o nome do usuário
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Hook para verificar o usuário no localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserName(parsedUser.nome); // Atualiza o estado global do nome do usuário
      } catch {
        setUserName(null);
      }
    } else {
      setUserName(null); // Caso o usuário não esteja logado
    }
  }, [setUserName]);

  const handleLogout = () => {
    localStorage.removeItem('user');  // Remove o usuário do localStorage
    setUserName(null);  // Limpa o nome do usuário no contexto
    navigate('/');  // Redireciona para a página inicial
  };

  const handleScrollToPricing = () => {
    const section = document.getElementById('pricing');
    if (section) {
      window.scrollTo({
        top: section.offsetTop,
        behavior: 'smooth',
      });
    }
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <GlobeIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">TravelPlan</span>
            </Link>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">Início</Link>
              <Link to="/plan-trip" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">Planejar Viagem</Link>
              <ScrollLink to="features" smooth={true} offset={-70} duration={500} className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium cursor-pointer">Recursos</ScrollLink>
              <ScrollLink to="pricing" smooth={true} offset={-70} duration={500} className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium cursor-pointer">Premium</ScrollLink>
              <Link to="/Dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">Visão Geral</Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center">

            {userName ? (
              <>
                <span className="px-4 py-2 text-sm font-medium text-gray-700"></span>
                <span className="px-4 py-2 text-sm font-medium text-gray-700">Olá, {userName}</span>
                <button onClick={handleLogout} className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md">
                  Logoff
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                  Entrar
                </Link>
                <Link to="/register" className="ml-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none">
              {isMenuOpen ? <XIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Início</Link>
            <Link to="/plan-trip" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Planejar Viagem</Link>
            <Link to="/#features" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Recursos</Link>
            <Link to="/#pricing" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Premium</Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 px-2 space-y-1">
            {userName ? (
              <>
                <span className="block px-3 py-2 text-base font-medium text-gray-700">Olá, {userName}</span>
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-red-500 hover:bg-red-600">
                  Logoff
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Entrar</Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Cadastrar</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
