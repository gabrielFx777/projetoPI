import React, { useEffect, useState } from "react";
import { PlaneTakeoffIcon, GlobeIcon } from "lucide-react";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsComplete(true);
          setTimeout(() => {
            onLoadingComplete();
          }, 700);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 120);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-sky-900 via-blue-800 to-blue-900 flex items-center justify-center z-50 transition-opacity duration-700 ${
        isComplete ? "opacity-0 pointer-events-none" : ""
      }`}
    >
      <div className="text-center">
        {/* Globo girando com efeito de brilho pulsante */}
        <div className="mb-8 animate-glow-pulse flex justify-center">
          <GlobeIcon className="h-20 w-20 text-white animate-spin-slow drop-shadow-xl" />
        </div>

        {/* Título do app */}
        <h1 className="text-4xl font-extrabold text-white tracking-wide mb-2">
          TravelPlan
        </h1>

        {/* Texto com animação de entrada */}
        <p className="text-blue-100 text-lg mb-6 animate-slide-in font-mono">
          Embarcando na sua aventura...
        </p>

        {/* Barra de progresso com avião decolando */}
        <div className="relative w-64 h-16 mx-auto mb-4">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-2 bg-blue-500 bg-opacity-30 rounded-full">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <PlaneTakeoffIcon
            className="absolute h-8 w-8 text-white animate-plane-takeoff"
            style={{
              left: `${Math.min(progress, 100)}%`,
              bottom: "-10px",
              transform: "translateX(-50%)",
            }}
          />
        </div>

        {/* Texto de porcentagem */}
        <p className="text-sm text-blue-200 mb-4 tracking-wider">
          Carregando... {Math.round(progress)}%
        </p>

        {/* Pontos animados (ping) */}
        <div className="flex justify-center mt-4 space-x-2">
          <div className="w-3 h-3 bg-blue-300 rounded-full animate-pulse" />
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-150" />
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-300" />
        </div>
      </div>
    </div>
  );
}
