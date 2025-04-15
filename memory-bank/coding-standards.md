# Estándares de Código

## Métricas y Visualización de Datos

### Nomenclatura de Métricas

- Usar nombres descriptivos y consistentes:

  ```typescript
  // ✅ Bueno
  const averageResponseTime = calculateAverageResponseTime(tickets);
  const slaComplianceRate = calculateSLACompliance(tickets);

  // ❌ Malo
  const avgResp = getAvg(tickets);
  const sla = getSLA(tickets);
  ```

### Cálculos y Agregaciones

- Documentar fórmulas complejas:
  ```typescript
  /**
   * Calcula la tasa de cumplimiento de SLA
   * @formula (tickets_dentro_sla / total_tickets) * 100
   * @param tickets - Array de tickets a analizar
   * @returns Porcentaje de cumplimiento (0-100)
   */
  const calculateSLACompliance = (tickets: Ticket[]): number => {
    // implementación
  };
  ```

### Manejo de Datos

- Validar y sanitizar inputs:

  ```typescript
  // ✅ Bueno
  const validateDateRange = (startDate: Date, endDate: Date): boolean => {
    return startDate < endDate && isWithinLastYear(startDate);
  };

  // ❌ Malo
  const processDateRange = (start: any, end: any) => {
    // procesar sin validar
  };
  ```

### Tests de Métricas

- Incluir casos borde y valores extremos:
  ```typescript
  describe("calculateAverageResponseTime", () => {
    it("handles empty ticket list", () => {});
    it("handles single ticket", () => {});
    it("handles tickets with missing dates", () => {});
    it("handles date ranges crossing midnight", () => {});
  });
  ```

### Componentes de Gráficos

- Separar datos de presentación:

  ```typescript
  // ✅ Bueno
  const MetricChart: React.FC<{
    data: MetricData[];
    config: ChartConfig;
  }> = ({ data, config }) => {
    // renderizar gráfico
  };

  // ❌ Malo
  const MetricChart = () => {
    const data = fetchDataInternally();
    // renderizar gráfico
  };
  ```

### Tipos y Interfaces

- Definir tipos específicos para métricas:

  ```typescript
  interface TimeMetrics {
    averageResponseTime: number;
    averageResolutionTime: number;
    slaComplianceRate: number;
  }

  type MetricValue = number | null;
  type MetricPeriod = "day" | "week" | "month" | "year";
  ```

### Manejo de Estados

- Estados claros y predecibles:

  ```typescript
  // ✅ Bueno
  interface MetricsState {
    data: MetricData | null;
    loading: boolean;
    error: Error | null;
    lastUpdated: Date | null;
  }

  // ❌ Malo
  interface MetricsState {
    status: "loading" | "error" | "success" | any;
    info: any;
  }
  ```

### Formateo de Datos

- Funciones de formato consistentes:
  ```typescript
  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
  };
  ```

### Optimización

- Memoización de cálculos costosos:
  ```typescript
  const MemoizedMetricChart = React.memo(MetricChart, (prev, next) => {
    return isEqual(prev.data, next.data) && isEqual(prev.config, next.config);
  });
  ```

### Documentación

- JSDoc para funciones de métricas:
  ```typescript
  /**
   * Calcula métricas de tiempo para un conjunto de tickets
   * @param tickets - Array de tickets a analizar
   * @param options - Opciones de cálculo (ej: ignorar días no laborables)
   * @returns TimeMetrics con promedios calculados
   * @throws {ValidationError} Si los tickets no son válidos
   */
  function calculateTimeMetrics(
    tickets: Ticket[],
    options?: CalculationOptions
  ): TimeMetrics {
    // implementación
  }
  ```

### Control de Errores

- Manejo específico de errores de métricas:
  ```typescript
  class MetricCalculationError extends Error {
    constructor(message: string, public readonly metricType: string) {
      super(`Error calculando métrica ${metricType}: ${message}`);
    }
  }
  ```

### Validación de Props

- Props required vs optional:
  ```typescript
  interface MetricDisplayProps {
    // Props requeridos
    data: MetricData;
    timeRange: DateRange;

    // Props opcionales
    onRefresh?: () => void;
    formatter?: (value: number) => string;
    className?: string;
  }
  ```
