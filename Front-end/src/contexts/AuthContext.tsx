import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Tipagem do contexto
interface AuthContextType {
  userName: string | null;
  setUserName: React.Dispatch<React.SetStateAction<string | null>>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // novo estado

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser && parsedUser.nome) {
          setUserName(parsedUser.nome);
        }
      } catch (error) {
        console.error("Erro ao recuperar usuário:", error);
      }
    }
    setLoading(false); // terminou de verificar
  }, []);

  return (
    <AuthContext.Provider value={{ userName, setUserName, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
