import { Inter } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CMMS - Sistema de Gestión de Mantenimiento",
  description: "Sistema de gestión de mantenimiento para ATMs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
