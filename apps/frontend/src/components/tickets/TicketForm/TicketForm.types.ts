import { ATM, User } from "@/types/entities";
import { TicketPriority, TicketType } from "@/types/entities";

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
  atmId: string;
  assignedTo?: string;
  dueDate?: Date;
}

export interface IFormContext {
  atms: ATM[];
  users: User[];
  isLoadingAtms: boolean;
  isLoadingUsers: boolean;
}
