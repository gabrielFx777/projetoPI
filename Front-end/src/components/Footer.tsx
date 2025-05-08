import React from 'react';
import { Link } from 'react-router-dom';
import { GlobeIcon, InstagramIcon, TwitterIcon, FacebookIcon } from 'lucide-react';
export function Footer() {
  return <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="mb-8 md:mb-0">
            <Link to="/" className="flex items-center">
              <GlobeIcon className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">TravelPlan</span>
            </Link>
            <p className="mt-4 text-sm text-gray-300">
              Planeje suas viagens de forma inteligente com nossa plataforma que
              otimiza seu roteiro baseado em suas preferências.
            </p>
            <div className="flex mt-6 space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <TwitterIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
              Plataforma
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/plan-trip" className="text-gray-400 hover:text-white text-sm">
                  Planejar Viagem
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">
                  Meus Roteiros
                </Link>
              </li>
              <li>
                <Link to="/#features" className="text-gray-400 hover:text-white text-sm">
                  Recursos
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className="text-gray-400 hover:text-white text-sm">
                  Planos Premium
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
              Suporte
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="#" className="text-gray-400 hover:text-white text-sm">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white text-sm">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white text-sm">
                  Perguntas Frequentes
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="#" className="text-gray-400 hover:text-white text-sm">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white text-sm">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white text-sm">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} TravelPlan. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>;
}