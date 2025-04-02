# Guía de Formatos de Identificadores ATM

## Introducción

Esta guía describe los nuevos formatos de identificadores implementados para los cajeros automáticos (ATMs) en el sistema.

## Número de Serie

### Formato

- Longitud: 8-12 caracteres
- Caracteres permitidos: Letras mayúsculas (A-Z) y números (0-9)
- Ejemplos válidos:
  - `ABC12345678`
  - `XYZ9876543`
  - `12345ABCDE`

### Reglas

1. Solo se permiten caracteres alfanuméricos
2. No se permiten espacios ni caracteres especiales
3. Se convierte automáticamente a mayúsculas
4. Debe ser único en el sistema

## Número de Parte

### Formato

- Longitud: 6-10 caracteres
- Caracteres permitidos: Letras mayúsculas (A-Z) y números (0-9)
- Ejemplos válidos:
  - `ABC1234`
  - `XY987654`
  - `123ABCDEF`

### Reglas

1. Solo se permiten caracteres alfanuméricos
2. No se permiten espacios ni caracteres especiales
3. Se convierte automáticamente a mayúsculas

## Recomendaciones de Uso

1. **Consistencia**: Aunque el sistema es flexible, se recomienda mantener un formato consistente dentro de su organización.

2. **Legibilidad**:

   - Use combinaciones que sean fáciles de leer y recordar
   - Considere usar prefijos significativos para diferentes tipos de ATMs

3. **Búsqueda**:
   - Los identificadores son indexados para búsquedas rápidas
   - Se puede buscar por parte del identificador

## Migración desde Formatos Antiguos

Si está migrando desde formatos antiguos:

1. Los guiones y otros caracteres especiales deben eliminarse
2. Asegúrese de que el resultado cumpla con las longitudes mínimas y máximas
3. Utilice solo caracteres alfanuméricos permitidos

## Soporte

Para cualquier duda sobre los formatos o asistencia en la migración, contacte al equipo de soporte técnico.
