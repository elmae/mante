import { PartialType } from '@nestjs/swagger';
import { CreateAtmDto } from './create-atm.dto';

export class UpdateAtmDto extends PartialType(CreateAtmDto) {
  // Campos adicionales específicos para actualización

  // Campo para registrar el último mantenimiento
  lastMaintenanceDate?: Date;

  // Campo para status operativo
  isOperational?: boolean;

  // Campo para estado del inventario
  inventoryStatus?: {
    cashLevel?: number;
    receiptPaper?: number;
    cardStock?: number;
    lastRefillDate?: Date;
  };

  // Campos para métricas de rendimiento
  performanceMetrics?: {
    uptime?: number;
    transactionCount?: number;
    errorRate?: number;
    lastErrorDate?: Date;
    errorTypes?: string[];
  };

  // Campo para historial de actualizaciones de software
  softwareUpdates?: {
    currentVersion?: string;
    lastUpdateDate?: Date;
    pendingUpdates?: boolean;
  };

  // Campo para registro de incidentes
  lastIncidentReport?: {
    date?: Date;
    type?: string;
    description?: string;
    resolved?: boolean;
  };
}
