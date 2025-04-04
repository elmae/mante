import React from "react";
import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";

interface HeaderProps {
  // Props que se pueden agregar según necesidades
}

export function Header({}: HeaderProps) {
  return (
    <header className="fixed top-0 z-50 w-full bg-white shadow-sm h-16">
      <div className="flex h-full items-center justify-between px-4">
        {/* Logo y toggle del menú */}
        <div className="flex items-center">
          <button
            type="button"
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="ml-4 flex lg:ml-6">
            <span className="text-xl font-bold text-primary-600">CMMS</span>
          </div>
        </div>

        {/* Acciones del header */}
        <div className="flex items-center gap-4">
          {/* Notificaciones */}
          <button
            type="button"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600"
          >
            <BellIcon className="h-6 w-6" />
          </button>

          {/* Avatar del usuario */}
          <div className="relative">
            <button
              type="button"
              className="flex rounded-full bg-gray-100 text-sm focus:outline-none"
            >
              <span className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700">
                US
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
