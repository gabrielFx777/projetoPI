// import React, { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import {
//   MapPinIcon,
//   CalendarIcon,
//   ClockIcon,
//   DollarSignIcon,
//   UmbrellaIcon,
//   CloudIcon,
//   SunIcon,
//   UtensilsIcon,
//   BedIcon,
//   MapIcon,
//   LandmarkIcon,
//   DownloadIcon,
//   ShareIcon,
//   EditIcon,
// } from "lucide-react";

// export function Itinerary() {
//   const { id } = useParams(); // Pegando o id da URL
//   const [activeDay, setActiveDay] = useState(1);
//   const [tripData, setTripData] = useState(null); // Estado para armazenar os dados da viagem

//   const calculateTotalDays = (startDate, endDate) => {
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     const timeDifference = end - start;
//     return Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1; // Inclui o dia de ida
//   };

//   // Usando useEffect para buscar os dados da viagem e definir o destino
//   useEffect(() => {
//     async function fetchTrip() {
//       try {
//         const response = await fetch(
//           `http://localhost:3001/api/roteiros/${id}`
//         );
//         if (!response.ok) {
//           throw new Error("Roteiro não encontrado");
//         }
//         const data = await response.json();
//         const totalDays = calculateTotalDays(data.data_ida, data.data_volta);

//         setTripData({
//           id,
//           destination: data.cidade, // Agora usa a cidade retornada pela API
//           startDate: data.data_ida,
//           endDate: data.data_volta,
//           budget: data.orcamento,
//           totalDays: totalDays,
//           accommodation: data.acomodacao,
//           weather: data.previsao_tempo, // Atualize conforme a estrutura do seu dado
//           itinerary: data.roteiro, // Aqui é o mesmo formato que você usava
//         });
//       } catch (error) {
//         console.error(error);
//         setTripData(null);
//       }
//     }

//     fetchTrip();
//   }, [id]); // Atualiza os dados sempre que o id mudar

//   const getActivityColor = (type) => {
//     switch (type) {
//       case "accommodation":
//         return "bg-blue-100 border-blue-200";
//       case "attraction":
//         return "bg-green-100 border-green-200";
//       case "food":
//         return "bg-yellow-100 border-yellow-200";
//       case "transport":
//         return "bg-purple-100 border-purple-200";
//       default:
//         return "bg-gray-100 border-gray-200";
//     }
//   };

//   if (!tripData) return <div>Carregando...</div>;

//   return (
//     <div className="bg-gray-50 min-h-screen py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
//           <div>
//             <h1 className="text-3xl font-extrabold text-gray-900">
//               {tripData.destination}
//             </h1>
//             <p className="mt-2 flex items-center text-sm text-gray-500">
//               <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
//               {new Date(tripData.startDate).toLocaleDateString("pt-BR")} -{" "}
//               {new Date(tripData.endDate).toLocaleDateString("pt-BR")}(
//               {tripData.totalDays} dias)
//             </p>
//           </div>
//           <div className="mt-4 md:mt-0 flex space-x-3">
//             <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
//               <DownloadIcon className="mr-2 h-4 w-4" />
//               PDF
//             </button>
//             <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
//               <ShareIcon className="mr-2 h-4 w-4" />
//               Compartilhar
//             </button>
//             <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
//               <EditIcon className="mr-2 h-4 w-4" />
//               Editar
//             </button>
//           </div>
//         </div>
//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//           <div className="col-span-1">
//             <div className="bg-white shadow overflow-hidden rounded-lg">
//               <div className="px-4 py-5 sm:p-6">
//                 <h2 className="text-lg font-medium text-gray-900">
//                   Informações da Viagem
//                 </h2>
//                 <dl className="mt-4 space-y-4">
//                   <div className="flex items-center">
//                     <dt className="flex-shrink-0">
//                       <MapPinIcon className="h-6 w-6 text-gray-400" />
//                     </dt>
//                     <dd className="ml-3 text-sm text-gray-900">
//                       {tripData.destination}
//                     </dd>
//                   </div>
//                   <div className="flex items-center">
//                     <dt className="flex-shrink-0">
//                       <CalendarIcon className="h-6 w-6 text-gray-400" />
//                     </dt>
//                     <dd className="ml-3 text-sm text-gray-900">
//                       {new Date(tripData.startDate).toLocaleDateString("pt-BR")}{" "}
//                       - {new Date(tripData.endDate).toLocaleDateString("pt-BR")}
//                     </dd>
//                   </div>
//                   <div className="flex items-center">
//                     <dt className="flex-shrink-0">
//                       <ClockIcon className="h-6 w-6 text-gray-400" />
//                     </dt>
//                     <dd className="ml-3 text-sm text-gray-900">
//                       {tripData.totalDays} dias
//                     </dd>
//                   </div>
//                   <div className="flex items-center">
//                     <dt className="flex-shrink-0">
//                       <DollarSignIcon className="h-6 w-6 text-gray-400" />
//                     </dt>
//                     <dd className="ml-3 text-sm text-gray-900">
//                       {tripData.budget}
//                     </dd>
//                   </div>
//                   <div className="flex items-center">
//                     <dt className="flex-shrink-0">
//                       <BedIcon className="h-6 w-6 text-gray-400" />
//                     </dt>
//                     <dd className="ml-3 text-sm text-gray-900">
//                       {tripData.accommodation}
//                     </dd>
//                   </div>
//                 </dl>
//               </div>
//             </div>

//             {/* <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
//               <div className="px-4 py-5 sm:p-6">
//                 <h2 className="text-lg font-medium text-gray-900">
//                   Previsão do Tempo
//                 </h2>
//                 <ul className="mt-4 space-y-3">
//                   {tripData.weather.map((day) => (
//                     <li
//                       key={day.day}
//                       className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
//                     >
//                       <div className="flex items-center">
//                         <day.icon className="h-6 w-6 text-gray-400" />
//                         <span className="ml-3 text-sm text-gray-900">
//                           Dia {day.day}
//                         </span>
//                       </div>
//                       <div className="text-sm">
//                         <span className="font-medium">{day.temp}</span>
//                         <span className="ml-2 text-gray-500">
//                           {day.condition}
//                         </span>
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div> */}

//           </div>
//           <div className="col-span-2">
//             <div className="bg-white shadow overflow-hidden rounded-lg">
//               <div className="border-b border-gray-200">
//                 <nav className="flex overflow-x-auto">
//                   {Array.from({ length: tripData.totalDays }).map(
//                     (_, index) => {
//                       const day = index + 1;
//                       return (
//                         <button
//                           key={day}
//                           onClick={() => setActiveDay(day)}
//                           className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
//                             activeDay === day
//                               ? "border-b-2 border-blue-500 text-blue-600"
//                               : "text-gray-500 hover:text-gray-700"
//                           }`}
//                         >
//                           Dia {day}
//                           <span className="block text-xs text-gray-500">
//                             {new Date(
//                               new Date(tripData.startDate).getTime() +
//                                 (day - 1) * 24 * 60 * 60 * 1000
//                             ).toLocaleDateString("pt-BR", {
//                               month: "short",
//                               day: "numeric",
//                             })}
//                           </span>
//                         </button>
//                       );
//                     }
//                   )}
//                 </nav>
//               </div>
//               <div className="px-4 py-5 sm:p-6">
//                 {tripData?.itinerary
//                   ?.filter((item) => item.dia === activeDay)
//                   .map((item, index) => (
//                     <div key={index}>
//                       {/* Aqui você pode preencher com as informações do itinerário */}
//                       <h2>Atividade para o Dia {activeDay}</h2>
//                       <p>{item.atividade}</p>
//                     </div>
//                   ))}
//               </div>
//             </div>

//             <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
//               <div className="px-4 py-5 sm:p-6">
//                 <h2 className="text-lg font-medium text-gray-900 mb-4">
//                   Mapa do Dia
//                 </h2>
//                 <div className="bg-gray-200 h-80 rounded-lg flex items-center justify-center">
//                   <div className="text-center">
//                     <MapIcon className="mx-auto h-12 w-12 text-gray-400" />
//                     <p className="mt-2 text-sm text-gray-500">
//                       Mapa interativo seria exibido aqui com os pontos do
//                       roteiro
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  LandmarkIcon,
  DownloadIcon,
  ShareIcon,
  EditIcon,
} from "lucide-react";

export function Itinerary() {
  const { id } = useParams();
  const [activeDay, setActiveDay] = useState(1);
  const [tripData, setTripData] = useState(null);

  // Função para calcular a diferença de dias entre as datas
  const calculateTotalDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end - start;
    return Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
  };

  // Função para buscar os dados do roteiro
  const fetchTripData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/roteiros/${id}`);
      if (!response.ok) throw new Error("Roteiro não encontrado");
      const data = await response.json();

      // Calcular os dias totais
      const totalDays = calculateTotalDays(data.data_ida, data.data_volta);

      // Formatar os dados para exibição
      setTripData({
        id,
        destination: data.cidade,
        startDate: data.data_ida,
        endDate: data.data_volta,
        budget: data.orcamento,
        totalDays: totalDays,
        accommodation: data.acomodacao,
        weather: data.previsao_tempo,
        itinerary: data.roteiro,
        resultados: data.pontos || [],
      });
    } catch (error) {
      console.error(error);
      setTripData(null);
    }
  };

  useEffect(() => {
    fetchTripData(); // Buscar os dados ao montar o componente

    const intervalId = setInterval(fetchTripData, 30000); // Atualizar os dados a cada 30 segundos

    // Limpeza do intervalo ao desmontar o componente
    return () => clearInterval(intervalId);
  }, [id]);

  if (!tripData) return <div>Carregando...</div>;

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
                {tripData?.itinerary
                  ?.filter((item) => item.dia === activeDay)
                  .map((item, index) => (
                    <div key={index}>
                      <h2>Atividade para o Dia {activeDay}</h2>
                      <p>{item.atividade}</p>
                    </div>
                  ))}
              </div>
            </div>

            <div className="mt-10">
              <ul className="space-y-4">
                {tripData.resultados?.map((ponto) => (
                  <li key={ponto.id} className="p-4 border rounded bg-gray-100">
                    <h3 className="text-xl font-semibold">
                      {ponto.nome || "Sem nome"}
                    </h3>
                    <p>Tipo: {ponto.tipo}</p>

                    {ponto.endereco && (
                      <p className="text-sm text-gray-600">
                        Endereço: {ponto.endereco.city}, {ponto.endereco.state}
                      </p>
                    )}

                    {ponto.clima && (
                      <div className="mt-2 text-sm text-green-700">
                        <p>
                          <strong>Clima:</strong> {ponto.clima.descricao}
                        </p>
                        <p>
                          <strong>Temperatura:</strong>{" "}
                          {ponto.clima.temperatura}°C
                        </p>
                      </div>
                    )}
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
          </div>
        </div>
      </div>
    </div>
  );
}
