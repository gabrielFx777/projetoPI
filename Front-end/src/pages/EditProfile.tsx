import React, { useEffect, useState } from "react";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  CameraIcon,
  LockIcon,
} from "lucide-react";
import perfilImg from "../../imgs/user.png";
import { useAuth } from "../contexts/AuthContext";

export function EditProfile() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const { setUserName } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      const storedUser = localStorage.getItem("user");
      const userId = storedUser ? JSON.parse(storedUser).id : null;

      if (!userId) {
        console.error("ID do usuário não encontrado.");
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/perfil/${userId}`
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Erro ao buscar perfil");
        setFormData(data);
      } catch (error) {
        alert("Erro ao carregar dados do perfil");
        console.error(error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const storedUser = localStorage.getItem("user");
    const userId = storedUser ? JSON.parse(storedUser).id : null;

    if (!userId) {
      alert("ID do usuário não encontrado.");
      setLoading(false);
      return;
    }

    try {
      // Atualiza dados básicos
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/perfil/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Erro ao atualizar perfil");

      // Atualiza senha se preenchida
      if (senhaAtual && novaSenha && confirmarSenha) {
        if (novaSenha !== confirmarSenha) {
          alert("A nova senha e a confirmação não coincidem.");
          setLoading(false);
          return;
        }

        const senhaResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/alterar-senha/${userId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senhaAtual, novaSenha }),
          }
        );

        const senhaData = await senhaResponse.json();
        if (!senhaResponse.ok)
          throw new Error(senhaData.error || "Erro ao alterar senha");
      }

      alert("Perfil atualizado com sucesso!");

      // ✅ Atualiza nome no localStorage e no contexto (Header)
      localStorage.setItem(
        "user",
        JSON.stringify({ nome: formData.name, id: userId })
      );
      setUserName(formData.name);

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Editar Perfil
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Atualize suas informações pessoais ou altere sua senha
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={perfilImg}
                    alt="Foto do perfil"
                    className="h-24 w-24 rounded-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 border border-gray-300 shadow-sm hover:bg-gray-50"
                  >
                    <CameraIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Nome */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nome completo
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                  />
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Telefone
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                  />
                </div>
              </div>

              {/* Alterar senha */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Alterar Senha
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Senha atual
                    </label>
                    <input
                      type="password"
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      placeholder="Digite sua senha atual"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nova senha
                    </label>
                    <input
                      type="password"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Confirmar nova senha
                    </label>
                    <input
                      type="password"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
