import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  BedIcon,
  MapIcon,
  ShareIcon,
  EditIcon,
} from "lucide-react";

export function Itinerary() {
  const { id } = useParams();
  const [activeDay, setActiveDay] = useState(1);
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pontosExtras, setPontosExtras] = useState([]);
  const [restaurantes, setRestaurantes] = useState([]);

  const calculateTotalDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end - start;
    return Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
  };

  async function fetchPontosExtras() {
    try {
      const res = await fetch(`http://localhost:3001/api/pontos-extras/${id}`);
      if (!res.ok) throw new Error("Erro ao buscar pontos extras");
      const data = await res.json();
      console.log("Pontos Extras recebidos:", data);
      setPontosExtras(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchPontos(totalDays) {
    console.log("Buscando pontos para o roteiro com ID:", id);
    try {
      const resPontos = await fetch(
        `http://localhost:3001/api/roteiros2/${id}/pontos`
      );
      if (!resPontos.ok) throw new Error("Erro ao buscar pontos do roteiro");
      const data = await resPontos.json();
      console.log("Pontos do Roteiro recebidos:", data);

      const pontosComDia = data.map((ponto, index) => ({
        ...ponto,
        dia: Math.ceil((index + 1) / (data.length / totalDays)),
      }));

      setTripData((prevData) => ({
        ...prevData,
        resultados: pontosComDia,
      }));
    } catch (error) {
      console.error("Erro ao buscar pontos:", error);
    }
  }

  async function fetchClima() {
    try {
      const res = await fetch(`http://localhost:3001/api/clima/${id}`);
      if (!res.ok) throw new Error("Erro ao buscar dados do clima");
      const data = await res.json();
      console.log("Dados do Clima recebidos:", data);
      setTripData((prevData) => ({
        ...prevData,
        clima: data, // Adiciona os dados do clima ao estado da viagem
      }));
    } catch (error) {
      console.error("Erro ao buscar clima:", error);
    }
  }

  async function fetchRestaurantes() {
    try {
      const res = await fetch(
        `http://localhost:3001/api/roteiros2/${id}/restaurantes`
      );
      if (!res.ok) throw new Error("Erro ao buscar restaurantes");
      const data = await res.json();
      console.log("🍽️ Restaurantes recebidos:", data);
      setRestaurantes(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const trip = await fetchTripData();
      if (!trip) return;
      await fetchPontosExtras();
      await fetchRestaurantes();
      await fetchPontos(trip.totalDays);
      await fetchClima();
      setLoading(false);
    };

    fetchData();

    const intervalId = setInterval(fetchData, 100000);
    return () => clearInterval(intervalId);
  }, [id]);

  const fetchTripData = async () => {
    if (!id) {
      console.error("ID do roteiro não definido");
      return null;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/roteiros2/${id}`);
      if (!response.ok) throw new Error("Roteiro não encontrado");
      const data = await response.json();

      const totalDays = calculateTotalDays(data.data_ida, data.data_volta);

      const formattedData = {
        id: data.roteiro_id,
        destination: data.cidade,
        startDate: data.data_ida,
        endDate: data.data_volta,
        budget: "Não definido",
        totalDays: totalDays,
        accommodation: "Não definido",
        weather: "Não disponível",
        itinerary: [],
        resultados: [],
      };

      setTripData(formattedData);
      return formattedData; // ← isso é novo
    } catch (error) {
      console.error(error);
      setTripData(null);
      return null; // ← isso é novo
    }
  };

  if (loading || !tripData) {
    return (
      <div className="flex justify-center items-center h-[30vh]">
        <DotLottieReact
          src="https://lottie.host/bea39de7-5cb4-4972-85da-048547848faf/9uHUvSMkbE.lottie"
          autoplay
          loop
          speed={1}
        />
      </div>
    );
  }

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
                  {tripData.clima &&
                  Array.isArray(tripData.clima) &&
                  tripData.clima.length > 0 ? (
                    tripData.clima.map((clima) => (
                      <li
                        key={clima.data}
                        className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                      >
                        <div className="flex items-center">
                          <span className="h-6 w-6 text-gray-400">
                            {clima.descricao.includes("chuva") ? (
                              <span>🌧️</span>
                            ) : clima.descricao.includes("sol") ? (
                              <span>☀️</span>
                            ) : (
                              <span>☁️</span>
                            )}
                          </span>
                          <span className="ml-3 text-sm text-gray-900">
                            {clima.descricao.startsWith("Possibilidade de ")
                              ? clima.descricao.replace("Possibilidade de ", "")
                              : clima.descricao}
                          </span>
                          <span className="ml-3 text-sm text-gray-900">
                            {`dia ${new Date(clima.data).getDate()}`}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">
                            Min: {clima.temp_min}°C, Max: {clima.temp_max}°C
                          </span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">
                      Nenhuma previsão do tempo disponível.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  {Array.from({ length: tripData.totalDays }).map(
                    (_, index) => {
                      const day = index + 1;
                      return (
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
                      );
                    }
                  )}
                </nav>
              </div>
              <div className="px-4 py-5 sm:p-6">
                {tripData.resultados
                  ?.filter(
                    (p) =>
                      p.dia === activeDay &&
                      p.ponto_tipo !== "restaurante" &&
                      p.tipo !== "restaurante"
                  )
                  .map((ponto) => (
                    <div key={ponto.id} className="mb-4">
                      <h3 className="text-xl font-semibold">
                        {ponto.ponto_nome || ponto.nome}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Endereço: {ponto.ponto_endereco || ponto.endereco}
                      </p>
                    </div>
                  ))}

                <ul className="space-y-4 max-h-64 overflow-y-auto">
                  {restaurantes.map((rest) => (
                    <li key={rest.id} className="border rounded p-4 bg-gray-50">
                      <h3 className="text-xl font-semibold">{rest.nome}</h3>

                      {(rest.serve_cafe ||
                        rest.serve_almoco ||
                        rest.serve_jantar) && (
                        <p className="text-sm text-green-700 mt-1">
                          Refeições disponíveis:{" "}
                          {[
                            rest.serve_cafe ? "Café da manhã" : null,
                            rest.serve_almoco ? "Almoço" : null,
                            rest.serve_jantar ? "Jantar" : null,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}

                      {rest.endereco && (
                        <p>
                          <strong>Endereço:</strong> {rest.endereco}
                        </p>
                      )}
                      {rest.rating && (
                        <p>
                          <strong>Avaliação:</strong> {rest.rating} ⭐
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10">
              <ul className="space-y-4">
                {tripData.resultados
                  ?.filter((ponto) => ponto.dia === activeDay)
                  .map((ponto) => (
                    <li key={ponto.id}>
                      {/* <h3 className="text-xl font-semibold">
                        {ponto.ponto_nome || "Sem nome"}
                      </h3>
                      {ponto.ponto_endereco && (
                        <p className="text-sm text-gray-600">
                          Endereço: {ponto.ponto_endereco}
                        </p>
                      )} */}
                    </li>
                  ))}
              </ul>
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

            <div className="mt-6 bg-white shadow overflow-hidden rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Pontos Extras do Roteiro
              </h2>
              {pontosExtras.length === 0 ? (
                <p className="text-gray-500">
                  Nenhum ponto extra encontrado para este roteiro.
                </p>
              ) : (
                <ul className="space-y-4 max-h-64 overflow-y-auto">
                  {pontosExtras.map((ponto) => (
                    <li
                      key={ponto.id}
                      className="border rounded p-4 bg-gray-50"
                    >
                      <h3 className="text-xl font-semibold">
                        {ponto.nome || "Sem nome"}
                      </h3>

                      {ponto.endereco && (
                        <p>
                          <strong>Endereço:</strong> {ponto.endereco}
                        </p>
                      )}

                      {ponto.wikidata && (
                        <p>
                          <strong>Wikidata:</strong>{" "}
                          <a
                            href={`https://www.wikidata.org/wiki/${ponto.wikidata}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline"
                          >
                            {ponto.wikidata}
                          </a>
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
