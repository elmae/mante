# Tech Context

## Configuraciones Actualizadas (Autenticación)

### JWT Config

```typescript
{
  secret: process.env.JWT_SECRET,
  expiresIn: '1h',  // Access token
  refreshExpiresIn: '7d' // Refresh token
}
```

### Redis Config

```typescript
{
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  tokenBlacklistTTL: '7d' // Igual a refresh token expiration
}
```

## Dependencias y Servicios

### Principales Dependencias

- **jsonwebtoken**: 9.0.2
- **redis**: 4.6.13
- **express-jwt**: 8.4.1

### Servicios Clave

1. **JwtService**: Manejo completo de tokens JWT
2. **RedisService**: Conexión y operaciones con Redis
3. **AuthMiddleware**: Protección de rutas y permisos

## Manejo de Autenticación y Autorización

### Flujo de Autenticación

1. Login → Genera access + refresh tokens
2. Access token → Authorization header (Bearer)
3. Refresh token → Cookie HttpOnly
4. Token inválido → 401 Unauthorized

### Jerarquía de Autorización

1. Autenticación (token válido)
2. Roles (admin, user, etc.)
3. Permisos específicos (create, read, update, delete)

## Configuración de Seguridad

- HttpOnly cookies para refresh tokens
- CORS restringido a dominios autorizados
- Headers de seguridad (CSP, HSTS)
