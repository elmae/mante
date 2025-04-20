import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export interface GeoPoint {
  type: 'Point';
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface GeoPointInput {
  lat?: number;
  lng?: number;
  type?: string;
  coordinates?: number[] | { latitude: number; longitude: number };
}

export interface GeoPointValidationOptions extends ValidationOptions {
  allowNull?: boolean;
}

export function IsGeoPoint(validationOptions?: GeoPointValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      name: 'isGeoPoint',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          if (validationOptions?.allowNull && value === null) {
            return true;
          }

          if (!value || typeof value !== 'object') {
            return false;
          }

          const point = value as GeoPoint;

          // Validar estructura básica
          if (point.type !== 'Point' || !point.coordinates) {
            return false;
          }

          const { latitude, longitude } = point.coordinates;

          // Validar que los valores sean números
          if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return false;
          }

          // Validar rango de latitud (-90 a 90)
          if (latitude < -90 || latitude > 90) {
            return false;
          }

          // Validar rango de longitud (-180 a 180)
          if (longitude < -180 || longitude > 180) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be a valid GeoPoint with latitude (-90 to 90) and longitude (-180 to 180)`;
        }
      }
    });
  };
}

// Decorador de transformación para asegurar el formato correcto
export function TransformGeoPoint() {
  return function (target: object, propertyKey: string): void {
    let value: GeoPoint | null;

    Object.defineProperty(target, propertyKey, {
      get: () => value,
      set: (newVal: GeoPointInput | null) => {
        if (!newVal) {
          value = null;
          return;
        }

        // Si se proveen lat/lng directamente
        if (
          'lat' in newVal &&
          'lng' in newVal &&
          typeof newVal.lat === 'number' &&
          typeof newVal.lng === 'number'
        ) {
          value = {
            type: 'Point',
            coordinates: {
              latitude: newVal.lat,
              longitude: newVal.lng
            }
          };
        }
        // Si se provee en formato GeoJSON
        else if (newVal.type === 'Point' && Array.isArray(newVal.coordinates)) {
          value = {
            type: 'Point',
            coordinates: {
              latitude: Number(newVal.coordinates[1]),
              longitude: Number(newVal.coordinates[0])
            }
          };
        }
        // Si ya está en el formato correcto
        else if (
          newVal.type === 'Point' &&
          typeof newVal.coordinates === 'object' &&
          newVal.coordinates !== null
        ) {
          const coords = newVal.coordinates as { latitude: number; longitude: number };
          value = {
            type: 'Point',
            coordinates: {
              latitude: Number(coords.latitude),
              longitude: Number(coords.longitude)
            }
          };
        } else {
          value = null;
        }
      },
      enumerable: true,
      configurable: true
    });
  };
}
