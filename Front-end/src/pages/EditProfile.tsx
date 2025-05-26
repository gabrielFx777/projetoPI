import React, { useState } from 'react'
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  CameraIcon,
  BellIcon,
  GlobeIcon,
  PaletteIcon,
} from 'lucide-react'
export function EditProfile() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 98765-4321',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    notifications: {
      email: true,
      push: true,
      trips: true,
      offers: false,
    },
    theme: 'light',
  })
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setFormData((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [name]: checkbox.checked,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulação de atualização
    setTimeout(() => {
      setLoading(false)
      alert('Perfil atualizado com sucesso!')
    }, 1000)
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Editar Perfil
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Atualize suas informações pessoais e preferências
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Foto do Perfil */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={formData.avatar}
                    alt="Foto do perfil"
                    className="h-24 w-24 rounded-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 border border-gray-300 shadow-sm hover:bg-gray-50"
                  >
                    <CameraIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Foto do Perfil
                  </h3>
                  <p className="text-sm text-gray-500">
                    JPG ou PNG. Tamanho máximo de 1MB.
                  </p>
                </div>
              </div>
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nome completo
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MailIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Telefone
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="language"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Idioma
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GlobeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="language"
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Preferências */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Preferências
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="theme"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Tema
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PaletteIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="theme"
                        name="theme"
                        value={formData.theme}
                        onChange={handleChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                      >
                        <option value="light">Claro</option>
                        <option value="dark">Escuro</option>
                        <option value="system">Sistema</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Notificações
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          id="notifications-email"
                          name="email"
                          type="checkbox"
                          checked={formData.notifications.email}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="notifications-email"
                          className="ml-3 text-sm text-gray-700"
                        >
                          Receber notificações por email
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="notifications-push"
                          name="push"
                          type="checkbox"
                          checked={formData.notifications.push}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="notifications-push"
                          className="ml-3 text-sm text-gray-700"
                        >
                          Receber notificações push
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="notifications-trips"
                          name="trips"
                          type="checkbox"
                          checked={formData.notifications.trips}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="notifications-trips"
                          className="ml-3 text-sm text-gray-700"
                        >
                          Atualizações de viagens
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="notifications-offers"
                          name="offers"
                          type="checkbox"
                          checked={formData.notifications.offers}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="notifications-offers"
                          className="ml-3 text-sm text-gray-700"
                        >
                          Ofertas e promoções
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Botões */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
