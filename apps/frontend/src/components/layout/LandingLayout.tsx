"use client";

import React from "react";
import PublicHeader from "./PublicHeader";

interface LandingLayoutProps {
  children: React.ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo en la parte superior */}
      <PublicHeader />

      {/* Contenido principal sin sidebar */}
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </div>
  );
}

export default LandingLayout;
