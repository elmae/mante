// Re-export response types
export * from './response.types';

// Re-export filter types
export * from './filter.types';

// Common interfaces
export interface GeoPoint {
  type: 'Point';
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface GeoSearch {
  latitude: number;
  longitude: number;
  radius?: number; // en kilómetros
}

export interface AuditInfo {
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

export interface FileInfo {
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url?: string;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type DateRange = {
  startDate: Date;
  endDate: Date;
};

// Common type guards
export function isDateRange(value: any): value is DateRange {
  return (
    value &&
    typeof value === 'object' &&
    value.startDate instanceof Date &&
    value.endDate instanceof Date
  );
}

export function isGeoPoint(value: any): value is GeoPoint {
  return (
    value &&
    typeof value === 'object' &&
    value.type === 'Point' &&
    typeof value.coordinates === 'object' &&
    typeof value.coordinates.latitude === 'number' &&
    typeof value.coordinates.longitude === 'number'
  );
}

// Common constants
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  DISPLAY: 'DD/MM/YYYY',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm'
} as const;
