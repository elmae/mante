# ATM Maintenance System - Backend

Sistema de gestión de mantenimiento de ATMs desarrollado con NestJS.

## Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)
- npm o yarn

## Configuración

1. Clonar el repositorio

```bash
git clone <repository-url>
cd apps/backend
```

2. Instalar dependencias

```bash
npm install
```

3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar el archivo `.env` con los valores correspondientes a tu entorno.

4. Crear la base de datos

```bash
createdb atm_maintenance
```

## Desarrollo

Iniciar el servidor en modo desarrollo:

```bash
npm run start:dev
```

El servidor estará disponible en `http://localhost:3000`

## Scripts Disponibles

- `npm run build` - Compila el proyecto
- `npm run start` - Inicia el servidor en modo producción
- `npm run start:dev` - Inicia el servidor en modo desarrollo
- `npm run test` - Ejecuta las pruebas unitarias
- `npm run test:e2e` - Ejecuta las pruebas de integración
- `npm run lint` - Ejecuta el linter
- `npm run format` - Formatea el código

## Estructura del Proyecto

```
src/
├── attachments/       # Gestión de archivos adjuntos
├── auth/             # Autenticación y autorización
├── clients/          # Gestión de clientes
├── common/           # Utilidades y decoradores compartidos
├── config/          # Configuración de la aplicación
├── domain/          # Entidades y tipos de dominio
├── maintenance/     # Módulo principal de mantenimiento
├── notifications/   # Sistema de notificaciones
├── tickets/         # Gestión de tickets
└── users/           # Gestión de usuarios
```

## API Endpoints

La documentación de la API está disponible en `/api` cuando el servidor está en
ejecución.

## Características Principales

- Gestión completa de mantenimientos de ATMs
- Sistema de tickets para seguimiento de incidencias
- Gestión de tareas y partes de mantenimiento
- Sistema de notificaciones
- Autenticación y autorización basada en roles
- Carga y gestión de archivos adjuntos
- Reportes y dashboard

## Licencia

[MIT](LICENSE)

## Contribuir

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Contacto

Nombre - email@example.com Project Link:
[https://github.com/username/repo](https://github.com/username/repo)
