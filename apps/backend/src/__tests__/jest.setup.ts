import 'reflect-metadata';

// Mock para ConfigService
jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn((key: string) => {
      const config = {
        NODE_ENV: 'test',
        PORT: 3000,
        'database.host': 'localhost',
        'database.port': 5432,
        'database.username': 'test',
        'database.password': 'test',
        'database.name': 'test_db',
        'database.synchronize': false,
        'database.logging': false
      };
      return config[key];
    })
  }))
}));

// Limpiar todos los mocks después de cada prueba
afterEach(() => {
  jest.clearAllMocks();
});

// Configuración global de Jest
global.beforeAll(() => {
  // Silenciar logs durante las pruebas
  jest.spyOn(console, 'log').mockImplementation();
  jest.spyOn(console, 'error').mockImplementation();
  jest.spyOn(console, 'warn').mockImplementation();
});

// Restaurar console.log después de todas las pruebas
global.afterAll(() => {
  jest.restoreAllMocks();
});

// Mock para el metadata de Nest
const MockReflector = {
  getAllAndOverride: jest.fn(),
  getAllAndMerge: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn()
};

jest.mock('@nestjs/core', () => ({
  ...jest.requireActual('@nestjs/core'),
  Reflector: jest.fn(() => MockReflector)
}));

// Helper para crear un mock de ExecutionContext
export const createMockExecutionContext = (data: any = {}) => ({
  switchToHttp: () => ({
    getRequest: () => ({
      url: '/test',
      method: 'GET',
      headers: {},
      query: {},
      params: {},
      ...data.request
    }),
    getResponse: () => ({
      statusCode: 200,
      getHeader: jest.fn(),
      setHeader: jest.fn(),
      ...data.response
    })
  }),
  getHandler: () => ({}),
  getClass: () => ({}),
  ...data
});

// Helper para crear un mock de CallHandler
export const createMockCallHandler = (returnValue: any = {}) => ({
  handle: jest.fn().mockReturnValue(returnValue)
});
