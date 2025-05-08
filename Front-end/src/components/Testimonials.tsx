import React from 'react';
export function Testimonials() {
  const testimonials = [{
    content: 'O TravelPlan revolucionou a forma como planejo minhas viagens. Economizei tempo e dinheiro com as sugestões inteligentes.',
    author: 'Ana Silva',
    role: 'Viajante frequente',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }, {
    content: 'Consegui organizar uma viagem em família para a Europa sem estresse. O roteiro otimizado nos permitiu aproveitar cada momento.',
    author: 'Carlos Mendes',
    role: 'Pai de família',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }, {
    content: 'Como mochileira, sempre busco otimizar meu orçamento. O TravelPlan me ajudou a encontrar as melhores opções dentro do meu limite financeiro.',
    author: 'Juliana Costa',
    role: 'Mochileira',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }];
  return <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">
            Depoimentos
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            O que nossos usuários dizem
          </p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <p className="text-gray-600 italic mb-6">
                "{testimonial.content}"
              </p>
              <div className="flex items-center">
                <img src={testimonial.image} alt={testimonial.author} className="h-12 w-12 rounded-full object-cover" />
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    {testimonial.author}
                  </h4>
                  <p className="text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
}