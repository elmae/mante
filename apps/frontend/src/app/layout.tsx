import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "ATM Management System",
  description: "Sistema de gestión de ATMs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
