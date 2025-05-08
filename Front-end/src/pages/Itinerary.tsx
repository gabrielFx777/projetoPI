import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  UmbrellaIcon,
  CloudIcon,
  SunIcon,
  UtensilsIcon,
  BedIcon,
  MapIcon,
  CarIcon,
  LandmarkIcon,
  DownloadIcon,
  ShareIcon,
  EditIcon,
} from "lucide-react";
export function Itinerary() {
  const { id } = useParams<{
    id: string;
  }>();
  const [activeDay, setActiveDay] = useState(1);
  const tripData = {
    id,
    destination: "Paris, França",
    startDate: "2023-10-15",
    endDate: "2023-10-22",
    budget: "R$ 10.000",
    totalDays: 8,
    accommodation: "Hotel Le Marais",
    weather: [
      {
        day: 1,
        temp: "18°C",
        condition: "Ensolarado",
        icon: SunIcon,
      },
      {
        day: 2,
        temp: "17°C",
        condition: "Parcialmente nublado",
        icon: CloudIcon,
      },
      {
        day: 3,
        temp: "16°C",
        condition: "Nublado",
        icon: CloudIcon,
      },
      {
        day: 4,
        temp: "19°C",
        condition: "Ensolarado",
        icon: SunIcon,
      },
      {
        day: 5,
        temp: "18°C",
        condition: "Parcialmente nublado",
        icon: CloudIcon,
      },
      {
        day: 6,
        temp: "16°C",
        condition: "Chuvoso",
        icon: UmbrellaIcon,
      },
      {
        day: 7,
        temp: "15°C",
        condition: "Chuvoso",
        icon: UmbrellaIcon,
      },
      {
        day: 8,
        temp: "17°C",
        condition: "Ensolarado",
        icon: SunIcon,
      },
    ],
    itinerary: [
      {
        day: 1,
        date: "15/10/2023",
        activities: [
          {
            time: "09:00",
            title: "Check-in no Hotel",
            description: "Hotel Le Marais, Rua Saint-Louis, 14",
            type: "accommodation",
            icon: BedIcon,
          },
          {
            time: "11:00",
            title: "Tour pela Torre Eiffel",
            description: "Visita guiada com ingresso sem fila",
            type: "attraction",
            icon: LandmarkIcon,
          },
          {
            time: "13:30",
            title: "Almoço no Le Jules Verne",
            description: "Restaurante na Torre Eiffel com vista panorâmica",
            type: "food",
            icon: UtensilsIcon,
          },
          {
            time: "16:00",
            title: "Passeio de barco pelo Rio Sena",
            description: "Tour de 1 hora pelos principais pontos turísticos",
            type: "attraction",
            icon: MapIcon,
          },
          {
            time: "19:00",
            title: "Jantar no Le Petit Prince",
            description: "Restaurante tradicional francês",
            type: "food",
            icon: UtensilsIcon,
          },
        ],
      },
      {
        day: 2,
        date: "16/10/2023",
        activities: [
          {
            time: "08:30",
            title: "Café da manhã no hotel",
            description: "Buffet continental",
            type: "food",
            icon: UtensilsIcon,
          },
          {
            time: "10:00",
            title: "Visita ao Museu do Louvre",
            description: "Ingresso com horário marcado",
            type: "attraction",
            icon: LandmarkIcon,
          },
          {
            time: "13:00",
            title: "Almoço no Café Marly",
            description: "Restaurante com vista para a pirâmide do Louvre",
            type: "food",
            icon: UtensilsIcon,
          },
          {
            time: "15:00",
            title: "Jardim de Tuileries",
            description: "Passeio pelos jardins históricos",
            type: "attraction",
            icon: MapIcon,
          },
          {
            time: "17:30",
            title: "Arco do Triunfo",
            description: "Subida ao topo para vista panorâmica",
            type: "attraction",
            icon: LandmarkIcon,
          },
          {
            time: "20:00",
            title: "Jantar na Champs-Élysées",
            description: "Restaurante Ladurée",
            type: "food",
            icon: UtensilsIcon,
          },
        ],
      },
    ],
  };
  const getActivityColor = (type: string) => {
    switch (type) {
      case "accommodation":
        return "bg-blue-100 border-blue-200";
      case "attraction":
        return "bg-green-100 border-green-200";
      case "food":
        return "bg-yellow-100 border-yellow-200";
      case "transport":
        return "bg-purple-100 border-purple-200";
      default:
        return "bg-gray-100 border-gray-200";
    }
  };
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {tripData.destination}
            </h1>
            <p className="mt-2 flex items-center text-sm text-gray-500">
              <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              {new Date(tripData.startDate).toLocaleDateString("pt-BR")} -{" "}
              {new Date(tripData.endDate).toLocaleDateString("pt-BR")}(
              {tripData.totalDays} dias)
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <DownloadIcon className="mr-2 h-4 w-4" />
              PDF
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <ShareIcon className="mr-2 h-4 w-4" />
              Compartilhar
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              <EditIcon className="mr-2 h-4 w-4" />
              Editar
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="col-span-1">
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Informações da Viagem
                </h2>
                <dl className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <dt className="flex-shrink-0">
                      <MapPinIcon className="h-6 w-6 text-gray-400" />
                    </dt>
                    <dd className="ml-3 text-sm text-gray-900">
                      {tripData.destination}
                    </dd>
                  </div>
                  <div className="flex items-center">
                    <dt className="flex-shrink-0">
                      <CalendarIcon className="h-6 w-6 text-gray-400" />
                    </dt>
                    <dd className="ml-3 text-sm text-gray-900">
                      {new Date(tripData.startDate).toLocaleDateString("pt-BR")}{" "}
                      - {new Date(tripData.endDate).toLocaleDateString("pt-BR")}
                    </dd>
                  </div>
                  <div className="flex items-center">
                    <dt className="flex-shrink-0">
                      <ClockIcon className="h-6 w-6 text-gray-400" />
                    </dt>
                    <dd className="ml-3 text-sm text-gray-900">
                      {tripData.totalDays} dias
                    </dd>
                  </div>
                  <div className="flex items-center">
                    <dt className="flex-shrink-0">
                      <DollarSignIcon className="h-6 w-6 text-gray-400" />
                    </dt>
                    <dd className="ml-3 text-sm text-gray-900">
                      {tripData.budget}
                    </dd>
                  </div>
                  <div className="flex items-center">
                    <dt className="flex-shrink-0">
                      <BedIcon className="h-6 w-6 text-gray-400" />
                    </dt>
                    <dd className="ml-3 text-sm text-gray-900">
                      {tripData.accommodation}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Previsão do Tempo
                </h2>
                <ul className="mt-4 space-y-3">
                  {tripData.weather.map((day) => (
                    <li
                      key={day.day}
                      className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                    >
                      <div className="flex items-center">
                        <day.icon className="h-6 w-6 text-gray-400" />
                        <span className="ml-3 text-sm text-gray-900">
                          Dia {day.day}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{day.temp}</span>
                        <span className="ml-2 text-gray-500">
                          {day.condition}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900">Legenda</h2>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-center">
                    <span className="w-4 h-4 bg-blue-100 border border-blue-200 rounded-full"></span>
                    <span className="ml-3 text-sm text-gray-900">
                      Hospedagem
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-4 h-4 bg-green-100 border border-green-200 rounded-full"></span>
                    <span className="ml-3 text-sm text-gray-900">Atrações</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded-full"></span>
                    <span className="ml-3 text-sm text-gray-900">
                      Refeições
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-4 h-4 bg-purple-100 border border-purple-200 rounded-full"></span>
                    <span className="ml-3 text-sm text-gray-900">
                      Transporte
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  {Array.from(
                    {
                      length: tripData.totalDays,
                    },
                    (_, i) => i + 1
                  ).map((day) => (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                        activeDay === day
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Dia {day}
                      <span className="block text-xs text-gray-500">
                        {new Date(
                          new Date(tripData.startDate).getTime() +
                            (day - 1) * 24 * 60 * 60 * 1000
                        ).toLocaleDateString("pt-BR", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
              <div className="px-4 py-5 sm:p-6">
                {tripData.itinerary
                  .filter((day) => day.day === activeDay)
                  .map((day) => (
                    <div key={day.day}>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-medium text-gray-900">
                          Dia {day.day} - {day.date}
                        </h2>
                        <div className="flex items-center">
                          {(() => {
                            const weatherData = tripData.weather.find(
                              (w) => w.day === day.day
                            );
                            if (weatherData && weatherData.icon) {
                              const WeatherIcon = weatherData.icon;
                              return (
                                <>
                                  <WeatherIcon className="h-5 w-5 text-gray-400" />
                                  <span className="ml-2 text-sm text-gray-500">
                                    {weatherData.temp} - {weatherData.condition}
                                  </span>
                                </>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute top-0 bottom-0 left-7 border-l-2 border-gray-200"></div>
                        <ul className="space-y-6">
                          {day.activities.map((activity, idx) => (
                            <li key={idx} className="relative">
                              <div className="flex items-start">
                                <div className="flex-shrink-0 h-14">
                                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white border-2 border-gray-200 z-10 relative">
                                    <span className="text-sm font-medium text-gray-700">
                                      {activity.time}
                                    </span>
                                  </div>
                                </div>
                                <div
                                  className={`ml-4 p-4 rounded-lg border ${getActivityColor(
                                    activity.type
                                  )} flex-grow`}
                                >
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">
                                      {activity.title}
                                    </h3>
                                    <activity.icon className="h-5 w-5 text-gray-500" />
                                  </div>
                                  <p className="mt-1 text-sm text-gray-600">
                                    {activity.description}
                                  </p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Mapa do Dia
                </h2>
                <div className="bg-gray-200 h-80 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Mapa interativo seria exibido aqui com os pontos do
                      roteiro
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
