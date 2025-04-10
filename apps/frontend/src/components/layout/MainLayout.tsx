"use client";

import React from "react";
import { useAuth } from "@/contexts/auth/AuthContext";
import { usePathname, redirect } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import LandingLayout from "./LandingLayout";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Rutas públicas que no necesitan el sidebar
  const isPublicRoute = ["", "/", "/login", "/register", "/home"].includes(
    pathname
  );

  if (isPublicRoute) {
    return <LandingLayout>{children}</LandingLayout>;
  }

  if (!isAuthenticated && !isPublicRoute) {
    redirect("/login");
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo en la parte superior */}
      <Header />

      {/* Contenedor principal con sidebar y contenido */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar />

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
