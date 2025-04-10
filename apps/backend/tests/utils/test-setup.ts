import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Cargar variables de entorno desde .env.test
dotenv.config({ path: join(__dirname, '../../.env.test') });

export const testDataSource = new DataSource({
  type: 'postgres',
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '5432', 10),
  username: process.env.TEST_DB_USER || 'cmms_user',
  password: process.env.TEST_DB_PASS || 'cmms_password2',
  database: process.env.TEST_DB_NAME || 'mante_test',
  entities: [join(__dirname, '../../src/domain/entities/*.entity{.ts,.js}')],
  synchronize: true,
  logging: false,
  dropSchema: true // Asegura una base de datos limpia para cada ejecución de pruebas
});

export const setupTestDB = async (): Promise<DataSource> => {
  try {
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
      // Sincronizar el esquema después de inicializar
      await testDataSource.synchronize(true);
    }
    return testDataSource;
  } catch (error) {
    console.error('Error al inicializar la base de datos de prueba:', error);
    throw error;
  }
};

export const teardownTestDB = async (): Promise<void> => {
  if (testDataSource.isInitialized) {
    // Limpiar todas las tablas antes de cerrar la conexión
    await testDataSource.synchronize(true);
    await testDataSource.destroy();
  }
};
