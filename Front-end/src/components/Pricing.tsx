import React from 'react';
import { CheckIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
export function Pricing() {
  
  const tiers = [{
    name: 'Básico',
    price: 'Grátis',
    description: 'Perfeito para começar a planejar suas viagens.',
    features: ['Planejamento básico de roteiros', 'Até 3 viagens salvas', 'Compartilhamento limitado', 'Sugestões de atrações populares'],
    cta: 'Começar Grátis',
    mostPopular: false
  }, {
    name: 'Premium',
    price: 'R$ 19,90/mês',
    description: 'Ideal para viajantes frequentes que buscam experiências personalizadas.',
    features: ['Tudo do plano básico', 'Viagens ilimitadas', 'Otimização avançada de roteiro', 'Recomendações personalizadas', 'Exportação para PDF', 'Acesso offline', 'Suporte prioritário'],
    cta: 'Assinar Premium',
    mostPopular: true
  }, {
    name: 'Família',
    price: 'R$ 29,90/mês',
    description: 'Para famílias que viajam juntas e querem o melhor planejamento.',
    features: ['Tudo do plano Premium', 'Até 5 contas de usuário', 'Planejamento colaborativo', 'Roteiros para família', 'Sugestões para crianças', 'Descontos exclusivos'],
    cta: 'Assinar Família',
    mostPopular: false
  }];
  return <div id="pricing" className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">
            Planos
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Escolha o plano ideal para suas viagens
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Temos opções para todos os tipos de viajantes, desde os aventureiros
            ocasionais até famílias inteiras.
          </p>
        </div>
        <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
          {tiers.map(tier => <div key={tier.name} className={`relative p-8 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col ${tier.mostPopular ? 'ring-2 ring-blue-600' : ''}`}>
              {tier.mostPopular && <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-0 px-4 py-1 bg-blue-600 rounded-full text-xs font-semibold text-white transform">
                  Mais Popular
                </div>}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {tier.name}
                </h3>
                <p className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {tier.price}
                  </span>
                </p>
                <p className="mt-6 text-gray-500">{tier.description}</p>
                <ul className="mt-6 space-y-4">
                  {tier.features.map(feature => <li key={feature} className="flex">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 text-green-500" />
                      <span className="ml-3 text-gray-500">{feature}</span>
                    </li>)}
                </ul>
              </div>
              <Link to="/register" className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${tier.mostPopular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                {tier.cta}
              </Link>
            </div>)}
        </div>
      </div>
    </div>;
}