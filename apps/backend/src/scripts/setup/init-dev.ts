import * as fs from 'fs';
import * as path from 'path';
import { validateEnvironment } from '../validate-env';
import { config, Environment } from '../../config';
import { DataSource, DataSourceOptions } from 'typeorm';

async function initDevEnvironment() {
  console.log('\nInitializing development environment...\n');

  try {
    // Step 1: Validate environment variables
    console.log('🔍 Validating environment variables...');
    validateEnvironment();

    // Step 2: Create necessary directories
    console.log('\n📁 Creating required directories...');
    const requiredDirs = ['uploads', 'uploads/maintenance', 'uploads/tickets', 'logs'];

    for (const dir of requiredDirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`  ✅ Created directory: ${dir}`);
      } else {
        console.log(`  ℹ️  Directory already exists: ${dir}`);
      }
    }

    // Step 3: Check database connection
    console.log('\n🔌 Testing database connection...');
    const appConfig = config();
    const dbConfig: DataSourceOptions = {
      type: 'postgres',
      host: appConfig.database.host,
      port: appConfig.database.port,
      username: appConfig.database.username,
      password: appConfig.database.password,
      database: appConfig.database.database,
      schema: appConfig.database.schema,
      ssl: appConfig.database.ssl,
      logging: appConfig.database.logging
    };

    const dataSource = new DataSource(dbConfig);

    try {
      await dataSource.initialize();
      console.log('  ✅ Database connection successful');
      await dataSource.destroy();
    } catch (error) {
      console.error('  ❌ Database connection failed:', error.message);
      process.exit(1);
    }

    // Step 4: Verify configurations
    console.log('\n⚙️  Verifying configurations...');
    const environment = appConfig.env;

    if (environment !== Environment.Development) {
      console.warn('\n⚠️  Warning: Not running in development environment');
      console.warn(`Current environment: ${environment}`);
    }

    // Step 5: Additional checks
    console.log('\n🔒 Checking security configurations...');
    if (appConfig.jwt.secret === 'your-secret-key-here') {
      console.warn('  ⚠️  Warning: Using default JWT secret key');
    }

    if (appConfig.cors.origin === '*') {
      console.warn('  ⚠️  Warning: CORS is set to allow all origins');
    }

    // Step 6: Check required features
    console.log('\n🔍 Checking required features...');

    if (!appConfig.storage) {
      console.warn('  ⚠️  Warning: Storage configuration is missing');
    }

    if (!appConfig.logging) {
      console.warn('  ⚠️  Warning: Logging configuration is missing');
    }

    // Setup complete
    console.log('\n✨ Development environment initialization complete!');
    console.log('\nYou can now start the application with:');
    console.log('  npm run start:dev\n');

    return true;
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  initDevEnvironment();
}

export { initDevEnvironment };
