# Active Context

## Enfoque Actual

### Fase 2: Desarrollo del Backend y Base de Datos (En Progreso)

#### Completado:

- Estructura base del proyecto backend establecida
- Configuración de TypeScript y dependencias
- Sistema de logging implementado
- Manejo de errores configurado
- Estructura de rutas definida
- Entidades de base de datos implementadas
- Configuración de base de datos
- Migración inicial implementada
- Datos base inicializados (roles, permisos, admin)

#### En Proceso:

- Implementación de servicios y controladores
- Configuración de autenticación JWT

## Cambios Recientes

- Implementación de migración inicial con estructura completa de la base de datos
- Inicialización de datos base del sistema (roles, permisos, usuario admin)
- Cambio de PostGIS a tipos nativos de PostgreSQL para ubicaciones
- Implementación de vistas materializadas para estadísticas

## Decisiones Activas

- Adopción de una arquitectura monorepo para mejor gestión del código
- Separación clara entre frontend y backend como aplicaciones independientes
- Organización modular de la documentación y configuración
- Implementación de estructura que facilite el testing en múltiples niveles
- Uso de tipos de datos nativos para geolocalización en primera fase

## Próximos Pasos

1. Desarrollo de Servicios:

   - Implementar servicios base siguiendo arquitectura hexagonal
   - Desarrollar controladores para cada entidad
   - Implementar sistema de autenticación JWT
   - Configurar validaciones de datos

2. Desarrollo del Frontend Web:

   - Inicializar proyecto Next.js con TypeScript
   - Configurar Tailwind CSS según ui-design.md
   - Implementar sistema de componentes base
   - Establecer estructura de routing

3. Configuración de Infraestructura:

   - Configurar MinIO para almacenamiento de archivos
   - Implementar Redis para caché y colas
   - Configurar sistema de logging y monitoreo
   - Preparar entornos de desarrollo y staging

4. Implementación de Tests:
   - Configurar Jest y herramientas de testing
   - Implementar primeras pruebas unitarias
   - Configurar pipeline de CI/CD
   - Establecer métricas de cobertura

## Consideraciones Importantes

- Seguir la arquitectura hexagonal definida
- Mantener separación clara de responsabilidades
- Implementar validaciones robustas
- Asegurar manejo correcto de errores
- Documentar APIs según estándares
- Mantener cobertura de pruebas alta
- Optimizar consultas de base de datos
- Seguir principios SOLID
