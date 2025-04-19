"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ATMTable } from "./ATMTable";
import type { ATM } from "@/types/entities";

export function AtmListContainer() {
  const router = useRouter();
  const [atms, setAtms] = useState<ATM[]>([]);

  useEffect(() => {
    const fetchAtms = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/atms?limit=1000`
        );
        if (!response.ok) {
          throw new Error("Error al cargar ATMs");
        }
        const data = await response.json();
        setAtms(data);
      } catch (error) {
        console.error("Error al cargar ATMs:", error);
        setAtms([]);
      }
    };

    fetchAtms();
  }, []);

  const handleView = (atm: ATM) => {
    router.push(`/dashboard/atms/${atm.id}`);
  };

  const handleEdit = (atm: ATM) => {
    router.push(`/dashboard/atms/${atm.id}/edit`);
  };

  const handleDelete = async (atm: ATM) => {
    if (!confirm("¿Está seguro que desea eliminar este ATM?")) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/atms/${atm.id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Error al eliminar ATM");
      }
      // Actualizar la lista de ATMs después de eliminar
      setAtms(atms.filter((item) => item.id !== atm.id));
    } catch (error) {
      console.error("Error al eliminar ATM:", error);
    }
  };

  const handleMaintenance = (atm: ATM) => {
    router.push(`/dashboard/atms/${atm.id}/maintenance/new`);
  };

  return (
    <ATMTable
      atms={atms}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onMaintenance={handleMaintenance}
    />
  );
}

export default AtmListContainer;
