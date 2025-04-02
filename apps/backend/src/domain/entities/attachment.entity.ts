import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Ticket } from "./ticket.entity";

@Entity("attachments")
export class Attachment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  ticket_id: string;

  @Column({ type: "varchar" })
  file_name: string;

  @Column({ type: "varchar" })
  file_path: string;

  @Column({ type: "varchar" })
  mime_type: string;

  @Column({ type: "bigint" })
  file_size: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @Column({ type: "uuid" })
  created_by_id: string;

  // Relaciones
  @ManyToOne(() => Ticket)
  @JoinColumn({ name: "ticket_id" })
  ticket: Ticket;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by_id" })
  created_by: User;

  // Métodos de utilidad
  getFileExtension(): string {
    return this.file_name.split(".").pop() || "";
  }

  getFileSizeInMB(): number {
    return Math.round((this.file_size / (1024 * 1024)) * 100) / 100;
  }

  isImage(): boolean {
    return this.mime_type.startsWith("image/");
  }

  isPDF(): boolean {
    return this.mime_type === "application/pdf";
  }

  getPublicUrl(): string {
    // La lógica específica de la URL se implementará en el servicio
    return `/api/v1/attachments/${this.id}`;
  }
}
