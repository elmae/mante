# Plan de Acción Detallado: Implementación del Sistema de Métricas

Este plan aborda la implementación completa del sistema de métricas, dividido en fases, con objetivos claros, tareas técnicas específicas, estimaciones de tiempo y prioridades.

---

## Fase 1: Implementación de Métricas Básicas Reales (Estimación: 2 semanas)

- **Objetivo Principal:** Reemplazar los datos de métricas existentes (posiblemente mock o básicos) con cálculos reales derivados de los datos del backend y actualizar los componentes del frontend para reflejar esta información real.
- **Prioridad:** Alta

- **Tareas Técnicas:**
  - **Backend:**
    - **(Análisis)** Definir la estrategia de cálculo y almacenamiento: Determinar si las métricas se calcularán bajo demanda o se pre-calcularán y almacenarán (ej. en una nueva tabla o usando Redis).
    - **(Implementación)** Desarrollar la lógica en el `TicketService` o crear un nuevo `MetricsService` para calcular métricas clave:
      - Tiempo promedio de primera respuesta.
      - Tiempo promedio de resolución de tickets.
      - Tasa de cumplimiento de SLA (comparando tiempo de resolución real vs. SLA aplicable al ticket).
    - **(API)** Crear o actualizar endpoints en `DashboardController` (para métricas generales) y/o un nuevo `MetricsController` (para métricas más específicas) para exponer los datos calculados. Asegurar que los DTOs de respuesta estén bien definidos.
  - **Frontend:**
    - **(Integración)** Actualizar el hook `useTicketMetrics` para consumir los nuevos endpoints del backend que devuelven datos reales.
    - **(UI)** Modificar los componentes existentes (`TicketMetrics`, `DashboardMetrics`) para mostrar correctamente las métricas reales recibidas del backend.
    - **(Tipado)** Asegurar la coherencia de tipos entre los datos recibidos del backend y cómo se utilizan en el frontend (TypeScript).

---

## Fase 2: Gráficos Avanzados e Históricos (Estimación: 3 semanas)

- **Objetivo Principal:** Mejorar la visualización de datos introduciendo gráficos más avanzados y permitir a los usuarios explorar tendencias históricas.
- **Prioridad:** Media

- **Tareas Técnicas:**
  - **(Investigación y Selección)** Evaluar la librería de gráficos actual frente a las necesidades de visualizaciones avanzadas (tendencias, comparaciones, distribuciones) y rendimiento. Si es necesario, seleccionar e integrar una nueva librería (ej. Recharts, Nivo, Chart.js).
  - **Backend:**
    - **(API)** Diseñar e implementar nuevos endpoints para servir datos de métricas agregados por periodos de tiempo (diario, semanal, mensual, anual).
    - **(Base de Datos)** Optimizar o crear consultas SQL (o TypeORM QueryBuilder) eficientes para agregar datos históricos. Considerar la creación de índices para mejorar el rendimiento.
    - **(Definición)** Identificar y definir las métricas históricas clave a exponer (ej. evolución del tiempo de respuesta, volumen de tickets cerrados por mes, tendencia de cumplimiento de SLA).
  - **Frontend:**
    - **(UI/Gráficos)** Implementar nuevos componentes de gráficos o refactorizar los existentes utilizando la librería seleccionada para visualizar datos históricos y tendencias.
    - **(Integración)** Conectar estos nuevos componentes a los endpoints de datos históricos del backend.
    - **(UI/Controles)** Añadir controles de interfaz de usuario (ej. selectores de rango de fechas, botones de periodo) para permitir a los usuarios explorar los datos históricos.

---

## Fase 3: Filtros y Personalización (Estimación: 2 semanas)

- **Objetivo Principal:** Otorgar a los usuarios mayor control sobre los datos de métricas mediante filtros avanzados y opciones básicas de personalización.
- **Prioridad:** Media-Baja

- **Tareas Técnicas:**
  - **Backend:**
    - **(API)** Extender los endpoints de métricas existentes y nuevos para aceptar parámetros de filtrado adicionales (ej. filtrar por técnico asignado, por cliente, por tipo/modelo de ATM, por categoría de ticket, rangos de fecha específicos).
    - **(Base de Datos)** Refinar las consultas de base de datos para incorporar estos filtros de manera eficiente, asegurando que los índices adecuados estén en lugar.
  - **Frontend:**
    - **(UI/Controles)** Implementar componentes de interfaz de usuario interactivos para que los usuarios seleccionen los filtros deseados (ej. dropdowns multi-selección, campos de autocompletar para técnicos/clientes, selectores de rango de fechas avanzados).
    - **(Estado/Lógica)** Actualizar el hook `useTicketMetrics` (o crear uno nuevo si la complejidad aumenta) para gestionar el estado de los filtros seleccionados y pasarlos correctamente en las llamadas a la API.
    - **(UI/Actualización)** Asegurar que los gráficos y visualizaciones se actualicen dinámicamente cuando se aplican los filtros.
  - **(Opcional - Personalización Básica):**
    - **(Backend)** Considerar añadir campos en el modelo `User` o una nueva entidad `UserSettings` para guardar preferencias de filtros o vistas.
    - **(Frontend)** Implementar la lógica para guardar y cargar estas preferencias.

---

## Fase 4: Documentación (Continua, con hito final ~0.5 semanas)

- **Objetivo Principal:** Asegurar que toda la nueva funcionalidad de métricas esté completamente documentada en el `memory-bank` para facilitar el mantenimiento, la incorporación de nuevos miembros al equipo y el desarrollo futuro.
- **Prioridad:** Alta

- **Tareas Técnicas:**
  - **(Creación/Actualización)** Crear un nuevo archivo `memory-bank/metrics-system.md` (o similar) que detalle:
    - La arquitectura específica del sistema de métricas.
    - Definición precisa de cada métrica implementada y cómo se calcula.
    - Descripción de los endpoints de la API de métricas (parámetros, respuestas).
    - Descripción de los componentes clave del frontend (`useTicketMetrics`, componentes de gráficos, etc.).
    - Guías básicas de uso para los usuarios finales sobre cómo interpretar y utilizar las métricas y filtros.
  - **(Actualización `memory-bank`)** Actualizar los siguientes archivos existentes:
    - `systemPatterns.md`: Añadir patrones específicos utilizados en el sistema de métricas.
    - `techContext.md`: Incluir la librería de gráficos seleccionada (si se cambió/añadió).
    - `activeContext.md`: Reflejar el estado actual y las decisiones tomadas respecto a las métricas.
    - `progress.md`: Actualizar el estado de las funcionalidades de métricas.
    - `coding-standards.md`: Añadir estándares específicos para el desarrollo relacionado con métricas.

---

## Diagrama de Flujo de Datos de Métricas (Conceptual)

```mermaid
graph LR
    A[Eventos Ticket (Creación, Cierre, etc.)] --> B(Backend: Servicio de Métricas);
    C[Base de Datos (Tickets, SLAs)] --> B;
    B --> D{Cálculo/Agregación Métricas};
    D --> E[Endpoints API Métricas (/metrics, /dashboard)];
    F[Frontend: Hooks (useTicketMetrics)] --> E;
    F --> G[Frontend: Componentes (Gráficos, Tablas)];
    H[Librería Gráficos (ej. Recharts)] --> G;
    I[Usuario Final] --> G;
```

---
