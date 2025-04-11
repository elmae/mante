# System Patterns

## Patrón de Manejo de Tokens

- **Implementación**: JWT con firma HMAC-SHA256
- **Flujo**:

  1. Login genera access token (1h) y refresh token (7d)
  2. Access token usado para autenticar requests
  3. Refresh token usado para obtener nuevo access token
  4. Logout invalida tokens en Redis

- **Seguridad**:
  - Tokens almacenados en HttpOnly cookies
  - Blacklist de tokens inválidos en Redis
  - Verificación de firma y expiración

## Integración con Redis

- **Propósito**: Cache y manejo de estado de autenticación
- **Implementación**:

  - Almacenamiento de tokens invalidados (logout)
  - TTL automático igual a expiración del token
  - Reconexión automática en fallos

- **Estructura de claves**:
  - `token_blacklist:<jti>` para tokens invalidados
  - TTL igual a tiempo restante del token

## Manejo de Rutas Protegidas

- **Middleware**: Autenticación en capa de rutas
- **Jerarquía**:

  1. Verificación de token válido
  2. Validación de usuario activo
  3. Comprobación de roles
  4. Verificación de permisos específicos

- **Patrones**:
  - `authenticate`: Verifica token válido
  - `hasRole`: Valida rol requerido
  - `hasPermission`: Verifica permisos específicos
