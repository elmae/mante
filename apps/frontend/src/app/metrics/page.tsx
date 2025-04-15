"use client";

import React from "react";
import MetricsDisplay from "../../components/dashboard/MetricsDisplay";

const MetricsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Métricas del Sistema
        </h1>
        <p className="mt-2 text-gray-600">
          Análisis detallado de tiempos de respuesta, resolución y estado de
          tickets
        </p>
      </div>

      <MetricsDisplay />
    </div>
  );
};

export default MetricsPage;
