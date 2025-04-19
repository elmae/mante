# Project Context

## Dependencies Guidelines

- Only use supported and maintained dependencies
- Avoid deprecated packages
- Use the latest stable versions of packages
- Verify compatibility with Node.js LTS versions
- Remove packages with known memory leaks or security issues
- Keep dependencies to a minimum to reduce the attack surface

## Current Architecture

La arquitectura del backend ha sido estandarizada completamente en NestJS:

- **Decisión Técnica Crítica**: Se ha establecido NestJS como el único framework backend permitido
  - Prohibición explícita del uso de Express puro
  - Refactorización exitosa del módulo de ATMs a NestJS completada
  - Refactorización exitosa del módulo de Notificaciones a NestJS completada
    - Implementación de servicios, controladores y DTOs
    - Integración con TypeORM y otros módulos del sistema
  - Todos los nuevos desarrollos deben usar NestJS

### Principios Arquitectónicos NestJS

- Uso de TypeORM para operaciones de base de datos
- Autenticación basada en JWT con @nestjs/passport
- Control de acceso basado en roles (RBAC) mediante Guards
- Documentación automática con Swagger/OpenAPI
- Validación de DTOs con class-validator
- Tipado estricto con TypeScript
- Inyección de dependencias para mejor testabilidad
- Interceptors para manejo transversal de respuestas

## Coding Standards

- Follow NestJS best practices
- Use decorators for metadata
- Implement proper dependency injection
- Maintain separation of concerns
- Use proper error handling
- Document all public APIs
