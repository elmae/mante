import React from "react";

export const metadata = {
  title: "Métricas - Sistema CMMS",
  description: "Análisis detallado de métricas y rendimiento del sistema CMMS",
};

export default function MetricsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
