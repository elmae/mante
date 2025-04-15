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
        assignedToId: data.assignedTo,
        assignedTo: undefined,
        dueDate: data.dueDate?.toISOString(),
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
    atmId: ticket.atmId,
    assignedTo: ticket.assignedTo?.id ?? undefined,
    dueDate: ticket.dueDate ? new Date(ticket.dueDate) : undefined,
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
