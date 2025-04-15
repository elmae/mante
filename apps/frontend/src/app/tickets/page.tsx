"use client";
import { TicketList } from "@/components/tickets/TicketList";

export default function TicketsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Tickets</h1>
      <TicketList />
    </div>
  );
}
