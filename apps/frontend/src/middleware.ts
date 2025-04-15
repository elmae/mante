import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Verificar si el usuario está autenticado
  const token = request.cookies.get("token")?.value;

  // Rutas que requieren autenticación
  const protectedPaths = [
    "/dashboard",
    "/tickets",
    "/atms",
    "/maintenance",
    "/settings",
    "/metrics", // Añadimos la nueva ruta de métricas
  ];

  // Rutas que requieren permisos específicos
  const permissionPaths = {
    "/metrics": ["view_metrics"], // Nueva ruta que requiere permiso específico
    "/settings": ["manage_settings"],
  };

  // Comprobar si la ruta actual está protegida
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !token) {
    // Redirigir a login si no hay token
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar permisos específicos basados en la ruta
  const currentPath = protectedPaths.find((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (
    currentPath &&
    permissionPaths[currentPath as keyof typeof permissionPaths]
  ) {
    // Aquí se podría verificar los permisos del usuario
    // Por ahora, la verificación detallada de permisos se hace en el componente
    // ya que necesitamos acceso al contexto de usuario
  }

  return NextResponse.next();
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tickets/:path*",
    "/atms/:path*",
    "/maintenance/:path*",
    "/settings/:path*",
    "/metrics/:path*", // Añadimos la nueva ruta al matcher
  ],
};
