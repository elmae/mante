import { createContext, useContext, useReducer, useEffect } from "react";
import { IUser } from "@/types";

interface AuthState {
  isAuthenticated: boolean;
  user: IUser | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
};

type AuthAction =
  | { type: "LOGIN_SUCCESS"; payload: { user: IUser; token: string } }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { token, user: JSON.parse(user) },
      });
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      console.log("🔍 Intentando login con:", {
        email,
        url: "/api/v1/auth/login",
      });

      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      console.log("📨 [AuthContext] Respuesta del servidor:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      let data;
      try {
        data = await response.json();
        console.log("📦 [AuthContext] Datos recibidos:", data);
      } catch (err) {
        console.error("❌ [AuthContext] Error parseando JSON:", err);
        throw new Error("Error al procesar respuesta del servidor");
      }

      if (!response.ok) {
        throw new Error(data.error?.message || "Error al iniciar sesión");
      }
      if (response.status === 200 && data.data?.token) {
        console.log("📦 [AuthContext] Guardando token y estableciendo cookie");
        const token = data.data.token;

        // Guardar en localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        // Establecer cookie para el middleware
        document.cookie = `token=${token}; path=/; SameSite=Lax`;

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user: data.data.user,
            token: token,
          },
        });
      } else {
        throw new Error(data.error?.message || "Error de autenticación");
      }
    } catch (error) {
      console.error("❌ Error en login:", error);
      dispatch({ type: "SET_LOADING", payload: false });
      throw error;
    }
  };

  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Limpiar cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
