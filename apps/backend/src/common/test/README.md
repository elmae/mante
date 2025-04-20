# Test Utilities

Este módulo proporciona un conjunto de utilidades y helpers para facilitar la
escritura de pruebas en el proyecto.

## Instalación

Las utilidades están disponibles automáticamente en el proyecto. No se requiere
instalación adicional.

## Uso Principal

```typescript
import {
  createMockRepository,
  createTestingModule,
  TEST_CONFIG,
  expectAsync
} from '@common/test';
```

## Características Principales

### 1. Creación de Mocks

#### Repository Mocks

```typescript
const repository = createMockRepository<MyEntity>();

// Configurar comportamiento
repository.find.mockResolvedValue([
  /* datos */
]);
repository.findOne.mockResolvedValue(/* datos */);
```

#### Query Builder Mocks

```typescript
const queryBuilder = repository.createQueryBuilder();
queryBuilder.where.mockReturnThis();
queryBuilder.andWhere.mockReturnThis();
queryBuilder.getMany.mockResolvedValue([
  /* datos */
]);
```

### 2. Configuración de Módulos de Prueba

```typescript
const module = await createTestingModule({
  imports: [MyModule],
  providers: [
    MyService,
    {
      provide: getRepositoryToken(MyEntity),
      useFactory: createMockRepository
    }
  ]
}).compile();
```

### 3. Helpers de Aserciones

```typescript
// Validar UUID
expect(id).toBeUUID();

// Validar fechas ISO
expect(date).toBeISODate();

// Manejar promesas
await expectAsync(
  promise,
  result => expect(result).toBeDefined(),
  error => expect(error).toBeInstanceOf(Error)
);
```

### 4. Constantes y Configuración

```typescript
// Configuración de prueba
const dbConfig = TEST_CONFIG.database;

// Constantes útiles
const { VALID_UUID, VALID_EMAIL } = TEST_CONSTANTS;
```

## Patrones de Prueba Recomendados

### 1. Estructura Básica

```typescript
describe('MyFeature', () => {
  let module: TestingModule;
  let service: MyService;
  let repository: MockRepository<MyEntity>;

  beforeAll(async () => {
    module = await createTestingModule({
      providers: [
        /* ... */
      ]
    }).compile();

    service = module.get(MyService);
    repository = module.get(getRepositoryToken(MyEntity));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests...
});
```

### 2. Pruebas de Repositorio

```typescript
it('should find entities', async () => {
  const mockData = [
    /* ... */
  ];
  repository.find.mockResolvedValue(mockData);

  const result = await service.findAll();
  expect(result).toEqual(mockData);
  expect(repository.find).toHaveBeenCalled();
});
```

### 3. Manejo de Errores

```typescript
it('should handle errors', async () => {
  const error = new Error('Test error');
  repository.find.mockRejectedValue(error);

  await expectAsync(
    service.findAll(),
    () => fail('Should not resolve'),
    err => expect(err).toBe(error)
  );
});
```

## Tips y Mejores Prácticas

1. **Limpieza de Mocks**

   - Usar `jest.clearAllMocks()` en `beforeEach`
   - Restaurar valores originales en `afterEach` si es necesario

2. **Tipos**

   - Siempre especificar tipos genéricos al crear mocks
   - Utilizar interfaces para los datos de prueba

3. **Aserciones**

   - Preferir `.toEqual()` sobre `.toBe()` para objetos
   - Usar matchers personalizados para validaciones comunes

4. **Organización**
   - Agrupar pruebas relacionadas con `describe`
   - Nombres descriptivos para los tests
   - Comentarios para casos complejos

## Extensión

Para agregar nuevos matchers personalizados:

```typescript
expect.extend({
  myCustomMatcher(received: any) {
    const pass = /* lógica */;
    return {
      message: () => `expected ${received} to...`,
      pass
    };
  }
});
```

## Ejemplos

Ver `example.spec.ts` para ejemplos completos de uso de todas las utilidades.
