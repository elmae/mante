"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AtmForm } from "@/components/atms/AtmForm";
import { atmService } from "@/services/api/atm";
import { ATM } from "@/types/entities";

export default function NewAtmPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: Omit<ATM, "id">) => {
    try {
      setIsLoading(true);
      await atmService.createATM(data);
      router.push("/dashboard/atms");
    } catch (error) {
      console.error("Error al crear ATM:", error);
      // TODO: Implementar manejo de errores con un componente Toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo ATM</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <AtmForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => router.push("/dashboard/atms")}
        />
      </div>
    </div>
  );
}
