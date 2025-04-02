# Propuesta de organización de Directorios

## Estructura Propuesta

```
/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── tests/
│   │   │   ├── integration/
│   │   │   ├── load/
│   │   │   └── unit/
│   │   └── scripts/
│   │       ├── deploy/
│   │       └── migrations/
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── lib/
│       │   ├── pages/
│       │   ├── theme/
│       │   ├── types/
│       │   └── utils/
│       ├── public/
│       └── tests/
│           ├── e2e/
│           └── unit/
├── docs/
│   ├── api/
│   ├── guides/
│   └── architecture/
├── config/
│   ├── development/
│   ├── production/
│   └── test/
└── scripts/
    ├── build/
    ├── deploy/
    └── tools/
```

## Justificación de Cambios

### 1. Separación Clara de Aplicaciones

- Mover backend y frontend a `/apps`
- Mejor organización para proyectos monorepo
- Facilita la adición de más aplicaciones/servicios

### 2. Reorganización de Pruebas

- Centralizar pruebas en directorio `tests`
- Separar por tipo (unit, integration, load, e2e)
- Mejor organización y ejecución de pruebas

### 3. Documentación Centralizada

- Nuevo directorio `/docs`
- Subdirectorios por tipo de documentación
- Facilita mantenimiento y búsqueda

### 4. Configuración Consolidada

- Directorio `/config` organizado por ambiente
- Elimina duplicación de configuración
- Mejor gestión de variables por ambiente

### 5. Scripts Centralizados

- Directorio `/scripts` para automatización
- Organizado por propósito
- Facilita mantenimiento y CI/CD

## Beneficios

1. **Mantenibilidad**

   - Estructura más intuitiva
   - Menos duplicación
   - Mejor organización de código

2. **Escalabilidad**

   - Facilita agregar nuevos servicios
   - Mejor gestión de dependencias
   - Estructura preparada para crecimiento

3. **Desarrollo**

   - Flujo de trabajo más claro
   - Mejor organización de pruebas
   - Documentación centralizada

4. **Despliegue**
   - Scripts organizados por propósito
   - Configuración clara por ambiente
   - Mejor gestión de builds

## Consideraciones Adicionales

1. **Versionado**

   - Mantener `.gitignore` actualizado
   - Considerar versionado de configuración

2. **Dependencies**

   - Separar dependencias por aplicación
   - Mantener dependencias comunes en raíz

3. **CI/CD**

   - Actualizar pipelines según nueva estructura
   - Configurar builds por aplicación

4. **Monitoreo**
   - Organizar logs por aplicación
   - Centralizar métricas y monitoreo
