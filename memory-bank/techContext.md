# Tech Context

## Tecnologías utilizadas

- **Frontend Web:** Next.js (React), Tailwind CSS, Typescript
- **Frontend Móvil:** React Native, Typescript
- **Backend:** Node.js, Express.js, Typescript
- **Base de Datos:** PostgreSQL
- **Almacenamiento de Archivos:** MinIO
- **Caché y Queue:** Redis
- **Autenticación y Autorización:** JWT, Refresh Tokens, Token Blacklist
- **Infraestructura Cloud:** AWS, Google Cloud o similar (a definir)
- **Herramientas de Desarrollo:** VSCode, Git, Docker, npm/yarn
- **Identificación de ATMs:** Códigos QR
- **Mapas y Geolocalización:** (a definir)
- **Sistema de Backups:** Google Drive

## Entorno de desarrollo

- **Sistema Operativo:** Linux/Ubuntu 24.02 LTS para desarrollo, Linux para producción
- **Entorno de Desarrollo Integrado (IDE):** VSCode
- **Control de Versiones:** Git
- **Gestor de Paquetes:** npm
- **Base de Datos:** PostgreSQL local para desarrollo, PostgreSQL en la nube para producción
- **Servidor de Caché y Queue:** Redis local para desarrollo, Redis en la nube para producción
- **Servidor de Almacenamiento de Archivos:** MinIO local para desarrollo, MinIO en la nube para producción

## Limitaciones técnicas

- **Escalabilidad:** El sistema debe ser escalable para soportar el crecimiento futuro en el número de ATMs y usuarios (aproximadamente 500 ATMs).
- **Rendimiento:** El sistema debe ser rápido y eficiente, especialmente en la aplicación móvil con capacidades offline.
- **Seguridad:** El sistema debe ser seguro y proteger los datos sensibles de los usuarios y ATMs.
- **Conectividad:** La aplicación móvil debe funcionar correctamente en áreas con conectividad intermitente.
- **Sincronización de datos:** La sincronización de datos entre la aplicación móvil y el backend debe ser eficiente y robusta, gestionando posibles conflictos.
- **Capacidad Offline:** La aplicación móvil debe tener capacidades offline robustas.

## Dependencias

- **Librerías y Frameworks:** React, React Native, Next.js, Express.js, PostgreSQL, MinIO, Redis, JWT, jsonwebtoken (v9.0.2), bcryptjs (v2.4.3), uuid (v9.0.1)
- **Servicios Cloud:** AWS, Google Cloud o similar (a definir)
- **Servicios Externos:** Posible integración con APIs de terceros para geolocalización, mapas, etc. (a definir)

## Configuraciones de Autenticación (Nuevo)

- **JWT Config:**

  - Access Token Expiry: 15m
  - Refresh Token Expiry: 7d
  - Algorithm: HS256
  - Secret Rotation: Enabled

- **Redis Config:**

  - Blacklist TTL: 30d
  - Refresh Token Store: Enabled
  - Connection Pool: 10

- **Security Headers:**
  - Strict-Transport-Security
  - Content-Security-Policy
  - X-Frame-Options
  - X-Content-Type-Options
