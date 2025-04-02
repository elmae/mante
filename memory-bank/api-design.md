# Diseño de APIs - Sistema CMMS

## Convenciones de API REST

### Formato de Respuesta Base

```typescript
{
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

### Códigos HTTP

- 200: OK - Petición exitosa
- 201: Created - Recurso creado
- 400: Bad Request - Error en la petición
- 401: Unauthorized - No autenticado
- 403: Forbidden - No autorizado
- 404: Not Found - Recurso no encontrado
- 500: Internal Server Error - Error del servidor

## APIs por Servicio

### Auth Service

#### POST /api/v1/auth/login

Login de usuario

```typescript
// Request
{
  email: string;
  password: string;
}

// Response
{
  success: true,
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      role: string;
      firstName: string;
      lastName: string;
    }
  }
}
```

#### POST /api/v1/auth/refresh

Renovar token JWT

```typescript
// Request
{
  refreshToken: string;
}

// Response
{
  success: true,
  data: {
    token: string;
  }
}
```

### User Service

#### GET /api/v1/users

Listar usuarios con paginación

```typescript
// Query params
{
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

// Response
{
  success: true,
  data: {
    users: Array<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isActive: boolean;
    }>
  },
  meta: {
    page: number;
    limit: number;
    total: number;
  }
}
```

#### POST /api/v1/users

Crear usuario

```typescript
// Request
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

// Response
{
  success: true,
  data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }
}
```

### ATM Service

#### GET /api/v1/atms

Listar ATMs con paginación y filtros

```typescript
// Query params
{
  page?: number;
  limit?: number;
  clientId?: string;
  zoneId?: string;
  search?: string;
  status?: string;
}

// Response
{
  success: true,
  data: {
    atms: Array<{
      id: string;
      serialNumber: string;
      model: string;
      brand: string;
      location: {
        lat: number;
        lng: number;
      };
      address: string;
      client: {
        id: string;
        name: string;
      };
      zone: {
        id: string;
        name: string;
      };
      isActive: boolean;
    }>
  },
  meta: {
    page: number;
    limit: number;
    total: number;
  }
}
```

#### POST /api/v1/atms

Registrar nuevo ATM

```typescript
// Request
{
  serialNumber: string;
  model: string;
  brand: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  clientId: string;
  zoneId: string;
  technicalSpecs: {
    [key: string]: any;
  };
}

// Response
{
  success: true,
  data: {
    id: string;
    serialNumber: string;
    // ... resto de datos del ATM
  }
}
```

### Ticket Service

#### GET /api/v1/tickets

Listar tickets con paginación y filtros

```typescript
// Query params
{
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  type?: string;
  atmId?: string;
  assignedTo?: string;
  fromDate?: string;
  toDate?: string;
}

// Response
{
  success: true,
  data: {
    tickets: Array<{
      id: string;
      title: string;
      description: string;
      status: string;
      priority: string;
      type: string;
      atm: {
        id: string;
        serialNumber: string;
      };
      assignedTo: {
        id: string;
        firstName: string;
        lastName: string;
      };
      createdAt: string;
      dueDate: string;
    }>
  },
  meta: {
    page: number;
    limit: number;
    total: number;
  }
}
```

#### POST /api/v1/tickets

Crear nuevo ticket

```typescript
// Request
{
  atmId: string;
  type: string;
  priority: string;
  title: string;
  description: string;
  assignedTo?: string;
  dueDate?: string;
}

// Response
{
  success: true,
  data: {
    id: string;
    // ... resto de datos del ticket
  }
}
```

### Maintenance Service

#### GET /api/v1/maintenance-records

Listar registros de mantenimiento

```typescript
// Query params
{
  page?: number;
  limit?: number;
  ticketId?: string;
  atmId?: string;
  technicianId?: string;
  type?: string;
  fromDate?: string;
  toDate?: string;
}

// Response
{
  success: true,
  data: {
    records: Array<{
      id: string;
      ticket: {
        id: string;
        title: string;
      };
      atm: {
        id: string;
        serialNumber: string;
      };
      technician: {
        id: string;
        firstName: string;
        lastName: string;
      };
      type: string;
      diagnosis: string;
      workPerformed: string;
      partsUsed: Array<{
        name: string;
        quantity: number;
      }>;
      startTime: string;
      endTime: string;
    }>
  },
  meta: {
    page: number;
    limit: number;
    total: number;
  }
}
```

#### POST /api/v1/maintenance-records

Registrar mantenimiento

```typescript
// Request
{
  ticketId: string;
  atmId: string;
  type: string;
  diagnosis: string;
  workPerformed: string;
  partsUsed: Array<{
    name: string;
    quantity: number;
  }>;
  startTime: string;
  endTime: string;
}

// Response
{
  success: true,
  data: {
    id: string;
    // ... resto de datos del registro
  }
}
```

### SLA Service

#### GET /api/v1/sla-configs

Obtener configuraciones de SLA

```typescript
// Query params
{
  zoneId?: string;
  clientId?: string;
  type?: string;
}

// Response
{
  success: true,
  data: {
    configs: Array<{
      id: string;
      zone: {
        id: string;
        name: string;
      };
      client?: {
        id: string;
        name: string;
      };
      maintenanceType: string;
      responseTime: string;
      resolutionTime: string;
    }>
  }
}
```

#### POST /api/v1/sla-configs

Crear configuración de SLA

```typescript
// Request
{
  zoneId: string;
  clientId?: string;
  maintenanceType: string;
  responseTime: string;
  resolutionTime: string;
}

// Response
{
  success: true,
  data: {
    id: string;
    // ... resto de datos de la configuración
  }
}
```

### File Service

#### POST /api/v1/files/upload

Subir archivo

```typescript
// Request (multipart/form-data)
{
  file: File;
  ticketId: string;
}

// Response
{
  success: true,
  data: {
    id: string;
    fileName: string;
    mimeType: string;
    size: number;
    url: string;
  }
}
```

#### GET /api/v1/files/{fileId}

Obtener archivo

```typescript
// Response: Binary file stream
```

## WebSocket Events

### Notificaciones en Tiempo Real

#### ticket.created

```typescript
{
  type: "ticket.created";
  data: {
    ticketId: string;
    title: string;
    priority: string;
    assignedTo: string;
  }
}
```

#### ticket.updated

```typescript
{
  type: 'ticket.updated';
  data: {
    ticketId: string;
    changes: {
      [key: string]: any;
    }
  }
}
```

#### maintenance.completed

```typescript
{
  type: "maintenance.completed";
  data: {
    ticketId: string;
    atmId: string;
    technicianId: string;
  }
}
```

## Consideraciones de Seguridad

1. Autenticación

   - Todas las rutas excepto /auth/login requieren JWT
   - Token refresh automático
   - Invalidación de tokens

2. Autorización

   - Validación de roles para cada endpoint
   - Scopes específicos por operación
   - Validación de propiedad de recursos

3. Validación

   - Validación de schema para todas las entradas
   - Sanitización de datos
   - Validación de tipos
   - Límites de tamaño para archivos

4. Rate Limiting

   - Por IP
   - Por usuario
   - Por endpoint

5. CORS
   - Orígenes permitidos configurables
   - Métodos permitidos
   - Headers permitidos
