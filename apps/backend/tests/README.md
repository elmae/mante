# Testing Guide

Este documento describe la estructura y configuración de pruebas del backend del
sistema de mantenimiento de ATMs.

## Estructura de Pruebas

```
tests/
├── unit/               # Pruebas unitarias
├── integration/        # Pruebas de integración
├── e2e/               # Pruebas end-to-end
└── utils/             # Utilidades compartidas para pruebas
```

## Tipos de Pruebas

### Pruebas Unitarias

- Ubicación: `src/**/*.spec.ts`
- Ejecutar: `npm run test:unit`
- Prueban componentes individuales de forma aislada
- Usan mocks y stubs para dependencias

### Pruebas de Integración

- Ubicación: `src/**/*.integration.spec.ts`
- Ejecutar: `npm run test:integration`
- Prueban la interacción entre componentes
- Pueden requerir una base de datos de prueba

### Pruebas E2E

- Ubicación: `tests/e2e/**/*.spec.ts`
- Ejecutar: `npm run test:e2e`
- Prueban el sistema completo
- Requieren que todas las dependencias estén disponibles

## Comandos de Prueba

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas unitarias
npm run test:unit

# Ejecutar pruebas de integración
npm run test:integration

# Ejecutar pruebas e2e
npm run test:e2e

# Ejecutar pruebas con coverage
npm run test:cov

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas en modo debug
npm run test:debug
```

## Configuración

### Jest

- Configuración principal: `jest.config.ts`
- Configuración E2E: `test/jest-e2e.json`
- Setup file: `src/__tests__/jest.setup.ts`

### ESLint

- Configuración específica para pruebas: `.eslintrc.test.json`
- Reglas personalizadas para archivos de prueba

## Buenas Prácticas

1. Nombrado de pruebas:

   - Descriptivo y claro
   - Sigue el patrón "should [expected behavior] when [condition]"

2. Organización:

   - Una prueba por comportamiento
   - Usar `describe` para agrupar pruebas relacionadas
   - Mantener las pruebas enfocadas y concisas

3. Mocks y Stubs:

   - Usar `jest.mock()` para módulos
   - Crear mocks específicos en `tests/utils`
   - Documentar el comportamiento esperado

4. Assertions:
   - Ser específico en las assertions
   - Usar matchers apropiados
   - Validar estados positivos y negativos

## Extendiendo las Pruebas

### Agregar Nuevas Pruebas Unitarias

```typescript
describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    service = new MyService();
  });

  it('should do something when condition', () => {
    // Arrange
    const input = ...;

    // Act
    const result = service.doSomething(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### Agregar Pruebas de Integración

```typescript
describe('Integration - MyFeature', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should integrate correctly', async () => {
    // Test implementation
  });
});
```

## Tips para Debugging

1. Usar `console.log()` con `--verbose`
2. Utilizar el modo debug con VS Code
3. Revisar el coverage para identificar casos faltantes
4. Usar `test.only()` para ejecutar pruebas específicas

## Mantenimiento

1. Revisar y actualizar pruebas regularmente
2. Mantener el coverage por encima del 70%
3. Refactorizar pruebas cuando sea necesario
4. Documentar cambios significativos
