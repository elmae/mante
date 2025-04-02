# Project Brief - Masterplan: Sistema CMMS para Empresa de Servicios de ATMs - Versión 2

## 1. Resumen Ejecutivo

Este documento describe el plan maestro actualizado para el desarrollo de un Sistema de Gestión de Mantenimiento Computarizado (CMMS) para una empresa que proporciona servicios de mantenimiento a cajeros automáticos (ATMs) en Centroamérica, específicamente en República Dominicana. El sistema permitirá gestionar el mantenimiento preventivo y correctivo de aproximadamente 500 ATMs, optimizar los tiempos de respuesta y proporcionar métricas clave para la toma de decisiones empresariales. Esta versión del masterplan refina el modelo de gestión de técnicos, integrándolos dentro del módulo de usuarios con un rol específico.

## 2. Objetivos del Sistema

- Optimizar la gestión del mantenimiento preventivo y correctivo de ATMs
- Mejorar el tiempo de respuesta para el mantenimiento según los SLAs establecidos
- Facilitar la asignación y seguimiento de tickets para los técnicos (usuarios con rol de Técnico)
- Proporcionar una plataforma web para administradores y clientes
- Ofrecer una aplicación móvil con capacidades offline para técnicos en campo (usuarios con rol de Técnico)
- Generar reportes detallados para la toma de decisiones

## 3. Audiencia Objetivo

El sistema está diseñado para ser utilizado por cuatro tipos principales de usuarios:

1. **Administradores**: Personal con acceso completo al sistema, responsable de la configuración y gestión global.
2. **Operadores**: Personal encargado de la gestión del ciclo de vida de los tickets.
3. **Técnicos**: Personal de campo que realiza el mantenimiento físico de los ATMs, gestionados como usuarios con el rol 'Técnico'.
4. **Clientes**: Propietarios o responsables de los ATMs que requieren servicios de mantenimiento.

## 4. Funcionalidades Principales

### 4.1. Gestión de ATMs

- Registro detallado de cada ATM con información técnica y de ubicación
- Geolocalización para facilitar la ubicación de los equipos
- Búsqueda avanzada y filtrado por múltiples parámetros
- Historial completo de mantenimientos realizados por equipo
- Identificación mediante códigos QR

### 4.2. Gestión de Tickets

- Creación de tickets de mantenimiento (preventivo y correctivo)
- Clasificación por tipo de mantenimiento:
  - Primera línea: Servicios generales sin herramientas/piezas
  - Segunda línea: Reparación de hardware y mantenimiento preventivo
  - Por visita: Servicios bajo demanda con precios por zona geográfica
- Asignación de prioridades y categorías
- Seguimiento del ciclo de vida completo del ticket
- Adjuntos de imágenes y documentos
- Historial de cambios y acciones realizadas
- Asignación de tickets a usuarios con rol de "Técnico"

### 4.3. Dashboard y Reportes

- Dashboard principal con visualización de:
  - Trabajos pendientes
  - Disponibilidad de técnicos (usuarios con rol de Técnico)
  - Tiempo de respuesta en solicitudes
  - Fallas más recientes
  - Fallas recurrentes
  - Solicitudes más recientes
  - Fallas pendientes
  - Órdenes de trabajo pendientes
- Reportes exportables sobre:
  - Tiempo de actividad/inactividad de ATMs
  - Tickets abiertos/cerrados
  - Tiempo de respuesta y resolución
  - Tickets por tipo/categoría
  - Eficiencia de técnicos (usuarios con rol de Técnico)
  - Cumplimiento de SLAs
  - Análisis de causas recurrentes de fallos

### 4.4. Sistema de Notificaciones

- Notificaciones por correo electrónico
- Alertas en aplicación web y móvil
- Notificaciones push para técnicos (usuarios con rol de Técnico)
- Alertas de SLAs próximos a vencer

## 5. Arquitectura Técnica

### 5.1. Plataformas

- **Aplicación Web**: Portal para administradores, operadores y clientes
- **Aplicación Móvil**: Herramienta para técnicos en campo (usuarios con rol de Técnico) con capacidades offline

### 5.2. Stack Tecnológico Recomendado

- **Frontend Web**: Next.js (React)
- **Frontend Móvil**: React Native
- **Backend**: Node.js con Express
- **Base de Datos**: PostgreSQL
- **Almacenamiento de Archivos**: MinIO
- **Caché y Queue**: Redis
- **Despliegue**: Cloud-based (AWS, Google Cloud o similar)

### 5.3. Características Técnicas Clave

- Arquitectura multiusuario con control de acceso basado en roles (RBAC)
- Autenticación segura mediante JWT
- Capacidad de operación offline en la aplicación móvil
- Sincronización eficiente de datos con gestión de conflictos
- APIs RESTful para la comunicación entre clientes y servidor
- Backups automatizados con almacenamiento en Google Drive

## 6. Modelo Conceptual de Datos

### 6.1. Entidades Principales

- **Usuarios**: Información de todos los usuarios del sistema, incluyendo técnicos, operadores y administradores.
- **Roles**: Definición de roles y permisos (Admin, Operador, Técnico, Cliente)
- **ATMs**: Datos completos de cada cajero automático
- **Clientes**: Información de los propietarios/responsables de ATMs
- **Tickets**: Registro de solicitudes de mantenimiento
- **Mantenimientos**: Detalle de trabajos realizados
- **SLAs**: Definición de acuerdos de nivel de servicio
- **Piezas**: Registro de repuestos utilizados
- **Zonas Geográficas**: Definición de áreas de servicio

### 6.2. Relaciones Principales

- Un Cliente puede tener múltiples ATMs
- Un ATM puede tener múltiples Tickets
- Un Ticket está asignado a un Usuario (con rol de Técnico)
- Un Mantenimiento está asociado a un Ticket
- Un SLA está asociado a una Zona Geográfica y/o Cliente

## 7. Diseño de Interfaz de Usuario

### 7.1. Principios de Diseño

- Interfaz limpia, moderna e intuitiva similar a easymaint.net
- Diseño responsivo para adaptarse a diferentes dispositivos
- Esquema de colores profesional con indicadores visuales de estado
- Navegación simplificada con acceso rápido a funciones clave

### 7.2. Interfaces Principales

- **Dashboard**: Vista general con métricas clave y acceso a todas las funcionalidades
- **Gestión de ATMs**: CRUD completo con mapas y visualización de estado
- **Gestión de Tickets**: Interfaz de creación y seguimiento con filtros avanzados
- **Calendario de Mantenimiento**: Visualización de programación de técnicos (usuarios con rol de Técnico)
- **Reportes**: Generación dinámica con filtros y opciones de exportación
- **Configuración**: Interfaz completa para administración del sistema que incluye:
  - Gestión de usuarios: Creación, edición, desactivación y eliminación de usuarios, asignación y gestión de roles (incluyendo el rol de Técnico).
  - Control de accesos y permisos: Asignación y configuración de roles
  - Configuración de SLAs: Definición de tiempos de respuesta por zona y cliente
  - Personalización de tipos y categorías de tickets
  - Configuración de notificaciones y alertas
  - Ajustes de parámetros del sistema
  - Logs del sistema para auditoría
  - Gestión de copias de seguridad
  - Configuración de zonas geográficas

### 7.3. App Móvil para Técnicos

- Interfaz simplificada optimizada para uso en campo para usuarios con rol de "Técnico"
- Acceso rápido a tickets asignados
- Captura de fotos e información in situ
- Funcionalidad de firma de conformidad
- Modo offline con sincronización automática
- Escaneo de códigos QR para identificación rápida de ATMs
- Geolocalización para navegación hasta los ATMs

## 8. Consideraciones de Seguridad

### 8.1. Autenticación y Autorización

- Sistema de login seguro con JWT
- Control de acceso basado en roles (RBAC)
- Política de contraseñas robusta:
  - Mínimo 8 caracteres
  - Combinación de letras, números y caracteres especiales
- Sesiones con tiempo de expiración

### 8.2. Protección de Datos

- Encriptación de datos sensibles en reposo y en tránsito (HTTPS)
- Sanitización de inputs para prevenir inyecciones SQL y XSS
- Protección contra CSRF
- Logs de auditoría para todas las acciones críticas

### 8.3. Backup y Recuperación

- Respaldos semanales automatizados
- Almacenamiento de backups en Google Drive
- Procedimiento de recuperación de desastres

## 9. Fases de Desarrollo

### 9.1. Fase 1: Análisis y Diseño Detallado

- Refinamiento de requisitos
- Diseño de base de datos
- Arquitectura detallada
- Mockups de interfaz de usuario
- Plan de pruebas

### 9.2. Fase 2: Desarrollo del Backend y Base de Datos

- Implementación de APIs
- Configuración de la base de datos
- Lógica de negocio
- Sistema de autenticación y autorización (basado en roles, incluyendo el rol de Técnico)

### 9.3. Fase 3: Desarrollo del Frontend Web

- Implementación del dashboard
- Módulos de gestión (ATMs, tickets, usuarios con roles)
- Sistema de reportes
- Notificaciones

### 9.4. Fase 4: Desarrollo de la App Móvil

- Interfaz para técnicos (usuarios con rol de Técnico)
- Funcionalidad offline
- Sincronización
- Geolocalización y escaneo QR

### 9.5. Fase 5: Pruebas e Integración

- Pruebas unitarias
- Pruebas de integración
- Pruebas de rendimiento
- Pruebas de usuario

### 9.6. Fase 6: Despliegue y Capacitación

- Configuración del entorno de producción
- Migración de datos (si aplica)
- Capacitación a usuarios
- Soporte inicial

## 10. Desafíos Potenciales y Soluciones

### 10.1. Conectividad Intermitente

- **Desafío**: Técnicos (usuarios con rol de Técnico) trabajando en áreas con conectividad limitada
- **Solución**: Modo offline robusto con sincronización inteligente y manejo de conflictos

### 10.2. Rendimiento con Gran Volumen de Datos

- **Desafío**: Acumulación de historial de mantenimientos y archivos adjuntos
- **Solución**: Estrategias de paginación, indexación eficiente y archivado periódico

### 10.3. Complejidad de SLAs

- **Desafío**: Diferentes tiempos de respuesta según zona, cliente y tipo de mantenimiento
- **Solución**: Motor de reglas flexible para la definición y evaluación de SLAs

### 10.4. Adopción por Parte de los Usuarios

- **Desafío**: Resistencia al cambio, especialmente por parte de técnicos (usuarios con rol de Técnico)
- **Solución**: Interfaz intuitiva, capacitación adecuada y periodo de transición

## 11. Posibilidades de Expansión Futura

### 11.1. Módulo de Gestión de Inventario

- Control completo de piezas y repuestos
- Alertas de stock bajo
- Seguimiento de pedidos
- Gestión de proveedores

### 11.2. Integraciones con Sistemas Externos

- Conexión con sistemas ERP
- Integración con sistemas de contabilidad
- Apis para clientes externos

### 11.3. Inteligencia Artificial y Análisis Predictivo

- Predicción de fallos basada en patrones históricos
- Optimización de rutas para técnicos (usuarios con rol de Técnico)
- Recomendaciones automáticas para mantenimiento preventivo

### 11.4. Expansión Geográfica

- Soporte para múltiples países
- Interfaces multilingües
- Configuraciones específicas por región

## 12. Conclusión

Este plan maestro actualizado proporciona una hoja de ruta completa para el desarrollo de un Sistema CMMS robusto y eficiente para la gestión de mantenimiento de ATMs. La implementación de este sistema optimizará los procesos operativos, mejorará la satisfacción del cliente y proporcionará información valiosa para la toma de decisiones estratégicas. La versión 2 del masterplan simplifica la gestión de técnicos al integrarlos dentro del módulo de usuarios, mejorando la coherencia y eficiencia del sistema.

El enfoque propuesto combina las mejores prácticas en desarrollo de software con un profundo entendimiento de las necesidades específicas del negocio de mantenimiento de ATMs, resultando en una solución personalizada pero extensible para futuros requerimientos.
