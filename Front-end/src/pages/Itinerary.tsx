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
  Trash2Icon,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import localizacaoIcon from "../../imgs/localizacao.png";

export function Itinerary() {
  function detectarSeEhRestaurante(ponto: any) {
    if (!ponto) return false;

    const tipo = (ponto?.tipo || ponto?.ponto_tipo || "").toLowerCase();
    const origem = ponto?.origem?.toLowerCase?.() || "";

    return (
      tipo.includes("restaurante") ||
      tipo.includes("restaurant") ||
      tipo.includes("food") ||
      origem === "google" || // <- você disse que restaurante vem do Google
      Object.prototype.hasOwnProperty.call(ponto, "serve_cafe") ||
      Object.prototype.hasOwnProperty.call(ponto, "serve_almoco") ||
      Object.prototype.hasOwnProperty.call(ponto, "serve_jantar")
    );
  }

  const { id } = useParams();
  const [activeDay, setActiveDay] = useState(1);
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pontosExtras, setPontosExtras] = useState([]);
  const [restaurantes, setRestaurantes] = useState([]);
  const [restaurantesExtras, setRestaurantesExtras] = useState([]);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<any>(null);
  const [selectedExtraId, setSelectedExtraId] = useState<string | null>(null);

  const calculateTotalDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end.getTime() - start.getTime();
    return Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
  };

  async function fetchPontosExtras() {
    try {
      const res = await fetch(
        `https://projetopi-1.onrender.com/api/pontos-extras/${id}`
      );
      if (!res.ok) throw new Error("Erro ao buscar pontos extras");
      const data = await res.json();
      console.log("Pontos Extras recebidos:", data);
      setPontosExtras(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchPontos(totalDays: number) {
    console.log("Buscando pontos para o roteiro com ID:", id);
    try {
      const res = await fetch(
        `https://projetopi-1.onrender.com/api/roteiros2/${id}/pontos`
      );
      if (!res.ok) throw new Error("Erro ao buscar pontos do roteiro");
      const data = await res.json();
      console.log("Pontos do Roteiro recebidos:", data);

      const pontosComDia = data.map((ponto: any, index: number) => ({
        ...ponto,
        dia: Math.ceil((index + 1) / (data.length / totalDays)),
      }));

      setTripData((prevData: any) => ({
        ...prevData,
        resultados: pontosComDia,
      }));
    } catch (error) {
      console.error("Erro ao buscar pontos:", error);
    }
  }

  function formatarDataISO(isoString: string) {
    const [ano, mes, dia] = isoString.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  }

  async function fetchClima() {
    try {
      const res = await fetch(
        `https://projetopi-1.onrender.com/api/clima/${id}`
      );
      if (!res.ok) throw new Error("Erro ao buscar dados do clima");
      const data = await res.json();
      console.log("Dados do Clima recebidos:", data);
      setTripData((prevData: any) => ({
        ...prevData,
        clima: data,
      }));
    } catch (error) {
      console.error("Erro ao buscar clima:", error);
    }
  }

  async function fetchRestaurantes(totalDays: number) {
    try {
      const res = await fetch(
        `https://projetopi-1.onrender.com/api/roteiros2/${id}/restaurantes`
      );
      if (!res.ok) throw new Error("Erro ao buscar restaurantes");
      const data = await res.json();
      console.log("🍽️ Restaurantes recebidos:", data);

      const restaurantesOrdenados = [...data].sort((a, b) => a.ordem - b.ordem);

      const restaurantesComDia = restaurantesOrdenados.map(
        (rest: any, index: number) => ({
          ...rest,
          dia: Math.ceil(
            (index + 1) / (restaurantesOrdenados.length / totalDays)
          ),
        })
      );

      setRestaurantes(restaurantesComDia);
    } catch (error) {
      console.error(error);
    }
  }

  const fetchTripData = async () => {
    if (!id) {
      console.error("ID do roteiro não definido");
      return null;
    }
    try {
      const response = await fetch(
        `https://projetopi-1.onrender.com/api/roteiros2/${id}`
      );
      if (!response.ok) throw new Error("Roteiro não encontrado");
      const data = await response.json();
      const totalDays = calculateTotalDays(data.data_ida, data.data_volta);

      const formattedData = {
        id: data.roteiro_id,
        destination: data.cidade,
        startDate: data.data_ida,
        endDate: data.data_volta,
        budget: "Não definido",
        totalDays,
        accommodation: "Não definido",
        weather: "Não disponível",
        itinerary: [],
        resultados: [],
      };

      setTripData(formattedData);
      return formattedData;
    } catch (error) {
      console.error(error);
      setTripData(null);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const trip = await fetchTripData();
      if (!trip) return;
      await fetchPontosExtras();
      await fetchRestaurantes(trip.totalDays);
      await fetchPontos(trip.totalDays);
      await fetchClima();
      await fetchRestaurantesExtras();
      setLoading(false);
    };
    fetchData();
    const intervalId = setInterval(fetchData, 100000);
    return () => clearInterval(intervalId);
  }, [id]);

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

  const pontosDoDia = tripData.resultados?.filter(
    (p: any) => p.dia === activeDay && p.coordenadas
  );

  const restaurantesDoDia = restaurantes.filter(
    (r: any) => r.dia === activeDay && (r.lat || r.coordenadas?.lat)
  );

  async function fetchRestaurantesExtras() {
    try {
      const res = await fetch(
        `https://projetopi-1.onrender.com/api/restaurantes-extras/${id}`
      );

      if (!res.ok) throw new Error("Erro ao buscar restaurantes extras");
      const data = await res.json();
      console.log("🍽️ Restaurantes Extras recebidos:", data);
      setRestaurantesExtras(data);
    } catch (error) {
      console.error(error);
    }
  }

  const centroMapa = pontosDoDia?.[0]?.coordenadas
    ? [pontosDoDia[0].coordenadas.lat, pontosDoDia[0].coordenadas.lon]
    : restaurantesDoDia?.[0]?.lat
    ? [restaurantesDoDia[0].lat, restaurantesDoDia[0].lon]
    : restaurantesDoDia?.[0]?.coordenadas
    ? [
        restaurantesDoDia[0].coordenadas.lat,
        restaurantesDoDia[0].coordenadas.lon,
      ]
    : [-22.9068, -43.1729];

  // --- Função para confirmar a substituição de ponto por ponto extra
  async function handleConfirmSwap() {
    if (!selectedExtraId || !editingPoint) return;

    const isRestaurante = detectarSeEhRestaurante(editingPoint);

    const rota = isRestaurante
      ? `https://projetopi-1.onrender.com/api/roteiros2/${id}/restaurantes/${editingPoint.id}`
      : `https://projetopi-1.onrender.com/api/roteiros2/${id}/pontos/${editingPoint.id}`;

    const corpo = isRestaurante
      ? { novoRestauranteExtraId: selectedExtraId }
      : { newPontoExtraId: selectedExtraId };

    await fetch(rota, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });

    setTripData((prev: any) => {
      const index = isRestaurante
        ? restaurantes.findIndex((r: any) => r.id === editingPoint.id)
        : prev.resultados.findIndex((p: any) => p.id === editingPoint.id);

      if (index === -1) return prev;

      const novo = isRestaurante
        ? restaurantesExtras.find((e) => e.id === selectedExtraId)
        : pontosExtras.find((e) => e.id === selectedExtraId);

      if (!novo) return prev;

      if (isRestaurante) {
        const novosRestaurantes = [...restaurantes];
        novosRestaurantes[index] = {
          ...novo,
          id: editingPoint.id,
          dia: editingPoint.dia,
        };
        setRestaurantes(novosRestaurantes);
        return {
          ...prev,
          restaurantes: novosRestaurantes,
        };
      } else {
        const novosResultados = [...prev.resultados];
        novosResultados[index] = {
          ...novo,
          id: editingPoint.id,
          dia: editingPoint.dia,
          ponto_tipo: novo.tipo,
        };
        return { ...prev, resultados: novosResultados };
      }
    });
    console.log("🧪 Substituindo:", {
      tipo: editingPoint?.tipo,
      ponto_tipo: editingPoint?.ponto_tipo,
      nome: editingPoint?.nome,
      isRestaurante,
    });

    setModalOpen(false);
    setEditingPoint(null);
    setSelectedExtraId(null);
  }

  const pontoTuristicoIcon = new L.Icon({
    iconUrl: localizacaoIcon,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });

  function renderRestaurante(
    rest,
    isEditingMode,
    setEditingPoint,
    setModalOpen,
    setSelectedExtraId
  ) {
    return (
      <li className="border rounded p-4 bg-yellow-100 list-none w-full">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{rest.nome}</h3>
            {rest.endereco && <p className="text-sm">📍 {rest.endereco}</p>}
            {rest.rating && <p className="text-sm">⭐ {rest.rating}</p>}
          </div>
          {isEditingMode && (
            <div className="flex space-x-2">
              <EditIcon
                className="h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800"
                onClick={() => {
                  setEditingPoint(rest);
                  setSelectedExtraId(null);
                  setModalOpen(true);
                }}
              />
              <Trash2Icon className="h-5 w-5 cursor-pointer" />
            </div>
          )}
        </div>
      </li>
    );
  }

  function renderPonto(
    ponto,
    isEditingMode,
    setEditingPoint,
    setModalOpen,
    setSelectedExtraId,
    removerPonto
  ) {
    return (
      <div className="p-4 border rounded bg-blue-200 w-full">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">
              {ponto.ponto_nome || ponto.nome}
            </h3>
            {ponto.endereco && <p className="text-sm">📍 {ponto.endereco}</p>}
          </div>
          {isEditingMode && (
            <div className="flex space-x-2">
              <EditIcon
                className="h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800"
                onClick={() => {
                  setEditingPoint(ponto);
                  setSelectedExtraId(null);
                  setModalOpen(true);
                }}
              />
              <Trash2Icon
                className="h-5 w-5 cursor-pointer text-red-600 hover:text-red-800"
                onClick={() => removerPonto(ponto.id)}
              />
            </div>
          )}
        </div>
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
              {formatarDataISO(tripData.startDate)} -{" "}
              {formatarDataISO(tripData.endDate)} ({tripData.totalDays} dias)
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <ShareIcon className="mr-2 h-4 w-4" />
              Compartilhar
            </button>
            <button
              onClick={() => setIsEditingMode((prev) => !prev)}
              className="inline-flex items-center px-4 py-2 … bg-blue-300 hover:bg-blue-700"
            >
              <EditIcon className="mr-2 h-4 w-4" />
              {isEditingMode ? "Cancelar" : "Editar"}
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
                      {formatarDataISO(tripData.startDate)} -{" "}
                      {formatarDataISO(tripData.endDate)}
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
                            {clima.descricao
                              .replace("Possibilidade de ", "")
                              .replace(/\birregular\b/gi, "")
                              .trim()}
                          </span>
                          <span className="ml-3 text-sm text-gray-900">
                            {`dia ${formatarDataISO(clima.data).split("/")[0]}`}
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

            <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900">Legenda</h2>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-100"></div>
                    <span className="text-sm text-gray-700">Restaurantes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-blue-200"></div>
                    <span className="text-sm text-gray-700">
                      Pontos Turísticos
                    </span>
                  </div>
                </div>
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
                            {(() => {
                              const start = tripData.startDate.split("T")[0];
                              const startDate = new Date(`${start}T00:00:00Z`);
                              const targetDate = new Date(
                                startDate.getTime() +
                                  (day - 1) * 24 * 60 * 60 * 1000
                              );
                              return targetDate.toLocaleDateString("pt-BR", {
                                month: "short",
                                day: "numeric",
                              });
                            })()}
                          </span>
                        </button>
                      );
                    }
                  )}
                </nav>
              </div>

              <div className="px-4 py-5 sm:p-6">
                <div className="px-4 py-5 sm:p-6">
                  {(() => {
                    const pontos =
                      tripData.resultados?.filter(
                        (p) =>
                          p.dia === activeDay && !detectarSeEhRestaurante(p)
                      ) || [];

                    const rests = restaurantes.filter(
                      (r) => r.dia === activeDay
                    );
                    const intercalados: JSX.Element[] = [];
                    const refeicoes = [
                      "☕ Café da manhã",
                      "🍽️ Almoço",
                      "🌙 Jantar",
                    ];

                    const renderRestaurante = (rest, i) => (
                      <React.Fragment key={`rest-${rest.id}`}>
                        <p className="text-sm text-gray-700 mb-1 ml-1">
                          {refeicoes[i]}
                        </p>
                        <li className="border rounded p-4 bg-yellow-100 mb-4 list-none">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-semibold">
                                {rest.nome}
                              </h3>
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
                            </div>
                            {isEditingMode && (
                              <div className="flex space-x-2">
                                <EditIcon
                                  className="h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800"
                                  onClick={() => {
                                    setEditingPoint(rest);
                                    setSelectedExtraId(null);
                                    setModalOpen(true);
                                  }}
                                />
                                <Trash2Icon className="h-5 w-5 cursor-pointer" />
                              </div>
                            )}
                          </div>
                        </li>
                      </React.Fragment>
                    );

                    const renderPonto = (ponto) => (
                      <React.Fragment key={`ponto-${ponto.id}`}>
                        <p className="text-sm text-gray-700 mb-1 ml-1">
                          🗺️ Pontos turísticos
                        </p>
                        <div className="mb-4 p-4 border rounded bg-blue-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-semibold">
                                {ponto.ponto_nome || ponto.nome}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Endereço:{" "}
                                {ponto.ponto_endereco || ponto.endereco}
                              </p>
                            </div>
                            {isEditingMode && (
                              <div className="flex space-x-2">
                                <EditIcon
                                  className="h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800"
                                  onClick={() => {
                                    setEditingPoint(ponto);
                                    setSelectedExtraId(null);
                                    setModalOpen(true);
                                  }}
                                />
                                <Trash2Icon
                                  className="h-5 w-5 cursor-pointer text-red-600 hover:text-red-800"
                                  onClick={async () => {
                                    if (
                                      !window.confirm(
                                        "Tem certeza que deseja remover este ponto do roteiro?"
                                      )
                                    )
                                      return;

                                    try {
                                      await fetch(
                                        `https://projetopi-1.onrender.com/api/roteiros2/${id}/pontos/${ponto.id}/mover-para-extras`,
                                        {
                                          method: "DELETE",
                                        }
                                      );

                                      setTripData((prev: any) => ({
                                        ...prev,
                                        resultados: prev.resultados.filter(
                                          (x: any) => x.id !== ponto.id
                                        ),
                                      }));

                                      fetchPontosExtras();
                                    } catch (error) {
                                      console.error(
                                        "Erro ao mover ponto para extras:",
                                        error
                                      );
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );

                    if (rests.length === 3) {
                      const maxLength = Math.max(rests.length, pontos.length);
                      for (let i = 0; i < maxLength; i++) {
                        if (rests[i])
                          intercalados.push(renderRestaurante(rests[i], i));
                        if (pontos[i])
                          intercalados.push(renderPonto(pontos[i]));
                      }
                    } else {
                      if (pontos[0]) intercalados.push(renderPonto(pontos[0]));
                      if (rests[0])
                        intercalados.push(renderRestaurante(rests[0], 1));
                      if (pontos[1]) intercalados.push(renderPonto(pontos[1]));
                      if (rests[1])
                        intercalados.push(renderRestaurante(rests[1], 2));
                    }

                    return intercalados;
                  })()}
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Mapa do Dia
                </h2>
                <div className="h-80 rounded-lg overflow-hidden z-0 relative">
                  <MapContainer
                    center={centroMapa}
                    zoom={13}
                    scrollWheelZoom={false}
                    className="h-full w-full z-0"
                  >
                    <TileLayer
                      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {tripData.resultados
                      ?.filter((p) => {
                        const tipo = (
                          p.ponto_tipo ||
                          p.tipo ||
                          ""
                        ).toLowerCase();
                        const isRestaurante =
                          tipo.includes("restaurant") || tipo.includes("food");
                        const temCoord =
                          p.ponto_coordenadas ||
                          p.coordenadas ||
                          (p.ponto_lat && p.ponto_lon);
                        return (
                          p.dia === activeDay && temCoord && !isRestaurante
                        );
                      })
                      .map((ponto) => {
                        const lat =
                          ponto.ponto_lat ||
                          ponto.coordenadas?.lat ||
                          ponto.ponto_coordenadas?.lat;
                        const lon =
                          ponto.ponto_lon ||
                          ponto.coordenadas?.lon ||
                          ponto.ponto_coordenadas?.lon;
                        if (!lat || !lon) return null;

                        return (
                          <Marker
                            key={ponto.id}
                            position={[lat, lon]}
                            icon={pontoTuristicoIcon}
                          >
                            <Popup>
                              <strong>{ponto.ponto_nome || ponto.nome}</strong>
                              <br />
                              {ponto.ponto_endereco || ponto.endereco}
                            </Popup>
                          </Marker>
                        );
                      })}

                    {restaurantes
                      .filter(
                        (rest) =>
                          rest.dia === activeDay &&
                          (rest.lat || rest.coordenadas?.lat)
                      )
                      .map((rest) => {
                        const lat = rest.lat || rest.coordenadas?.lat;
                        const lon = rest.lon || rest.coordenadas?.lon;
                        if (!lat || !lon) return null;
                        return (
                          <Marker
                            key={rest.id}
                            position={[lat, lon]}
                            icon={
                              new L.Icon({
                                iconUrl:
                                  "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
                                iconSize: [25, 25],
                              })
                            }
                          >
                            <Popup>
                              <strong>{rest.nome}</strong>
                              <br />
                              {rest.endereco}
                              <br />
                              Refeições:{" "}
                              {[
                                rest.serve_cafe ? "Café" : null,
                                rest.serve_almoco ? "Almoço" : null,
                                rest.serve_jantar ? "Jantar" : null,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </Popup>
                          </Marker>
                        );
                      })}
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && editingPoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {detectarSeEhRestaurante(editingPoint)
                ? "Trocar Restaurante"
                : "Trocar Ponto Turístico"}
            </h2>

            <select
              className="w-full border p-2 rounded"
              value={selectedExtraId || ""}
              onChange={(e) => setSelectedExtraId(e.target.value)}
            >
              <option value="">
                -- escolha um novo{" "}
                {detectarSeEhRestaurante(editingPoint)
                  ? "restaurante"
                  : "ponto turístico"}{" "}
                --
              </option>
              {(detectarSeEhRestaurante(editingPoint)
                ? restaurantesExtras
                : pontosExtras
              ).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>

            <div className="mt-6 flex justify-end space-x-2">
              <button className="px-4 py-2" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleConfirmSwap}
                disabled={!selectedExtraId}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
