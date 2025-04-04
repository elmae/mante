# MANTE - Sistema de Gestión de Mantenimiento de ATMs

[![Node.js CI](https://github.com/tu-organizacion/mante/actions/workflows/node.js.yml/badge.svg)](https://github.com/tu-organizacion/mante/actions/workflows/node.js.yml)
[![Coverage Status](https://coveralls.io/repos/github/tu-organizacion/mante/badge.svg?branch=main)](https://coveralls.io/github/tu-organizacion/mante?branch=main)

Aplicación backend para la gestión integral de mantenimiento de cajeros automáticos (ATMs), incluyendo seguimiento de tickets, SLA, y mantenimientos preventivos/correctivos.

## 🚀 Características Principales

- Gestión centralizada de ATMs y su ubicación geográfica
- Sistema de tickets con seguimiento de SLA
- Mantenimientos preventivos y correctivos programables
- Autenticación JWT y control de acceso basado en roles
- Monitoreo en tiempo real de métricas clave
- Integración con sistemas de notificaciones
- API RESTful documentada
- Suite completa de pruebas unitarias e integración

## 🛠 Tecnologías

- **Lenguaje**: TypeScript 4.x
- **Runtime**: Node.js 18.x
- **Framework**: Express 4.x
- **ORM**: TypeORM 0.3.x
- **Base de datos**: PostgreSQL 14.x
- **Testing**: Jest 29.x, Supertest 6.x
- **Validación**: class-validator 0.14.x
- **Documentación**: OpenAPI 3.x
- **Logging**: Winston 3.x
- **Variables de entorno**: Dotenv 16.x

## 📦 Requisitos del Sistema

- Node.js 18.x o superior
- PostgreSQL 14.x+
- npm 9.x o yarn 1.x
- Git 2.37+

## 🔧 Instalación

1. Clonar repositorio:

```bash
git clone https://github.com/tu-organizacion/mante.git
cd mante/apps/backend
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar entorno:

```bash
cp .env.example .env
```

4. Editar variables de entorno en `.env`:

```ini
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=secret
DB_NAME=mante_dev
JWT_SECRET=tu_super_secreto
```

## 🏃 Ejecución

Modo desarrollo (con reinicio automático):

```bash
npm run dev
```

Modo producción:

```bash
npm start
```

## 🧪 Pruebas

Ejecutar todas las pruebas:

```bash
npm test
```

Pruebas unitarias (modo watch):

```bash
npm run test:unit
```

Pruebas de integración:

```bash
npm run test:integration
```

Generar reporte de cobertura:

```bash
npm run test:coverage
```

## 📚 Documentación API

La documentación OpenAPI está disponible en:

- Desarrollo: `http://localhost:3000/api-docs`
- Producción: `https://tudominio.com/api-docs`

## 🏗 Estructura del Proyecto

```bash
apps/backend/
├── src/
│   ├── config/       # Configuraciones
│   ├── controllers/  # Controladores Express
│   ├── domain/       # Entidades de negocio
│   ├── infrastructure/ # Conexiones externas
│   ├── middleware/   # Middlewares Express
│   ├── routes/       # Definición de rutas
│   ├── services/     # Lógica de negocio
│   └── utils/        # Utilidades comunes
├── tests/            # Pruebas automatizadas
└── scripts/          # Scripts de apoyo
```

## 🤝 Contribución

1. Crear un fork del proyecto
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Hacer commit siguiendo [Conventional Commits](https://www.conventionalcommits.org):

```bash
git commit -m "feat: agregar nuevo endpoint para ATMs"
```

4. Hacer push: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

📄 **Licencia**: MIT © 2025 MANTE Team
