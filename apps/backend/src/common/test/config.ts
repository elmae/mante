import { TestConfig, TestConstants } from './types';

/**
 * Configuración por defecto para pruebas
 */
export const TEST_CONFIG: TestConfig = {
  database: {
    host: 'localhost',
    port: 5432,
    username: 'test',
    password: 'test',
    database: 'test_db',
    synchronize: true,
    logging: false
  },
  auth: {
    jwtSecret: 'test-secret',
    expiresIn: '1h'
  },
  storage: {
    path: '/tmp/test-storage'
  },
  mail: {
    host: 'localhost',
    port: 1025,
    secure: false,
    auth: {
      user: 'test',
      pass: 'test'
    }
  }
};

/**
 * Constantes útiles para pruebas
 */
export const TEST_CONSTANTS: TestConstants = {
  VALID_UUID: '123e4567-e89b-12d3-a456-426614174000',
  VALID_EMAIL: 'test@example.com',
  VALID_PASSWORD: 'Test123!@#',
  INVALID_UUID: 'not-a-uuid',
  INVALID_EMAIL: 'not-an-email',
  INVALID_PASSWORD: '123',
  DEFAULT_TIMEOUT: 5000
};

/**
 * Extensiones de Jest
 */
export const TEST_MATCHERS = {
  toBeUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid UUID`,
      pass
    };
  },
  toBeISODate(received: string) {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    const pass = isoDateRegex.test(received);
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid ISO date`,
      pass
    };
  }
};

// Configurar extensiones de Jest
expect.extend(TEST_MATCHERS);

/**
 * Funciones auxiliares para configuración de pruebas
 */
export function getTestConfig(overrides: Partial<TestConfig> = {}): TestConfig {
  return {
    ...TEST_CONFIG,
    ...overrides,
    database: {
      ...TEST_CONFIG.database,
      ...overrides.database
    },
    auth: {
      ...TEST_CONFIG.auth,
      ...overrides.auth
    },
    storage: {
      ...TEST_CONFIG.storage,
      ...overrides.storage
    },
    mail: {
      ...TEST_CONFIG.mail,
      ...overrides.mail,
      auth: {
        ...TEST_CONFIG.mail.auth,
        ...overrides.mail?.auth
      }
    }
  };
}

export function getTestDatabaseConfig(overrides: Partial<TestConfig['database']> = {}) {
  return {
    ...TEST_CONFIG.database,
    ...overrides
  };
}

export function getTestAuthConfig(overrides: Partial<TestConfig['auth']> = {}) {
  return {
    ...TEST_CONFIG.auth,
    ...overrides
  };
}

export function getTestStorageConfig(overrides: Partial<TestConfig['storage']> = {}) {
  return {
    ...TEST_CONFIG.storage,
    ...overrides
  };
}

export function getTestMailConfig(overrides: Partial<TestConfig['mail']> = {}) {
  return {
    ...TEST_CONFIG.mail,
    ...overrides,
    auth: {
      ...TEST_CONFIG.mail.auth,
      ...overrides.auth
    }
  };
}
