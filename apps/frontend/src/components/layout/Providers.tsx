"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MainLayout from "./MainLayout";

// Create a client
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>{children}</MainLayout>
    </QueryClientProvider>
  );
}

export default Providers;
