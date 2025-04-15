# Sistema de Métricas

## Arquitectura

El sistema de métricas está implementado siguiendo una arquitectura de tres capas:

1. **Capa de Datos**

   - Entidades principales: Ticket, ATM, User
   - Cálculos realizados a través de TypeORM QueryBuilder
   - Índices optimizados para consultas frecuentes

2. **Capa de Servicios**

   - MetricsService: Centraliza la lógica de cálculo de métricas
   - Cálculos bajo demanda para asegurar datos en tiempo real
   - Implementación de caché para consultas frecuentes (pendiente)

3. **Capa de Presentación**
   - Componentes React con Recharts para visualizaciones
   - Hook useMetrics para gestión de estado y datos
   - Integración con la API mediante fetch

## Métricas Implementadas

### Métricas de Tiempo

- **Tiempo Promedio de Respuesta**

  - Cálculo: `(primera_respuesta - creación)`
  - Unidad: Minutos
  - Endpoint: `GET /api/v1/metrics/time`

- **Tiempo Promedio de Resolución**

  - Cálculo: `(cierre - creación)`
  - Unidad: Minutos
  - Endpoint: `GET /api/v1/metrics/time`

- **Tasa de Cumplimiento SLA**
  - Cálculo: `(tickets_dentro_sla / total_tickets) * 100`
  - Unidad: Porcentaje
  - Endpoint: `GET /api/v1/metrics/time`

### Métricas de Tickets

- **Estado de Tickets**
  - Total de tickets
  - Tickets abiertos
  - Tickets en progreso
  - Tickets cerrados
  - Endpoint: `GET /api/v1/metrics/tickets`

### Métricas por Categoría

- **Distribución por Categoría**
  - Conteo de tickets por categoría
  - Tiempo promedio de resolución por categoría
  - Tasa de cumplimiento SLA por categoría
  - Endpoint: `GET /api/v1/metrics/categories`

## API Endpoints

### GET /api/v1/metrics/time

```typescript
// Request
interface TimeMetricsRequest {
  startDate?: string;
  endDate?: string;
  technician_id?: string;
  atm_id?: string;
}

// Response
interface TimeMetricsResponse {
  averageResponseTime: number;
  averageResolutionTime: number;
  slaComplianceRate: number;
}
```

### GET /api/v1/metrics/tickets

```typescript
// Request
interface TicketMetricsRequest {
  startDate?: string;
  endDate?: string;
  category?: string;
  priority?: TicketPriority;
}

// Response
interface TicketMetricsResponse {
  total: number;
  openTickets: number;
  closedTickets: number;
  inProgressTickets: number;
}
```

### GET /api/v1/metrics/historical

```typescript
// Request
interface HistoricalMetricsRequest {
  days: number;
  timeUnit: "day" | "week" | "month" | "year";
}

// Response
interface HistoricalDataPoint {
  date: string;
  metrics: {
    timeMetrics: TimeMetricsResponse;
    ticketMetrics: TicketMetricsResponse;
  };
}
```

## Componentes Frontend

### MetricsDisplay

Principal componente de visualización que muestra:

- Métricas de tiempo en tarjetas
- Estado actual de tickets
- Gráfico histórico de tendencias

### Hook: useMetrics

Hook personalizado que maneja:

- Fetching de datos
- Estado de carga
- Manejo de errores
- Caché de datos
- Revalidación automática

## Guía de Uso

1. **Visualización de Métricas**

   - Las métricas se muestran en tiempo real
   - Los datos se actualizan automáticamente cada 5 minutos
   - Se puede forzar una actualización manual

2. **Filtrado de Datos**

   - Use los selectores de período para cambiar el rango de fechas
   - Filtre por categoría, técnico o ATM según necesite
   - Los gráficos se actualizan automáticamente al aplicar filtros

3. **Interpretación**
   - Verde: Dentro de SLA
   - Amarillo: Cerca del límite de SLA
   - Rojo: Fuera de SLA
   - Líneas punteadas en gráficos: Objetivos/metas

## Próximas Mejoras

1. **Fase 2: Gráficos Avanzados**

   - Implementar más tipos de visualizaciones
   - Añadir comparativas entre períodos
   - Mejorar la interactividad de los gráficos

2. **Fase 3: Filtros Avanzados**

   - Añadir más opciones de filtrado
   - Implementar guardado de preferencias
   - Mejorar la UX de los filtros

3. **Optimizaciones**
   - Implementar caché en el backend
   - Mejorar el rendimiento de las consultas
   - Añadir más índices según sea necesario
