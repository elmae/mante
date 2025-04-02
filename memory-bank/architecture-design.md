# Diseño de Arquitectura - Sistema CMMS

## Diagrama de Componentes

```mermaid
graph TB
    subgraph "Frontend Layer"
        WUI["Web UI\n(Next.js)"]
        MUI["Mobile UI\n(React Native)"]
    end

    subgraph "API Gateway Layer"
        AG["API Gateway\n(Express.js)"]
        Auth["Auth Service\n(JWT)"]
    end

    subgraph "Service Layer"
        US["User Service"]
        TS["Ticket Service"]
        AS["ATM Service"]
        MS["Maintenance Service"]
        NS["Notification Service"]
        SS["SLA Service"]
        FS["File Service"]
    end

    subgraph "Data Layer"
        PG["PostgreSQL"]
        RD["Redis Cache"]
        MIO["MinIO Storage"]
        subgraph "Cache"
            RC["Redis Cache"]
            RQ["Redis Queue"]
        end
    end

    WUI --> AG
    MUI --> AG
    AG --> Auth

    AG --> US
    AG --> TS
    AG --> AS
    AG --> MS
    AG --> NS
    AG --> SS
    AG --> FS

    US --> PG
    TS --> PG
    AS --> PG
    MS --> PG
    SS --> PG

    US --> RC
    TS --> RC
    AS --> RC

    NS --> RQ

    FS --> MIO
```

## Diagrama de Flujo de Datos - Gestión de Tickets

```mermaid
sequenceDiagram
    participant C as Cliente/Técnico
    participant AG as API Gateway
    participant Auth as Auth Service
    participant TS as Ticket Service
    participant NS as Notification Service
    participant DB as PostgreSQL
    participant Cache as Redis Cache

    C->>AG: Crear Ticket
    AG->>Auth: Validar Token
    Auth-->>AG: Token Válido
    AG->>TS: Procesar Ticket
    TS->>DB: Guardar Ticket
    TS->>Cache: Actualizar Cache
    TS->>NS: Notificar Creación
    NS-->>C: Enviar Notificación
    TS-->>AG: Ticket Creado
    AG-->>C: Respuesta Éxito
```

## Arquitectura Hexagonal del Backend

```mermaid
graph TB
    subgraph "Puertos Primarios (API)"
        REST["REST API"]
        WS["WebSocket API"]
    end

    subgraph "Capa de Aplicación"
        UC["Casos de Uso"]
        SVC["Servicios"]
    end

    subgraph "Dominio"
        ENT["Entidades"]
        RP["Repositorios\nInterface"]
    end

    subgraph "Puertos Secundarios"
        DB["Base de Datos"]
        CACHE["Cache"]
        STORAGE["Almacenamiento"]
        QUEUE["Cola de Mensajes"]
    end

    REST --> UC
    WS --> UC
    UC --> SVC
    SVC --> ENT
    SVC --> RP
    RP --> DB
    RP --> CACHE
    RP --> STORAGE
    SVC --> QUEUE
```

## Patrón de Integración - Sincronización Offline

```mermaid
sequenceDiagram
    participant MA as Mobile App
    participant AG as API Gateway
    participant SS as Sync Service
    participant DB as Database

    MA->>MA: Trabajo Offline
    MA->>MA: Almacenar Cambios Localmente
    MA->>AG: Conexión Restaurada
    AG->>SS: Sincronizar Cambios
    SS->>DB: Validar Cambios
    DB-->>SS: Confirmar Estado
    SS->>MA: Actualizar Estado Local
    SS->>MA: Resolver Conflictos
```

## Arquitectura de Microservicios

### User Service

- Gestión de usuarios y roles
- Autenticación y autorización
- Perfiles y preferencias

### Ticket Service

- Creación y gestión de tickets
- Asignación y seguimiento
- Historial y estados

### ATM Service

- Registro y gestión de ATMs
- Ubicación y estado
- Especificaciones técnicas

### Maintenance Service

- Registros de mantenimiento
- Programación de mantenimiento
- Historial de servicios

### Notification Service

- Notificaciones por email
- Notificaciones push
- Alertas del sistema

### SLA Service

- Configuración de SLAs
- Monitoreo de cumplimiento
- Reportes de nivel de servicio

### File Service

- Gestión de archivos
- Almacenamiento en MinIO
- Procesamiento de imágenes

## Consideraciones Técnicas

### Seguridad

- JWT para autenticación
- HTTPS para todas las comunicaciones
- Validación de entrada en todos los endpoints
- Sanitización de datos
- Rate limiting
- CORS configurado adecuadamente

### Escalabilidad

- Servicios stateless
- Cache distribuido con Redis
- Balanceo de carga
- Replicación de base de datos
- Arquitectura basada en eventos

### Disponibilidad

- Healthchecks en todos los servicios
- Circuit breakers
- Fallback strategies
- Monitoreo continuo
- Logs centralizados

### Performance

- Optimización de queries
- Índices en base de datos
- Caché en múltiples niveles
- Compresión de respuestas
- Lazy loading
- Paginación

### Mantenibilidad

- Código modular
- Pruebas automatizadas
- Documentación actualizada
- Versionado de APIs
- Logs estructurados

## Estrategia de Despliegue

```mermaid
graph TB
    subgraph "CI/CD Pipeline"
        CI["Continuous Integration"]
        TEST["Testing"]
        BUILD["Build"]
        DEPLOY["Deployment"]
    end

    subgraph "Environments"
        DEV["Development"]
        STAGE["Staging"]
        PROD["Production"]
    end

    CI --> TEST
    TEST --> BUILD
    BUILD --> DEPLOY
    DEPLOY --> DEV
    DEV --> STAGE
    STAGE --> PROD
```
