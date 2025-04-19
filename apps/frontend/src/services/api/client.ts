import axios, { AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Crear instancia de axios con configuración base
export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token de autenticación
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tipos de error personalizados
export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

// Función para procesar errores
export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const data = error.response?.data;

    // Si el backend devuelve un formato específico de error
    if (data?.code && data?.message) {
      return {
        message: data.message,
        code: data.code,
        details: data.details,
      };
    }

    // Manejar errores HTTP comunes
    switch (error.response?.status) {
      case 400:
        return {
          message: "Solicitud inválida. Por favor, verifica los datos.",
          code: "INVALID_REQUEST",
        };
      case 401:
        // Podríamos manejar el refresh token aquí o redirigir al login
        return {
          message: "Sesión expirada. Por favor, inicia sesión nuevamente.",
          code: "UNAUTHORIZED",
        };
      case 403:
        return {
          message: "No tienes permiso para realizar esta acción.",
          code: "FORBIDDEN",
        };
      case 404:
        return {
          message: "El recurso solicitado no existe.",
          code: "NOT_FOUND",
        };
      case 409:
        return {
          message: "Conflicto al procesar la solicitud. Intenta nuevamente.",
          code: "CONFLICT",
        };
      case 500:
        return {
          message: "Error interno del servidor. Por favor, intenta más tarde.",
          code: "SERVER_ERROR",
        };
      default:
        return {
          message:
            "Error al procesar la solicitud. Por favor, intenta nuevamente.",
          code: "UNKNOWN_ERROR",
        };
    }
  }

  // Para otros tipos de errores
  return {
    message: "Error inesperado. Por favor, intenta nuevamente.",
    code: "UNKNOWN_ERROR",
  };
}
