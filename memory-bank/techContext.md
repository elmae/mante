# Contexto Técnico del Sistema

## Stack de Tecnologías

### Frontend

- **Framework**: Next.js 14
- **Lenguaje**: TypeScript 5.3
- **UI/UX**:
  - TailwindCSS para estilos
  - Recharts para visualizaciones de datos
  - React Server Components
  - React Query para manejo de estado

### Backend

- **Framework**: Express.js
- **ORM**: TypeORM
- **Base de Datos**: PostgreSQL
- **Cache**: Redis (planificado)

### Testing

- **Frontend**:
  - Jest + React Testing Library (configurado para Next.js 14)
  - Cypress para E2E
  - MSW para mocking de API
  - Testing Library User Events
  - TextEncoder/TextDecoder añadidos para pruebas
- **Backend**:
  - Jest para pruebas unitarias
  - Supertest para pruebas de integración
  - Supertest para pruebas de integración

## Herramientas de Desarrollo

### IDE y Extensiones

- **VSCode** como IDE principal
- Extensiones recomendadas:
  - ESLint
  - Prettier
  - TypeScript Extension Pack
  - Jest Runner
  - Tailwind CSS IntelliSense

### Linting y Formateo

- ESLint con configuración personalizada
- Prettier para formateo consistente
- Husky para pre-commit hooks

## Decisiones Técnicas

### Visualización de Datos

- **Recharts seleccionado por**:
  - Integración nativa con React
  - Soporte completo de TypeScript
  - Componentes responsivos
  - Alto rendimiento con grandes conjuntos de datos
  - Personalización extensa
  - Documentación completa y comunidad activa

### Arquitectura de Métricas

- Cálculos en tiempo real vs pre-calculados
- Uso de TypeORM QueryBuilder para consultas complejas
- Implementación de caché en capas

### Testing Strategy

- TDD para nuevas características
- Coverage mínimo: 80%
- Snapshots para componentes visuales
- Mocking de servicios externos
- Problemas resueltos:
  - Tests de MetricsDisplay corregidos: eliminados tests innecesarios de categorías y ajustados tests de gráficos
  - Tests de useMetrics actualizados para manejar correctamente los estados y formato de fechas
  - Directiva "use client" agregada donde es necesario para componentes que usan hooks de cliente
  - Configuración de ESLint optimizada para evitar conflictos con Next.js

## Estándares de Desarrollo

### Convenciones de Código

- Nombres descriptivos para métricas
- Documentación inline para cálculos complejos
- Tests específicos para cada tipo de métrica
- Validación de tipos estricta

### Patrones de Diseño

- Custom hooks para lógica reutilizable
- Componentes presentacionales puros
- Servicios para lógica de negocio
- DTOs para transferencia de datos

### Control de Calidad

- CI/CD con GitHub Actions
- Revisión de código obligatoria
- Tests automatizados en cada PR
- Análisis de rendimiento

## Optimizaciones

### Frontend

- Server-side rendering donde sea posible
- Lazy loading de componentes pesados
- Memoización de cálculos costosos
- Caché de consultas con React Query

### Backend

- Índices optimizados para consultas frecuentes
- Paginación para conjuntos grandes de datos
- Rate limiting para endpoints críticos
- Compresión de respuestas

## Monitoreo y Logging

- Winston para logging estructurado
- Métricas de rendimiento en tiempo real
- Alertas automáticas para errores críticos
- Dashboard de monitoreo operacional
