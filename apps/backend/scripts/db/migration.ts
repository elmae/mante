#!/usr/bin/env ts-node
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';
import chalk from 'chalk';
import { spawn } from 'child_process';

// Load environment variables
config({ path: resolve(__dirname, '../../.env') });

interface MigrationConfig {
  name?: string;
  direction: 'up' | 'down';
  to?: string;
}

const getDataSource = () => new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'cmms_user',
  password: process.env.DB_PASS || 'cmms_password2',
  database: process.env.DB_NAME || 'mante_dev',
  entities: ['src/domain/entities/**/*.ts'],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
  synchronize: false,
  logging: true
});

async function runMigration(config: MigrationConfig) {
  const dataSource = getDataSource();

  try {
    console.log(chalk.blue('🔄 Initializing database connection...'));
    await dataSource.initialize();
    console.log(chalk.green('✓ Database connection established'));

    if (config.direction === 'up') {
      if (config.to) {
        console.log(chalk.blue(`🔼 Running migrations up to ${config.to}...`));
        await dataSource.migrations.map(migration => migration);
      } else {
        console.log(chalk.blue('🔼 Running all pending migrations...'));
        await dataSource.runMigrations();
      }
    } else {
      const steps = config.to ? parseInt(config.to) : 1;
      console.log(chalk.blue(`🔽 Rolling back ${steps} migration(s)...`));
      await dataSource.undoLastMigration();
    }

    console.log(chalk.green('✅ Migrations completed successfully'));
  } catch (error) {
    console.error(chalk.red('❌ Migration failed:'), error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

async function generateMigration(name: string) {
  const timestamp = new Date().getTime();
  const migrationName = `${timestamp}-${name}`;

  console.log(chalk.blue(`📝 Generating migration: ${migrationName}`));

  const result = spawn(
    'npx',
    [
      'typeorm',
      'migration:generate',
      `src/infrastructure/database/migrations/${migrationName}`,
      '-d',
      'src/infrastructure/database/datasource.ts'
    ],
    { stdio: 'inherit' }
  );

  return new Promise((resolve, reject) => {
    result.on('error', (error) => {
      console.error(chalk.red('❌ Failed to generate migration:'), error);
      reject(error);
    });

    result.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('✅ Migration generated successfully'));
        resolve(true);
      } else {
        console.error(chalk.red(`❌ Migration generation failed with code ${code}`));
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}

async function main() {
  const command = process.argv[2];
  const name = process.argv[3];
  const to = process.argv[4];

  try {
    switch (command) {
      case 'generate':
        if (!name) {
          throw new Error('Migration name is required for generation');
        }
        await generateMigration(name);
        break;

      case 'up':
        await runMigration({ direction: 'up', to });
        break;

      case 'down':
        await runMigration({ direction: 'down', to });
        break;

      default:
        console.error(chalk.red('❌ Invalid command. Use "generate", "up", or "down"'));
        process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('❌ Operation failed:'), error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}

export { runMigration, generateMigration };