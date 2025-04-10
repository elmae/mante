"use client";

import React from "react";
import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="fixed top-0 z-50 w-full bg-white shadow-sm h-16">
      <div className="flex h-full items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary-600">CMMS</span>
          </Link>
        </div>

        {/* Enlaces de navegación */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </header>
  );
}

export default PublicHeader;
