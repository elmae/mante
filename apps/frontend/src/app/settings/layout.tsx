"use client";
import { settingsNavigation } from "@/lib/settings-navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Navegación lateral */}
          <nav className="col-span-12 lg:col-span-3 space-y-1">
            {settingsNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-gray-100 text-blue-600"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "flex-shrink-0 -ml-1 mr-3 h-6 w-6",
                      isActive
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-gray-500"
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Contenido principal */}
          <main className="col-span-12 lg:col-span-9">
            <div className="bg-white shadow rounded-lg">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
