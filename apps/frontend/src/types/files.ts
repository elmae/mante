export interface FileAttachment {
  id: string;
  ticket_id?: string;
  maintenance_record_id?: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  created_by_id: string;
  deleted_at?: string;
  deleted_by_id?: string;
  public_url: string;
  parent_type: "ticket" | "maintenance" | "unknown";
}

export interface FileUploadResponse {
  attachment: FileAttachment;
  error?: string;
}

export interface FileUploadOptions {
  maxSize?: number; // en bytes
  allowedTypes?: string[];
  multiple?: boolean;
}

export type FileOperationType =
  | "upload"
  | "download"
  | "delete"
  | "restore"
  | "move_to_recycle"
  | "permanent_delete";

export interface FileOperation {
  fileId: string;
  operation: FileOperationType;
  userId: string;
  timestamp: string;
  details?: Record<string, any>;
}
