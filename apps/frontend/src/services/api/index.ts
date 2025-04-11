import axios from "axios";

export const api = axios.create({
  baseURL: `${
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  }/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejar tokens
api.interceptors.request.use((config) => {
  console.log("Interceptor ejecutado para URL:", config.url);
  const token = localStorage.getItem("token");
  console.log("Interceptor - Token encontrado:", token);
  if (token) {
    console.log("Interceptor - Token válido:", !!token);
    console.log("Interceptor - Agregando header Authorization");
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Interceptor - Header agregado:", config.headers.Authorization);
  }
  console.log("Interceptor - Config final:", {
    url: config.url,
    headers: config.headers,
  });
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
