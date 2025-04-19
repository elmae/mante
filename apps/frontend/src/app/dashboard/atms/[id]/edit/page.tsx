"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AtmForm } from "@/components/atms/AtmForm";
import { atmService } from "@/services/api/atm";
import { ATM } from "@/types/entities";

interface EditAtmPageProps {
  params: {
    id: string;
  };
}

export default function EditAtmPage({ params }: EditAtmPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [atm, setAtm] = useState<ATM | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAtm = async () => {
      try {
        const data = await atmService.getATM(params.id);
        setAtm(data);
      } catch (err) {
        setError("Error al cargar el ATM");
        console.error("Error al cargar ATM:", err);
      }
    };

    fetchAtm();
  }, [params.id]);

  const handleSubmit = async (data: Omit<ATM, "id">) => {
    try {
      setIsLoading(true);
      await atmService.updateATM(params.id, data);
      router.push("/dashboard/atms");
    } catch (err) {
      setError("Error al actualizar el ATM");
      console.error("Error al actualizar ATM:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      </div>
    );
  }

  if (!atm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar ATM</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <AtmForm
          initialData={atm}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/dashboard/atms")}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
