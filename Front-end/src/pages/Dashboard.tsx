import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import {
  PlusIcon,
  MapIcon,
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  UsersIcon,
  StarIcon,
  DownloadIcon,
  ShareIcon,
} from "lucide-react";

export function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [cityImages, setCityImages] = useState({}); // Estado para armazenar imagens das cidades
  const user = JSON.parse(localStorage.getItem("user")); // Recupera o usuário do localStorage
  const [plannedTripsCount, setPlannedTripsCount] = useState(0);
  const fakeTrips = [
    {
      id: 1,
      cidade: "Nova York",
      data_ida: "2025-06-10",
      data_volta: "2025-06-20",
      orcamento: 2500,
      status: "planejada",
    },
    {
      id: 2,
      cidade: "Grécia",
      data_ida: "2025-07-01",
      data_volta: "2025-07-05",
      orcamento: 1200,
      status: "completa",
    },
  ];

  // Buscar dados do backend ao carregar o componente
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrips() {
      setLoading(true); // inicia carregamento
      if (!user || !user.id) {
        setTrips(fakeTrips);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://projetopi-1.onrender.com/api/roteiros2?usuarioId=${user.id}`
        );
        if (Array.isArray(response.data.roteiros2)) {
          setTrips(response.data.roteiros2);
        }
      } catch (error) {
        console.error("Erro ao buscar viagens:", error);
      } finally {
        setLoading(false); // finaliza carregamento
      }
    }

    fetchTrips();
  }, []);

  // Função para buscar a imagem da cidade
  const fetchCityImage = async (cidade) => {
    try {
      const response = await axios.get(
        `https://projetopi-1.onrender.com/api/cidade-imagem?cidade=${cidade}`
      );
      setCityImages((prevState) => ({
        ...prevState,
        [cidade]: response.data.imagemUrl, // Armazena a imagem pela chave da cidade
      }));
    } catch (error) {
      console.error("Erro ao buscar imagem da cidade:", error);
    }
  };

  function formatarDataISO(isoString: string) {
    const [ano, mes, dia] = isoString.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  }

  // Chama a função de buscar imagem para cada cidade das viagens quando a lista de viagens mudar
  useEffect(() => {
    if (trips.length > 0) {
      trips.forEach((trip) => {
        if (!cityImages[trip.cidade]) {
          // Evita buscar imagens novamente se já estiver no estado
          fetchCityImage(trip.cidade);
        }
      });
    }
  }, [trips, cityImages]);

  return (
    <div className="bg-gray-50 min-h-screen py-8 mt-10">
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
                      <MapIcon className="h-6 w-6 text-blue-600" />
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
                      <CalendarIcon className="h-6 w-6 text-green-600" />
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

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Carregando viagens...</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <div
                  key={trip.roteiro_id}
                  className="bg-white overflow-hidden shadow-xl rounded-lg"
                >
                  {cityImages[trip.cidade] && (
                    <img
                      src={cityImages[trip.cidade]}
                      alt={`Imagem de ${trip.cidade}`}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {trip.cidade}
                    </h3>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <span>
                        {formatarDataISO(trip.data_ida)} -{" "}
                        {formatarDataISO(trip.data_volta)}
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
                            : trip.status === "em progresso"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {trip.status === "planejada"
                          ? "Planejada"
                          : trip.status === "em progresso"
                          ? "Em Progresso"
                          : "Completa"}
                      </span>
                      <div className="flex space-x-2">
                        <button className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                          <DownloadIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link
                        to={`/itinerary/${trip.roteiro_id}`} // Passa a cidade como parâmetro
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
          )}
        </div>
      </div>
    </div>
  );
}
