import { TicketPriority, TicketStatus, TicketType } from "@/types/entities";

export interface ITicketFilters {
  search?: string;
  status?: TicketStatus[];
  priority?: TicketPriority[];
  type?: TicketType[];
  atm_id?: string;
  assigned_to?: string;
  date_from?: Date;
  date_to?: Date;
  met_sla?: boolean;
}

export interface ITicketFiltersProps {
  filters: ITicketFilters;
  onFilterChange: (filters: ITicketFilters) => void;
  isLoading?: boolean;
}
