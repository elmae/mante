"use client";

import { useRouter } from "next/navigation";
import { TicketForm } from "@/components/tickets/TicketForm";
import { useTicket } from "@/hooks/useTicket";
import { TicketStatus } from "@/types/entities";
import { ITicketFormData } from "@/components/tickets/TicketForm";

export default function CreateTicketPage() {
  const router = useRouter();
  const { createTicket, isLoading } = useTicket();

  const handleSubmit = async (data: ITicketFormData) => {
    try {
      await createTicket({
        ...data,
        status: TicketStatus.OPEN, // Estado inicial para tickets nuevos
      });
      router.push("/tickets");
    } catch (error) {
      console.error("Error creating ticket:", error);
      // Aquí deberías mostrar un toast de error
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Ticket</h1>
      <TicketForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isLoading={isLoading}
      />
    </div>
  );
}
