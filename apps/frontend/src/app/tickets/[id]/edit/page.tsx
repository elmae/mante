"use client";

import { useRouter } from "next/navigation";
import { TicketForm } from "@/components/tickets/TicketForm";
import { useTicket } from "@/hooks/useTicket";
import { ITicketFormData } from "@/components/tickets/TicketForm";

interface EditTicketPageProps {
  params: {
    id: string;
  };
}

export default function EditTicketPage({ params }: EditTicketPageProps) {
  const router = useRouter();
  const { data: ticket, updateTicket, isLoading } = useTicket(params.id);

  const handleSubmit = async (data: ITicketFormData) => {
    try {
      await updateTicket({
        ...data,
      });
      router.push("/tickets");
    } catch (error) {
      console.error("Error updating ticket:", error);
      // Aquí deberías mostrar un toast de error
    }
  };

  if (!ticket && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Ticket no encontrado</div>
      </div>
    );
  }

  const initialData: ITicketFormData = {
    title: ticket.title,
    description: ticket.description,
    type: ticket.type,
    priority: ticket.priority,
    atm_id: ticket.atm_id,
    assigned_to: ticket.assigned_to,
    due_date: ticket.due_date ? new Date(ticket.due_date) : undefined,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Editar Ticket</h1>
      <TicketForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isLoading={isLoading}
        initialData={initialData}
      />
    </div>
  );
}
