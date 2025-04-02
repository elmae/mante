# Guía de Formatos de Identificadores del Sistema

## Formatos de Identificadores

### ATMs (Cajeros Automáticos)

- **Serial Number**

  - Formato: 8-12 caracteres alfanuméricos
  - Ejemplo: `ABC12345678`
  - Uso: Identificador para ATMs

- **Part Number**
  - Formato: 6-10 caracteres alfanuméricos
  - Ejemplo: `ABC12345`
  - Uso: Identificación de componentes y partes

### Tickets

- **Formato**: `TK-YYYYMMDD-XXXX`
  - `TK`: Prefijo fijo
  - `YYYYMMDD`: Fecha de creación (año, mes, día)
  - `XXXX`: 4 caracteres alfanuméricos únicos
- **Ejemplo**: `TK-20250327-AB12`
- **Uso**: Identificador único para tickets de servicio

### SLAs (Acuerdos de Nivel de Servicio)

- **Formato**: `SLA-PXXX-NNN`
  - `SLA`: Prefijo fijo
  - `P`: Prioridad (A=Alta, M=Media, B=Baja)
  - `XXX`: 3 caracteres alfanuméricos
  - `NNN`: Número secuencial (000-999)
- **Ejemplo**: `SLA-A123-001`
- **Uso**: Identificador único para acuerdos de nivel de servicio

## Reglas Generales

1. **Mayúsculas**: Todos los identificadores se almacenan y muestran en mayúsculas
2. **Caracteres permitidos**: Solo letras (A-Z) y números (0-9)
3. **Validación**: Se realiza tanto en frontend como en backend
4. **Unicidad**: Cada identificador debe ser único en su dominio

## Uso en APIs

### Rutas

- ATMs: `/atms/{atm_id}`
- Tickets: `/tickets/{ticket_id}`
- SLAs: `/slas/{sla_id}`

### Búsqueda y Filtrado

- Se pueden buscar por identificador completo o parcial
- Búsquedas no sensibles a mayúsculas/minúsculas
- Soporte para comodines en búsquedas avanzadas

## Migración desde Formatos Anteriores

1. ATMs: Ya migrados al nuevo formato alfanumérico
2. Tickets: Migración automática mantiene trazabilidad histórica
3. SLAs: Nuevo formato incluye información de prioridad

## Consideraciones para Desarrollo

1. **Generación**:

   - Tickets: Usar fecha actual + secuencia aleatoria
   - SLAs: Usar prioridad + secuencia incremental

2. **Validación**:

   - Implementar expresiones regulares proporcionadas
   - Validar unicidad antes de crear nuevos registros

3. **Frontend**:
   - Conversión automática a mayúsculas
   - Validación en tiempo real
   - Mensajes de error descriptivos

## Recomendaciones

1. **Consistencia**:

   - Usar los formatos establecidos de manera consistente
   - No crear variaciones o excepciones

2. **Mantenimiento**:

   - Documentar cualquier cambio en los formatos
   - Mantener registro de identificadores obsoletos

3. **Interfaz de Usuario**:
   - Mostrar ejemplos de formato válido
   - Proporcionar retroalimentación inmediata
   - Facilitar la copia y pegado de identificadores
