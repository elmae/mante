import { execSync } from 'child_process';
import * as path from 'path';

function runTests() {
  try {
    console.log('🧪 Running tests...\n');

    const projectRoot = path.resolve(__dirname, '../../');
    const testConfig = path.join(projectRoot, 'jest.config.ts');
    const eslintConfig = path.join(projectRoot, '.eslintrc.test.json');

    // Ejecutar ESLint primero
    console.log('Running ESLint...');
    execSync(`eslint --config ${eslintConfig} "src/**/*.{ts,tsx}" --max-warnings 0`, {
      stdio: 'inherit',
      cwd: projectRoot
    });
    console.log('✅ ESLint passed\n');

    // Ejecutar pruebas unitarias
    console.log('Running unit tests...');
    execSync(`jest -c ${testConfig} --testPathPattern="\\.spec\\.ts$" --coverage`, {
      stdio: 'inherit',
      cwd: projectRoot,
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    });
    console.log('✅ Unit tests passed\n');

    // Ejecutar pruebas de integración si existen
    if (process.argv.includes('--integration')) {
      console.log('Running integration tests...');
      execSync(
        `jest -c ${testConfig} --testPathPattern="\\.integration\\.spec\\.ts$" --runInBand`,
        {
          stdio: 'inherit',
          cwd: projectRoot,
          env: {
            ...process.env,
            NODE_ENV: 'test'
          }
        }
      );
      console.log('✅ Integration tests passed\n');
    }

    console.log('🎉 All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  }
}

// Funciones auxiliares
function validateEnvironment() {
  const requiredEnvVars = ['NODE_ENV', 'DATABASE_URL', 'JWT_SECRET'];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
  }
}

function getTestFiles(): string[] {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    return args.map(file => path.resolve(process.cwd(), file));
  }
  return ['src/**/*.spec.ts'];
}

// Ejecutar las pruebas
if (require.main === module) {
  try {
    validateEnvironment();
    runTests();
  } catch (error) {
    console.error('❌ Error running tests:', error);
    process.exit(1);
  }
}

export { runTests, validateEnvironment, getTestFiles };
