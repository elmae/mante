import { config } from '../config/config';
import { validationSchema } from '../config/validation.schema';
import { Environment } from '../config';

function validateEnvironment() {
  try {
    // Validate environment variables
    const { error, value } = validationSchema.validate(process.env, {
      abortEarly: false,
      allowUnknown: true
    });

    if (error) {
      console.error('\nEnvironment validation failed:');
      error.details.forEach(detail => {
        console.error(`  ❌ ${detail.message}`);
      });
      process.exit(1);
    }

    // Additional checks for required configurations based on environment
    const env = value.NODE_ENV as Environment;
    const isProduction = env === Environment.Production;

    // Production-specific checks
    if (isProduction) {
      const requiredProductionVars = ['JWT_SECRET', 'DATABASE_URL', 'CORS_ORIGIN'];

      const missingVars = requiredProductionVars.filter(varName => !process.env[varName]);

      if (missingVars.length > 0) {
        console.error('\nMissing required production environment variables:');
        missingVars.forEach(varName => {
          console.error(`  ❌ ${varName}`);
        });
        process.exit(1);
      }

      // Validate security settings
      if (process.env.DB_SYNC === 'true') {
        console.error('\n⚠️  Warning: Database synchronization is enabled in production');
        process.exit(1);
      }
    }

    // Try to load the configuration
    const appConfig = config();

    // Log successful validation
    console.log('\nEnvironment validation successful:');
    console.log(`  ✅ Environment: ${env}`);
    console.log(`  ✅ Database: ${appConfig.database.host}:${appConfig.database.port}`);
    console.log(`  ✅ API: ${appConfig.host}:${appConfig.port}`);
    console.log(`  ✅ Storage Type: ${appConfig.storage.type}`);

    if (appConfig.redis) {
      console.log(`  ✅ Redis: ${appConfig.redis.host}:${appConfig.redis.port}`);
    }

    console.log('\nConfiguration loaded successfully ✨\n');
    return true;
  } catch (error) {
    console.error('\nConfiguration error:', error.message);
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateEnvironment();
}

export { validateEnvironment };
