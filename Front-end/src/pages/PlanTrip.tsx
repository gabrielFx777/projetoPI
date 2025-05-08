import { useState } from "react";

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

  const handleFinalizar = (novaViagem) => {
    // Aqui, você adiciona a nova viagem ao estado de trips
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

  // Função para salvar o roteiro no servidor
  const salvarRoteiroNoServidor = async (pontos: PontoTuristico[]) => {
    try {
      const user = localStorage.getItem('user'); // Busca o usuário no localStorage
      let usuarioId = null;
      if (user) {
        try {
          const parsedUser = JSON.parse(user); // Faz o parse do objeto armazenado
          usuarioId = parsedUser.id; // Acessa o ID do usuário do objeto armazenado
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
          usuarioId,  // Agora o usuarioId está sendo passado corretamente
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

  // Função para buscar pontos turísticos
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
      return dados; // <-- Retorna os dados aqui
    } catch (erro) {
      console.error("Erro:", erro);
      alert("Erro ao buscar.");
      return []; // <-- Retorna array vazio em caso de erro
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
        salvarRoteiroNoServidor(dados); // Agora você tem certeza que há dados
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

  const saveItinerary = async () => {
    const itinerary = {
      user_id: 1, // Id real do usuário logado
      title: "Viagem para Salvador",
      description: "Roteiro de 5 dias na Bahia",
      start_date: "2025-07-01",
      end_date: "2025-07-05",
      items: [
        {
          day: 1,
          location: "Pelourinho",
          activity: "Passeio cultural",
          time: "10:00",
          notes: "Comprar lembrancinhas",
        },
        {
          day: 2,
          location: "Praia do Forte",
          activity: "Dia de praia",
          time: "09:00",
          notes: "Protetor solar",
        },
      ],
    };

    try {
      const response = await fetch("http://localhost:3001/api/itineraries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itinerary),
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Erro ao salvar o roteiro:", error);
    }
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
          <div className="mt-8">
            {carregando ? (
              <p className="text-blue-600 font-medium">
                Carregando sugestões...
              </p>
            ) : resultados.length > 0 ? (
              <ul className="space-y-4">
                {/* {resultados.map((ponto) => (
                  <li
                    key={ponto.id}
                    className="p-4 border rounded-lg shadow-sm bg-gray-50 hover:bg-white transition"
                  >
                    <h3 className="text-xl font-semibold text-gray-800">
                      {ponto.nome}
                    </h3>
                    <p className="text-sm text-gray-600">Tipo: {ponto.tipo}</p>
                    <p className="text-sm text-gray-600">
                      Endereço: {formatarEndereco(ponto.endereco)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Coordenadas: {ponto.coordenadas.lat},{" "}
                      {ponto.coordenadas.lon}
                    </p>
                  </li>
                ))} */}
              </ul>
            ) : (
              <p className="text-gray-500">
                Nenhum ponto turístico encontrado.
              </p>
            )}
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

        <h2 className="text-2xl font-bold mb-4 text-gray-800 mt-10">
          Sugestões de Pontos Turísticos
        </h2>

        {resultados.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">
              Resultados:
            </h2>
            <ul className="space-y-4">
              {resultados.map((ponto) => (
                <li key={ponto.id} className="p-4 border rounded bg-gray-100">
                  <h3 className="text-xl font-semibold">
                    {ponto.nome || "Sem nome"}
                  </h3>
                  <p>Tipo: {ponto.tipo}</p>

                  {ponto.endereco && (
                    <p className="text-sm text-gray-600">
                      Endereço: {formatarEndereco(ponto.endereco)}
                    </p>
                  )}

                  {ponto.clima && (
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        <strong>Clima:</strong> {ponto.clima.descricao}
                      </p>
                      <p>
                        <strong>Temperatura:</strong> {ponto.clima.temperatura}
                        °C
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default PlanTrip;
