import { initDevEnvironment } from './init-dev';
import { initDevDatabase } from '../db/init-dev-db';
import { config, Environment } from '../../config';

async function setupDevelopmentEnvironment() {
  console.log('🚀 Starting development environment setup...\n');

  try {
    // Check if we're in development environment
    const appConfig = config();
    if (appConfig.env !== Environment.Development) {
      throw new Error(
        `Cannot run setup in ${appConfig.env} environment. Please set NODE_ENV=development`
      );
    }

    // Step 1: Initialize development environment
    console.log('📋 Step 1: Initializing development environment...');
    const envInitResult = await initDevEnvironment();
    if (!envInitResult) {
      throw new Error('Environment initialization failed');
    }
    console.log('  ✅ Environment initialization complete\n');

    // Step 2: Initialize database
    console.log('📋 Step 2: Initializing database...');
    const dbInitResult = await initDevDatabase();
    if (!dbInitResult) {
      throw new Error('Database initialization failed');
    }
    console.log('  ✅ Database initialization complete\n');

    // Setup complete
    console.log('✨ Development environment setup completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Start the application:');
    console.log('   $ npm run start:dev');
    console.log('\n2. Access the API documentation:');
    console.log('   http://localhost:3001/api/docs');
    console.log('\n3. Login with default credentials:');
    console.log('   Admin     : admin@example.com / admin123');
    console.log('   Technician: tech@example.com / tech123');
    console.log('   User      : user@example.com / user123\n');

    return true;
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Add command-line arguments handling
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    force: false,
    skipEnv: false,
    skipDb: false
  };

  args.forEach(arg => {
    switch (arg) {
      case '--force':
        options.force = true;
        break;
      case '--skip-env':
        options.skipEnv = true;
        break;
      case '--skip-db':
        options.skipDb = true;
        break;
      case '--help':
        showHelp();
        process.exit(0);
    }
  });

  return options;
}

function showHelp() {
  console.log(`
Usage: npm run setup:dev [options]

Options:
  --force     Force setup even if environment checks fail
  --skip-env  Skip environment initialization
  --skip-db   Skip database initialization
  --help      Show this help message

Example:
  npm run setup:dev --force
  `);
}

// Run setup if this script is executed directly
if (require.main === module) {
  const options = parseArgs();
  setupDevelopmentEnvironment();
}

export { setupDevelopmentEnvironment };
