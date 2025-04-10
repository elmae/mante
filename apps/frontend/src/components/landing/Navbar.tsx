import Link from "next/link";
import { Button } from "../common/Button";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-1 flex items-center">
            <Link href="/home" className="text-2xl font-bold text-blue-600">
              CMMS
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              <Link
                href="#features"
                className="text-gray-600 hover:text-gray-900"
              >
                Características
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900"
              >
                Cómo Funciona
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary">Registrarse</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
