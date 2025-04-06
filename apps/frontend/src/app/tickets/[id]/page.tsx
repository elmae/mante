"use client";

import { useTicket } from "@/hooks/useTicket";
import { TicketDetails } from "@/components/tickets/TicketDetails";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";

export default function TicketPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: ticket, isLoading } = useTicket(id);
  const { user } = useUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/tickets"
          className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver a tickets
        </Link>
      </div>

      <TicketDetails
        ticket={ticket}
        isLoading={isLoading}
        currentUser={
          user
            ? {
                id: user.id,
                email: user.email,
                name: user.name,
              }
            : undefined
        }
      />
    </div>
  );
}
