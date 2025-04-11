# System Patterns

## Arquitectura

### Patrón de Capas

- Presentación (Frontend)
- Lógica de Negocio (Backend Services)
- Acceso a Datos (Repositories)
- Infraestructura (Database)

### Clean Architecture

- Entities: Modelos de dominio
- Use Cases: Servicios de aplicación
- Interfaces: Puertos y adaptadores
- Frameworks: Express, TypeORM, React

## Patrones de Diseño

### Frontend

1. Custom Hooks

- useTicket: Gestión de estado de tickets
- useComments: Gestión de comentarios
- useUser: Información del usuario actual
- useDashboard: Métricas y análisis

2. Component Patterns

- Container/Presentational
- Higher-Order Components
- Render Props
- Compound Components

3. Estado y Eventos

- Custom Hooks para estado local
- Context para estado global
- Event Handlers consistentes
- Patrón de Observador para actualizaciones

### Backend

1. Repository Pattern

- Abstracción de acceso a datos
- Interfaces genéricas
- Implementaciones específicas
- Unit of Work

2. Service Layer

- Lógica de negocio encapsulada
- Validación de datos
- Manejo de transacciones
- Eventos del dominio

3. Controller Pattern

- Manejo de requests HTTP
- Validación de inputs
- Transformación de datos
- Manejo de respuestas

### Sistema de Comentarios

1. Arquitectura

- Entidad Comment independiente
- Relación Many-to-One con Ticket
- Relación Many-to-One con User
- Validación en múltiples capas

2. Patrones Frontend

- Hook useComments para gestión de estado
- Componente Comments para UI
- Patrón de composición para integración
- Manejo de errores consistente

3. Patrones Backend

- Repository para acceso a datos
- Service para lógica de negocio
- Controller para endpoints API
- DTOs para validación

## Principios SOLID

1. Single Responsibility

- Cada clase tiene una única responsabilidad
- Servicios especializados
- Componentes cohesivos

2. Open/Closed

- Extensión mediante interfaces
- Plugins y middleware
- Configuración flexible

3. Liskov Substitution

- Interfaces consistentes
- Herencia apropiada
- Contratos claros

4. Interface Segregation

- Interfaces específicas
- DTOs especializados
- Contratos minimales

5. Dependency Inversion

- Inyección de dependencias
- Inversión de control
- Abstracciones estables

## Patrones de Testing

1. Unit Testing

- Tests aislados
- Mocks y stubs
- Cobertura alta

2. Integration Testing

- APIs end-to-end
- Database interactions
- Service integration

3. E2E Testing

- User workflows
- UI interactions
- Cross-browser testing

## Patrones de Seguridad

1. Autenticación

- JWT tokens
- Session management
- Role-based access
- **Nuevo**: Token Blacklist Pattern
- **Nuevo**: Refresh Token Rotation
- **Nuevo**: Modular Auth Services

2. Autorización

- Permisos granulares
- Middleware de autorización
- Validación de roles

3. Validación

- Input sanitization
- Data validation
- Error handling

## Patrones de Autenticación (Nuevo)

1. Token Blacklist Pattern

   - Almacenamiento en Redis
   - Invalidación inmediata
   - Limpieza automática

2. Refresh Token Rotation

   - Un solo uso
   - Caducidad independiente
   - Revocación en cadena

3. Auth Service Modularization
   - Servicio JWT independiente
   - Servicio Auth centralizado
   - Inyección de dependencias

## Patrones de Datos

1. Relaciones

- One-to-Many
- Many-to-One
- Many-to-Many

2. Migraciones

- Versionado de esquema
- Rollback support
- Seed data

3. Queries

- Eager loading
- Lazy loading
- Query optimization
