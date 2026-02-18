import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

interface User {
  id?: number;
  last_name?: string;  
  first_name?: string;
  email: string;
  number?: string;
  country?: string;
  state?: string;
  role?: {
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  setUser: (user: any) => void;
  updateUser: (data: any) => Promise<void>;
  signUp: (data: any) => Promise<string>;
  login: (access: string, refresh: string) => Promise<void>;
  logout: () => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: any }>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = async () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  const updateUser = async (data: any) => {
    try {
      const res = await api.put("/users/update-profile", data);

      setUser(res.data.response);

    } catch (error) {
      console.error("Erreur update profile", error);
    }
  };

  const signUp = async (data: any) => {
    try {
      const res = await api.post("/users/signup", data);
      return res.data.message;
    } catch (error) {
      console.error("Erreur signup", error);
      throw new Error(error.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  const loadUser = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await api.get("/users/profile");
      setUser(prev => ({ ...prev, ...res.data.response }));
    } catch (err) {
      console.log("Token invalide");
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (access: string, refresh: string) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    await loadUser();
    navigate("/");
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      const result = await api.put("/users/change-password", {
        currentPassword,
        newPassword,
      });

      return { data: result.data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data || {
          message: "Something went wrong",
        },
      };
    }
  };


  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        signUp,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
        updatePassword,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
