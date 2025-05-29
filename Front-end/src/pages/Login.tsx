import { useAuth } from "../contexts/AuthContext"; // Importando o contexto
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserIcon, LockIcon } from "lucide-react";
import axios from "axios";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // const [userName, setUserName] = useState<string>("");

  // Login.tsx
  const { setUserName } = useAuth(); // Adicione isso

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "https://projetopi-1.onrender.com/api/login",
        {
          email,
          password,
        }
      );

      console.log("Login bem-sucedido:", response.data);
      const { token, userName, userId } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({ nome: userName, id: userId })
      );

      setUserName(userName);
      setIsAuthenticated(true);

      if (userId === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Erro ao fazer login", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert("Email ou senha incorretos.");
        } else {
          alert("Erro ao conectar com o servidor.");
        }
      } else {
        alert("Erro inesperado. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Entre na sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            crie uma nova conta
          </Link>
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Lembrar de mim
                </label>
              </div>
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Esqueceu sua senha?
                </a>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </div>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Ou continue com
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482
                      0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342
                      -.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608
                      1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832
                      .092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943
                      0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647
                      0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114
                      2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1
                      2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566
                      4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743
                      0 .267.18.578.688.48C17.137 18.167 20 14.42 20 10c0-5.523-4.477-10
                      -10-10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482
                      0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342
                      -.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608
                      1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832
                      .092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943
                      0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647
                      0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114
                      2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1
                      2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566
                      4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743
                      0 .267.18.578.688.48C17.137 18.167 20 14.42 20 10c0-5.523-4.477-10
                      -10-10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
