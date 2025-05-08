import React from 'react';
import { MapPinIcon, CalendarIcon, DollarSignIcon, CloudIcon, HeartIcon, ShareIcon, DownloadIcon, UserIcon } from 'lucide-react';
export function Features() {
  const features = [{
    name: 'Roteiros Personalizados',
    description: 'Crie roteiros personalizados baseados nas suas preferências, orçamento e tempo disponível.',
    icon: MapPinIcon
  }, {
    name: 'Planejamento Inteligente',
    description: 'Nossa plataforma otimiza automaticamente seu roteiro considerando distâncias, horários e clima.',
    icon: CalendarIcon
  }, {
    name: 'Controle de Orçamento',
    description: 'Monitore seus gastos e mantenha o controle financeiro durante toda a viagem.',
    icon: DollarSignIcon
  }, {
    name: 'Previsão do Tempo',
    description: 'Integração com previsão do tempo para planejar atividades adequadas para cada dia.',
    icon: CloudIcon
  }, {
    name: 'Recomendações Locais',
    description: 'Sugestões de restaurantes, atrações e hotéis com base nas avaliações de outros viajantes.',
    icon: HeartIcon
  }, {
    name: 'Compartilhamento',
    description: 'Compartilhe seus roteiros com amigos e familiares facilmente por link ou redes sociais.',
    icon: ShareIcon
  }, {
    name: 'Modo Offline',
    description: 'Exporte seu roteiro em PDF para acesso offline durante a viagem.',
    icon: DownloadIcon
  }, {
    name: 'Perfil Personalizado',
    description: 'Salve suas preferências para receber recomendações cada vez mais personalizadas.',
    icon: UserIcon
  }];
  return <div id="features" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">
            Recursos
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Tudo que você precisa para uma viagem perfeita
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Nossa plataforma oferece todos os recursos necessários para planejar
            sua viagem do início ao fim.
          </p>
        </div>
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(feature => <div key={feature.name} className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-md shadow-lg">
                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      {feature.name}
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
}