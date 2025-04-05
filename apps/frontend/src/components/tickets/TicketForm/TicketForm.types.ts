import { ATM, User } from "@/types/entities";
import { TicketPriority, TicketStatus, TicketType } from "@/types/entities";

export interface ITicketFormProps {
  onSubmit: (data: ITicketFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<ITicketFormData>;
  isLoading?: boolean;
}

export interface ITicketFormData {
  title: string;
  description: string;
  type: TicketType;
  priority: TicketPriority;
  atm_id: string;
  assigned_to?: string;
  due_date?: Date;
}

export interface IFormContext {
  atms: ATM[];
  users: User[];
  isLoadingAtms: boolean;
  isLoadingUsers: boolean;
}
