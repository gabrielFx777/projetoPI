import { useState } from "react";
import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import {
  MapPinIcon,
  CalendarIcon,
  DollarSignIcon,
  UsersIcon,
  HeartIcon,
  PlaneIcon,
  HotelIcon,
  UtensilsIcon,
  LandmarkIcon,
} from "lucide-react";

interface Endereco {
  road?: string;
  house_number?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

interface PontoTuristico {
  id: string;
  nome: string;
  tipo: string;
  endereco: Endereco;
  coordenadas: {
    lat: number;
    lon: number;
  };
}

const PlanTrip: React.FC = () => {
  const [etapa, setEtapa] = useState(1);
  const [trips, setTrips] = useState([]);

  const [cidade, setCidade] = useState("");
  const [pais, setPais] = useState("");
  const [dataIda, setDataIda] = useState("");
  const [dataVolta, setDataVolta] = useState("");
  const [preferencias, setPreferencias] = useState<string[]>([]);
  const [resultados, setResultados] = useState<PontoTuristico[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [quantidadePontos, setQuantidadePontos] = useState(5); // valor inicial padrão

  const handleFinalizar = (novaViagem) => {
    setTrips((prevTrips) => [...prevTrips, novaViagem]);
  };

  const opcoesEstilo = [
    { label: "Aventura", valor: "aventura" },
    { label: "Cultural", valor: "cultural" },
    { label: "Relaxamento", valor: "relaxamento" },
    { label: "Gastronômico", valor: "gastronomico" },
    { label: "Compras", valor: "compras" },
    { label: "Romântico", valor: "romantico" },
  ];

  const opcoesInteresses = [
    { label: "Museus", valor: "museus" },
    { label: "Parques", valor: "parques" },
    { label: "Vida Noturna", valor: "vidaNoturna" },
    { label: "Tours Guiados", valor: "toursGuiados" },
    { label: "Shows", valor: "shows" },
    { label: "Natureza", valor: "natureza" },
    { label: "Praias", valor: "praias" },
    { label: "Montanhas", valor: "montanhas" },
  ];

  const handleCheckbox = (estilo: string) => {
    setPreferencias((prev) =>
      prev.includes(estilo)
        ? prev.filter((e) => e !== estilo)
        : [...prev, estilo]
    );
  };

  const salvarRoteiroNoServidor = async (pontos: PontoTuristico[]) => {
    try {
      const user = localStorage.getItem("user");
      let usuarioId = null;
      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          usuarioId = parsedUser.id;
        } catch {
          console.error("Erro ao parsear o usuário.");
        }
      }

      const resposta = await fetch("http://localhost:3001/api/roteiros", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuarioId,
          cidade,
          pais,
          dataIda,
          dataVolta,
          preferencias,
          pontos,
        }),
      });

      const data = await resposta.json();
      if (data.sucesso) {
        console.log("Roteiro salvo com sucesso:", data.roteiro);
      } else {
        console.error("Erro ao salvar roteiro:", data.error);
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  const handleBuscar = async () => {
    setCarregando(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const resposta = await fetch(`${apiUrl}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cidade,
          pais,
          preferencias,
          dataIda,
          dataVolta,
        }),
      });
      const dados = await resposta.json();
      setResultados(dados);
      return dados;
    } catch (erro) {
      console.error("Erro:", erro);
      alert("Erro ao buscar.");
      return [];
    } finally {
      setCarregando(false);
    }
  };

  const avancar = async () => {
    if (
      etapa === 4 &&
      preferencias.length > 0 &&
      cidade &&
      pais &&
      dataIda &&
      dataVolta
    ) {
      const dados = await handleBuscar();
      if (dados.length > 0) {
        const selecionados = dados.slice(0, quantidadePontos);
        salvarRoteiroNoServidor(selecionados);
      } else {
        alert("Nenhum ponto turístico encontrado.");
      }
    }

    if (etapa < 4) setEtapa(etapa + 1);
  };

  const formatarEndereco = (endereco: Endereco) => {
    const partes = [
      endereco.road,
      endereco.house_number,
      endereco.city,
      endereco.state,
      endereco.country,
      endereco.postcode,
    ].filter(Boolean);
    return partes.join(", ");
  };

  const voltar = () => {
    if (etapa > 1) setEtapa(etapa - 1);
  };

  return (
    <>
      <div className="text-center mb-20 mt-20">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Planeje Sua Viagem
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Preencha as informações abaixo e deixe nosso sistema inteligente criar
          um roteiro personalizado para você.
        </p>
      </div>

      <div className="p-8 max-w-2xl mx-auto bg-white shadow-lg rounded-xl mb-40">
        <div className="mb-8 progresso">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  etapa >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    etapa >= 1 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Básico
                </p>
              </div>
            </div>
            <div
              className={`flex-1 h-0.5 mx-4 ${
                etapa >= 2 ? "bg-blue-600" : "bg-gray-200"
              }`}
            ></div>
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  etapa >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    etapa >= 2 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Preferências
                </p>
              </div>
            </div>
            <div
              className={`flex-1 h-0.5 mx-4 ${
                etapa >= 3 ? "bg-blue-600" : "bg-gray-200"
              }`}
            ></div>
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  etapa >= 3
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    etapa >= 3 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Atividades
                </p>
              </div>
            </div>
            <div
              className={`flex-1 h-0.5 mx-4 ${
                etapa >= 4 ? "bg-blue-600" : "bg-gray-200"
              }`}
            ></div>
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  etapa >= 4
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                4
              </div>
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    etapa >= 4 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Revisão
                </p>
              </div>
            </div>
          </div>
        </div>

        {etapa === 1 && (
          <div className="grid gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="p-3 pl-10 border rounded-md w-full"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="País (ex: BR)"
                value={pais}
                onChange={(e) => setPais(e.target.value.toUpperCase())}
                className="p-3 pl-10 border rounded-md w-full"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <label htmlFor="">Data de Ida</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-6">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dataIda}
                  onChange={(e) => setDataIda(e.target.value)}
                  className="p-3 pl-10 border rounded-md w-full"
                />
              </div>
              <div className="relative">
                <label htmlFor="">Data de Volta</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-6">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dataVolta}
                  onChange={(e) => setDataVolta(e.target.value)}
                  className="p-3 pl-10 border rounded-md w-full"
                />
              </div>
            </div>
          </div>
        )}

        {etapa === 2 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-5">Estilo da Viagem</h2>
            <p className="mb-5">Estilo de Viagem (selecione pelo menos um)</p>
            <div className="flex flex-wrap gap-3">
              {opcoesEstilo.map(({ label, valor }) => (
                <label key={valor} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferencias.includes(valor)}
                    onChange={() => handleCheckbox(valor)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {etapa === 3 && (
          <div className="text-gray-700 mb-6">
            <h2 className="text-lg font-semibold mb-5">
              Atividades e Interesses
            </h2>
            <p className="mb-5">
              Atividades Preferidas (selecione quantas quiser)
            </p>
            <div className="grid grid-cols-3 gap-3">
              {opcoesInteresses.map(({ label, valor }) => (
                <label key={valor} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferencias.includes(valor)}
                    onChange={() => handleCheckbox(valor)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {etapa === 4 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade de pontos turísticos que deseja visitar:
            </label>
            <input
              type="number"
              min={1}
              max={resultados.length}
              value={quantidadePontos}
              onChange={(e) => setQuantidadePontos(Number(e.target.value))}
              className="p-3 border rounded-md w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Máximo: {resultados.length} pontos encontrados.
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={voltar}
            disabled={etapa === 1}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={avancar}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {etapa === 4 ? (carregando ? "Buscando..." : "Buscar") : "Próximo"}
          </button>
        </div>

        {resultados.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">
              Resultados:
            </h2>
            <p className="mb-4 text-lg text-gray-700">
              Seu roteiro foi gerado com sucesso! Clique no link abaixo para
              acessá-lo:
            </p>
            <a
              href={`/roteiro/${cidade}-${pais}-${dataIda}`}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Acessar Roteiro
            </a>
          </div>
        )}
      </div>
    </>
  );
};

export default PlanTrip;
