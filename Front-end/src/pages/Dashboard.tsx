import React, { useEffect, useState } from "react";
import axios from "axios"; // certifique-se de instalar: npm install axios
import { Link } from "react-router-dom";
import {
  PlusIcon,
  CalendarIcon,
  DollarSignIcon,
  DownloadIcon,
  ShareIcon,
} from "lucide-react";

export function Dashboard() {
  const [trips, setTrips] = useState([]);
  const user = JSON.parse(localStorage.getItem("user")); // Recupera o usuário do localStorage

  // Buscar dados do backend ao carregar o componente
  useEffect(() => {
    async function fetchTrips() {
      try {
        if (!user || !user.id) {
          console.error("Usuário não autenticado ou ID não encontrado.");
          return;
        }
        const response = await axios.get(
          `http://localhost:3001/api/roteiros?usuarioId=${user.id}`
        ); // Passa o usuarioId
        console.log(response.data);
        if (Array.isArray(response.data.roteiros)) {
          setTrips(response.data.roteiros);
        } else {
          console.error("Resposta não é um array:", response.data);
        }
      } catch (error) {
        console.error("Erro ao buscar viagens:", error);
      }
    }
    fetchTrips();
  }, [user]);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Meu Painel</h1>
          <Link
            to="/plan-trip"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nova Viagem
          </Link>
        </div>
        <div className="mt-8 bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Resumo
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <CalendarIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Viagens Planejadas
                        </dt>
                        <dd className="text-xl font-semibold text-gray-900">
                          {
                            trips.filter((trip) => trip.status === "planejada")
                              .length
                          }
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <DollarSignIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Viagens Completas
                        </dt>
                        <dd className="text-xl font-semibold text-gray-900">
                          {
                            trips.filter((trip) => trip.status === "completa")
                              .length
                          }
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              {/* Mais cartões como o acima */}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Minhas Viagens
            </h2>
            <div className="flex space-x-3">
              <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option>Todas</option>
                <option>Planejadas</option>
                <option>Completas</option>
              </select>
              <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option>Mais recentes</option>
                <option>Mais antigas</option>
                <option>Maior orçamento</option>
                <option>Menor orçamento</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="h-48 w-full overflow-hidden"></div>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {trip.cidade}
                  </h3>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <span>
                      {new Date(trip.data_ida).toLocaleDateString("pt-BR")} -{" "}
                      {new Date(trip.data_volta).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <DollarSignIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <span>{trip.orcamento}</span>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trip.status === "planejada"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {trip.status === "planejada" ? "Planejada" : "Completa"}
                    </span>
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                        <DownloadIcon className="h-4 w-4" />
                      </button>
                      <button className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                        <ShareIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/itinerary/${trip.id}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 w-full justify-center"
                    >
                      Ver Roteiro
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            <div className="bg-white overflow-hidden shadow rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <PlusIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Planejar nova viagem
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece a planejar sua próxima aventura
              </p>
              <div className="mt-6">
                <Link
                  to="/plan-trip"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Nova Viagem
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
