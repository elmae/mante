// Módulo principal
export { AtmsModule } from './atms.module';

// DTOs
export { CreateAtmDto } from './dto/create-atm.dto';
export { UpdateAtmDto } from './dto/update-atm.dto';
export { FilterAtmDto, AtmSortField } from './dto/filter-atm.dto';

// Servicios
export { AtmsService } from './services/atms.service';

// Controladores
export { AtmsController } from './controllers/atms.controller';

// Tipos comunes
export interface AtmPerformanceMetrics {
  uptime: number;
  transactionCount: number;
  errorRate: number;
  lastErrorDate: Date;
  errorTypes: string[];
}

export interface AtmInventoryStatus {
  cashLevel: number;
  receiptPaper: number;
  cardStock: number;
  lastRefillDate: Date;
}

export interface AtmSoftwareStatus {
  currentVersion: string;
  lastUpdateDate: Date;
  pendingUpdates: boolean;
}

export interface AtmLocation {
  type: 'Point';
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface AtmIncidentReport {
  date: Date;
  type: string;
  description: string;
  resolved: boolean;
}

// Constantes
export const ATM_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_CASH_LEVEL_ALERT: 20, // Porcentaje
  MIN_PAPER_LEVEL_ALERT: 15, // Porcentaje
  MIN_CARD_STOCK_ALERT: 50, // Cantidad
  MAX_ERROR_RATE_THRESHOLD: 5, // Porcentaje
  MIN_UPTIME_THRESHOLD: 95, // Porcentaje
  LOCATION_SEARCH_MAX_RADIUS: 50 // Kilómetros
} as const;
