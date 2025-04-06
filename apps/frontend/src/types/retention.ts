// Tipo base para reglas de retención
export interface BaseRetentionRule {
  mimeTypePattern: string;
  parentType: "ticket" | "maintenance" | "*";
  parentStatus: string[];
  retentionDays: number;
}

// Regla sin ID (para crear nuevas reglas)
export type NewRetentionRule = BaseRetentionRule;

// Regla con ID (para reglas existentes)
export interface RetentionRule extends BaseRetentionRule {
  id: string;
}

export const DEFAULT_RETENTION_RULES: NewRetentionRule[] = [
  {
    mimeTypePattern: "^image/",
    parentType: "ticket",
    parentStatus: ["closed", "resolved"],
    retentionDays: 90, // 3 meses para imágenes de tickets cerrados
  },
  {
    mimeTypePattern: "^application/(pdf|msword|vnd\\.openxmlformats)",
    parentType: "ticket",
    parentStatus: ["closed", "resolved"],
    retentionDays: 730, // 2 años para documentos de tickets cerrados
  },
  {
    mimeTypePattern: "^image/",
    parentType: "maintenance",
    parentStatus: ["completed"],
    retentionDays: 365, // 1 año para imágenes de mantenimientos completados
  },
  {
    mimeTypePattern: ".*",
    parentType: "*",
    parentStatus: [],
    retentionDays: 1825, // 5 años para todos los demás archivos
  },
];
