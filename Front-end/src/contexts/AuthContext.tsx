import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Tipagem do contexto
interface AuthContextType {
  userName: string | null;
  setUserName: React.Dispatch<React.SetStateAction<string | null>>;
}

// Criação do contexto com tipagem
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider do contexto com tipagem
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [userName, setUserName] = useState<string | null>(null);

  // Verificar se há um usuário logado ao carregar o contexto
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserName(parsedUser.nome); // Atualiza o nome do usuário no contexto
      } catch {
        setUserName(null);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ userName, setUserName }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acessar o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
