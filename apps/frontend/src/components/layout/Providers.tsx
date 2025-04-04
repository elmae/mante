"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import MainLayout from "./MainLayout";

// Crear una instancia de QueryClient con configuración personalizada
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 2,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>{children}</MainLayout>
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        theme="light"
        duration={4000}
        visibleToasts={3}
        toastOptions={{
          style: {
            fontFamily: "inherit",
          },
          className: "my-toast-class",
        }}
      />
    </QueryClientProvider>
  );
}

export default Providers;
