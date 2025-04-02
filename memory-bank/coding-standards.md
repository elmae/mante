# Estándares y Convenciones de Código

## Estructura de Archivos

### 1. Nombrado de Archivos

```
# Componentes React
PascalCase.tsx           // ComponentName.tsx
PascalCase.styles.ts     // ComponentName.styles.ts
PascalCase.test.tsx      // ComponentName.test.tsx
PascalCase.types.ts      // ComponentName.types.ts

# Backend
kebab-case.ts           // feature-name.ts
kebab-case.service.ts   // feature-name.service.ts
kebab-case.test.ts      // feature-name.test.ts

# Utilidades y Helpers
camelCase.util.ts       // formatDate.util.ts
camelCase.helper.ts     // stringHelper.helper.ts

# Configuración
kebab-case.config.ts    // database-config.ts
kebab-case.env.ts       // app-env.ts

# Scripts
kebab-case.script.ts    // migration-script.ts
```

### 2. Organización de Directorios

```
# Componentes
/components/feature-name/
  ├── index.ts
  ├── ComponentName.tsx
  ├── ComponentName.styles.ts
  └── __tests__/
      └── ComponentName.test.tsx

# Backend
/src/modules/feature-name/
  ├── index.ts
  ├── models/
  ├── services/
  ├── controllers/
  └── tests/
```

## Base de Datos

### 1. Nombrado de Tablas

```
# Tablas Principales
snake_case (singular)      // user, product, order

# Tablas de Relación (muchos a muchos)
snake_case (plural_plural) // users_roles, products_categories

# Tablas de Configuración o Lookup
snake_case (prefijo cfg_)  // cfg_status, cfg_permission

# Tablas de Registro o Histórico
snake_case (sufijo _log)   // user_activity_log, payment_log

# Tablas Temporales
snake_case (prefijo tmp_)  // tmp_import_data, tmp_calculation
```

### 2. Nombrado de Columnas

```
# Claves Primarias
id                        // Siempre 'id' para consistencia

# Claves Foráneas
entity_id                 // user_id, product_id

# Campos de Auditoría
created_at                // Timestamp de creación
updated_at                // Timestamp de última actualización
created_by                // ID del usuario que creó el registro
updated_by                // ID del usuario que actualizó el registro

# Campos Booleanos
is_active, has_permission // Prefijos 'is_', 'has_', 'can_'

# Enumeraciones
status, role              // Singular, valores predefinidos
```

### 3. Índices y Constraints

```
# Índices Primarios
pk_tablename              // pk_user

# Índices Foráneos
fk_tablename_reference    // fk_order_user

# Índices Únicos
ux_tablename_columns      // ux_user_email

# Índices Compuestos
ix_tablename_columns      // ix_product_name_category
```

## Convenciones de Código

### 1. TypeScript

```typescript
// Interfaces
interface IUserProps {
  id: string;
  name: string;
}

// Types
type UserRole = "admin" | "user";

// Enums
enum Status {
  Active = "active",
  Inactive = "inactive",
}

// Constants
const MAX_RETRY_ATTEMPTS = 3;
```

### 2. React

```typescript
// Componentes Funcionales
const UserProfile: React.FC<IUserProps> = ({ id, name }) => {
  return (
    <div>
      <h1>{name}</h1>
    </div>
  );
};

// Hooks Personalizados
const useUser = (id: string) => {
  // ...
};
```

### 3. Backend

```typescript
// Servicios
class UserService {
  async findById(id: string): Promise<User> {
    // ...
  }
}

// Controladores
class UserController {
  constructor(private userService: UserService) {}

  async getUser(req: Request, res: Response): Promise<void> {
    // ...
  }
}
```

## Buenas Prácticas

### 1. Importaciones

```typescript
// Externos primero
import React from "react";
import { useQuery } from "react-query";

// Internos después
import { useUser } from "@/hooks";
import { Button } from "@/components";

// Tipos y estilos al final
import { IUserProps } from "./types";
import styles from "./styles";
```

### 2. Exportaciones

```typescript
// index.ts
export { default as UserProfile } from "./UserProfile";
export * from "./types";
```

### 3. Testing

```typescript
describe("UserProfile", () => {
  beforeEach(() => {
    // Setup
  });

  it("should render user name", () => {
    // Test
  });
});
```

## Patrones de Diseño

### 1. React

- Componentes controlados vs no controlados
- Render props vs HOCs
- Custom hooks para lógica reutilizable

### 2. Backend

- Repository pattern
- Service layer pattern
- Dependency injection

## Documentación

### 1. JSDoc

```typescript
/**
 * Obtiene un usuario por ID
 * @param {string} id - ID del usuario
 * @returns {Promise<User>} Usuario encontrado
 * @throws {NotFoundError} Si el usuario no existe
 */
async function getUser(id: string): Promise<User> {
  // ...
}
```

### 2. README

- Cada directorio principal debe tener README.md
- Documentar propósito y uso
- Incluir ejemplos relevantes

## Control de Versiones

### 1. Commits

```
feat: añadir autenticación de usuario
fix: corregir validación de formulario
docs: actualizar README
style: formatear código
refactor: simplificar lógica de búsqueda
test: añadir pruebas para autenticación
chore: actualizar dependencias
```

### 2. Branches

```
main
```

## Gestión de Errores

### 1. Frontend

```typescript
try {
  await api.updateUser(user);
} catch (error) {
  errorHandler.handle(error);
}
```

### 2. Backend

```typescript
class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
```

## Seguridad

### 1. Validaciones

```typescript
// Frontend
const schema = yup.object().shape({
  email: yup.string().email().required(),
});

// Backend
class UserDTO {
  @IsEmail()
  email: string;
}
```

### 2. Sanitización

```typescript
// Sanitizar inputs
const sanitizedInput = xss(userInput);

// Validar tipos
const isValidId = mongoose.Types.ObjectId.isValid(id);
```

## Performance

### 1. Frontend

- Lazy loading de componentes
- Memoización de cálculos costosos
- Optimización de imágenes

### 2. Backend

- Caché de consultas frecuentes
- Índices en base de datos
- Rate limiting

## Mantenimiento

### 1. Dependencias

- Actualizar regularmente
- Auditar seguridad
- Documentar breaking changes

### 2. Monitoreo

- Logging estructurado
- Métricas de rendimiento
- Trazabilidad de errores
