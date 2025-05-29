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
  const hoje = new Date().toISOString().split("T")[0];

  const handleFinalizar = (novaViagem) => {
    setTrips((prevTrips) => [...prevTrips, novaViagem]);
  };

  const opcoesEstilo = [
    { label: "Aventura", valor: "aventura" },
    { label: "Cultural", valor: "cultural" },
    { label: "Relaxamento", valor: "relaxamento" },
    { label: "Compras", valor: "compras" },
    { label: "Romântico", valor: "romantico" },
  ];

  const opcoesInteresses = [
    { label: "Museus", valor: "museus" },
    { label: "Parques", valor: "parques" },
    { label: "Natureza", valor: "natureza" },
    { label: "Praias", valor: "praias" },
    { label: "Montanhas", valor: "montanhas" },
  ];

  const gastronomicas = [
    { label: "Internacional", valor: "international" },
    { label: "Fast-food", valor: "fast_food" },
    { label: "Gourmet", valor: "gourmet" },
    { label: "Vegetariano", valor: "vegetarian" },
    { label: "Vegano", valor: "vegan" },
    { label: "Frutos do Mar", valor: "seafood" },
    { label: "Comida de Rua", valor: "street food" },
    { label: "Café da Manhã", valor: "breakfast" },
    { label: "Almoço", valor: "lunch" },
    { label: "Jantar", valor: "dinner" },
  ];

  const [modalStatus, setModalStatus] = useState<
    null | "gerando" | "concluido"
  >(null);

  const handleCheckbox = (estilo: string) => {
    setPreferencias((prev) =>
      prev.includes(estilo)
        ? prev.filter((e) => e !== estilo)
        : [...prev, estilo]
    );
  };

  const salvarRoteiroNoServidor = async (
    pontosLimitados: PontoTuristico[],
    pontosExtras: PontoTuristico[],
    restaurantes: any[]
  ) => {
    try {
      const user = localStorage.getItem("user");
      let usuarioId = null;
      if (user) {
        try {
          usuarioId = JSON.parse(user).id;
        } catch {
          /* ignora */
        }
      }

      console.log(">>> FETCH BODY:", {
        usuarioId,
        cidade,
        pais,
        dataIda,
        dataVolta,
        preferencias,
        pontosLimitados: pontosLimitados.map((p) => p.id),
        pontosExtras: pontosExtras.map((p) => p.id),
        restaurantes: restaurantes.map((r) => r.id || r.nome),
      });

      const resposta = await fetch(
        "https://projetopi-1.onrender.com/api/roteiros2",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            cidade,
            pais,
            dataIda,
            dataVolta,
            preferencias,
            pontosLimitados, // principais
            pontosExtras, // todos os extras vindos da API
            restaurantes, // todos os restaurantes vindos da API
          }),
        }
      );

      const data = await resposta.json();
      if (resposta.ok && data.sucesso) {
        console.log("Roteiro salvo com sucesso:", data);
        return data.roteiroId;
      } else {
        console.error("Erro ao salvar roteiro:", data);
        return null;
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      return null;
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
    // Etapa 1 obrigatória
    if (etapa === 1) {
      if (!cidade.trim() || !pais.trim() || !dataIda || !dataVolta) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }
    }

    // Etapa 3: exige seleção na etapa 2 ou 3
    if (etapa === 3) {
      const estilosSelecionados = preferencias.filter((p) =>
        opcoesEstilo.map((o) => o.valor).includes(p)
      );
      const interessesSelecionados = preferencias.filter((p) =>
        opcoesInteresses.map((o) => o.valor).includes(p)
      );

      if (
        estilosSelecionados.length === 0 &&
        interessesSelecionados.length === 0
      ) {
        alert(
          "Selecione pelo menos um estilo de viagem (Etapa 2) ou atividade (Etapa 3)."
        );
        return;
      }
    }

    // Etapa 4: exige ao menos uma preferência gastronômica
    if (etapa === 4) {
      const gastronomiaSelecionada = preferencias.some((p) =>
        gastronomicas.map((g) => g.valor).includes(p)
      );

      if (!gastronomiaSelecionada) {
        alert("Selecione pelo menos uma preferência.");
        return;
      }
    }

    // Etapa 5: busca e salva roteiro
    if (
      etapa === 5 &&
      cidade &&
      pais &&
      dataIda &&
      dataVolta &&
      preferencias.length
    ) {
      setModalStatus("gerando");
      const dados = await handleBuscar();
      if (
        Array.isArray(dados.pontosLimitados) &&
        dados.pontosLimitados.length
      ) {
        const selecionados = dados.pontosLimitados.slice(0, quantidadePontos);

        const wantsBreakfast = preferencias.includes("breakfast");
        const wantsLunch = preferencias.includes("lunch");
        const wantsDinner = preferencias.includes("dinner");

        const restaurantesFiltrados = (dados.restaurantes || []).filter((r) => {
          return (
            (wantsBreakfast && r.serve_cafe) ||
            (wantsLunch && r.serve_almoco) ||
            (wantsDinner && r.serve_jantar)
          );
        });

        const roteiroId = await salvarRoteiroNoServidor(
          selecionados,
          dados.pontosExtras,
          restaurantesFiltrados
        );

        if (roteiroId) {
          await chamarRotaClima(roteiroId);
          setModalStatus("concluido"); // muda o conteúdo da modal
        } else {
          setModalStatus(null); // erro ou falha, remove a modal
          alert("Não foi possível salvar o roteiro.");
        }
      } else {
        setModalStatus(null);
        alert("Nenhum ponto turístico encontrado.");
      }
    }

    if (etapa < 5) setEtapa(etapa + 1);
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

  const chamarRotaClima = async (roteiroId: number) => {
    console.log("Dados enviados para clima:", {
      cidade,
      estado: "", // Adicione se necessário
      pais,
      dataIda,
      dataVolta,
      roteiro_id: roteiroId,
    });

    try {
      const resposta = await fetch(
        "https://projetopi-1.onrender.com/api/clima",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cidade,
            estado: "",
            pais,
            dataIda,
            dataVolta,
            roteiro_id: roteiroId,
          }),
        }
      );

      if (!resposta.ok) {
        throw new Error("Erro ao chamar a rota de clima");
      }

      const clima = await resposta.json();
      console.log("Clima recebido:", clima);
    } catch (erro) {
      console.error("Erro ao buscar clima:", erro);
    }
  };

  // function atualizarDados() {
  //   fetch("/api/dados") // sua rota do backend
  //     .then((res) => res.json())
  //     .then((data) => {
  //       // Atualiza o conteúdo da página com os novos dados
  //       document.querySelector("#conteudo").innerHTML = gerarHTML(data);
  //     });
  // }

  // setInterval(atualizarDados, 30000); // chama a função a cada 30s

  // // Você pode chamar a função uma vez ao carregar a página também
  // atualizarDados();

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

      <div className="w-full p-4 sm:p-8 max-w-4xl mx-auto bg-white shadow-lg rounded-xl mb-40">
        <div className="mb-8 flex justify-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-2 w-full">
            {/* Etapa 1 */}
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

            {/* Linha 1-2 */}
            <div
              className={`w-full sm:flex-1 h-0.5 sm:h-0.5 sm:w-auto mx-4 ${
                etapa >= 2 ? "bg-blue-600" : "bg-gray-200"
              }`}
            ></div>

            {/* Etapa 2 */}
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

            {/* Linha 2-3 */}
            <div
              className={`w-full sm:flex-1 h-0.5 sm:h-0.5 sm:w-auto mx-4 ${
                etapa >= 3 ? "bg-blue-600" : "bg-gray-200"
              }`}
            ></div>

            {/* Etapa 3 */}
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

            {/* Linha 3-4 */}
            <div
              className={`w-full sm:flex-1 h-0.5 sm:h-0.5 sm:w-auto mx-4 ${
                etapa >= 4 ? "bg-blue-600" : "bg-gray-200"
              }`}
            ></div>

            {/* Etapa 4 */}
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
                  Gastronomia
                </p>
              </div>
            </div>

            {/* Linha 4-5 */}
            <div
              className={`w-full sm:flex-1 h-0.5 sm:h-0.5 sm:w-auto mx-4 ${
                etapa >= 5 ? "bg-blue-600" : "bg-gray-200"
              }`}
            ></div>

            {/* Etapa 5 */}
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  etapa >= 5
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                5
              </div>
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${
                    etapa >= 5 ? "text-blue-600" : "text-gray-500"
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

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full">
                <label htmlFor="">Data de Chegada no Destino</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-6">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dataIda}
                  onChange={(e) => setDataIda(e.target.value)}
                  min={hoje} // 🔒 Impede seleção de datas anteriores
                  className="p-3 pl-10 border rounded-md w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Essa é a data em que você já estará na cidade de destino.
                </p>
              </div>

              <div className="relative w-full">
                <label htmlFor="">Data de Volta</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-6">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dataVolta}
                  onChange={(e) => setDataVolta(e.target.value)}
                  min={dataIda || hoje} // ⏳ Só permite data igual ou depois da chegada
                  className="p-3 pl-10 border rounded-md w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Essa é a data em que você deixará a cidade de destino.
                </p>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          <div className="text-gray-700 mb-6">
            <h2 className="text-lg font-semibold mb-5">
              Preferências Gastronômicas
            </h2>
            <p className="mb-5">
              Escolha os tipos de gastronomia que mais gosta:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gastronomicas.map(({ label, valor }) => (
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

        {etapa === 5 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Informe a quantidade de pontos turísticos que deseja visitar
              durante sua estadia — considere apenas os dias em que já estará no
              local de destino.
            </label>
            <input
              type="number"
              min={1}
              max={resultados.length}
              value={quantidadePontos}
              onChange={(e) => setQuantidadePontos(Number(e.target.value))}
              className="p-3 border rounded-md w-full"
            />
          </div>
        )}

        <div className="flex justify-between flex-col sm:flex-row gap-3">
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
            {etapa === 5 ? (carregando ? "Buscando..." : "Buscar") : "Próximo"}
          </button>
        </div>

        {resultados.length > 0 && (
          <div className="mt-10 text-blue-600 hover:text-blue-800 font-semibold text-center">
            <a
              href={`/dashboard`}
              className="text-blue-600 hover:text-blue-800 font-semibold text-center"
            >
              Acessar Roteiro
            </a>
          </div>
        )}

        {modalStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 text-center w-96 shadow-xl">
              {modalStatus === "gerando" && (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="animate-spin text-2xl mr-2">⏳</div>
                    <h2 className="text-lg font-semibold">
                      Roteiro sendo gerado...
                    </h2>
                  </div>

                  <p className="text-gray-600">
                    Estamos montando sua viagem ideal. Isso pode levar alguns
                    segundos.
                  </p>
                </>
              )}
              {modalStatus === "concluido" && (
                <>
                  <p className="text-gray-600 mb-4">
                    Seu roteiro está pronto. Clique abaixo para visualizar.
                  </p>
                  <a
                    href="/dashboard"
                    className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Ir para o Dashboard
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PlanTrip;
