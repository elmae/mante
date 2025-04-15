import { TicketPriority, TicketStatus, TicketType } from "@/types/entities";

export interface ITicketFilters {
  search?: string;
  status?: TicketStatus[];
  priority?: TicketPriority[];
  type?: TicketType[];
  atmId?: string;
  assignedTo?: string;
  dateFrom?: Date;
  dateTo?: Date;
  metSla?: boolean;
}

export interface ITicketFiltersProps {
  filters: ITicketFilters;
  onFilterChange: (filters: ITicketFilters) => void;
  isLoading?: boolean;
}
