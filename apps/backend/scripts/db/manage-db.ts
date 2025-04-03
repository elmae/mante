#!/usr/bin/env ts-node
import { Client } from 'pg';
import chalk from 'chalk';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../../.env') });

interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database?: string;
}

async function createConnection(config: DbConfig): Promise<Client> {
  const client = new Client(config);
  await client.connect();
  return client;
}

async function closeConnection(client: Client): Promise<void> {
  await client.end();
}

async function createDatabase(dbName: string): Promise<void> {
  const adminConfig: DbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'cmms_user',
    password: process.env.DB_PASS || 'cmms_password2'
  };

  console.log(chalk.blue(`🗄️  Creating database "${dbName}"...`));

  const client = await createConnection(adminConfig);

  try {
    // Check if database exists
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (result.rows.length === 0) {
      // Create database if it doesn't exist
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(chalk.green(`✅ Database "${dbName}" created successfully`));
    } else {
      console.log(chalk.yellow(`⚠️  Database "${dbName}" already exists`));
    }
  } catch (error) {
    console.error(chalk.red('Error creating database:'), error);
    throw error;
  } finally {
    await closeConnection(client);
  }
}

async function dropDatabase(dbName: string): Promise<void> {
  const adminConfig: DbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'cmms_user',
    password: process.env.DB_PASS || 'cmms_password2'
  };

  console.log(chalk.yellow(`🗑️  Dropping database "${dbName}"...`));

  const client = await createConnection(adminConfig);

  try {
    // Terminate all connections to the database
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
        AND pid <> pg_backend_pid()
    `, [dbName]);

    // Drop the database
    await client.query(`DROP DATABASE IF EXISTS ${dbName}`);
    console.log(chalk.green(`✅ Database "${dbName}" dropped successfully`));
  } catch (error) {
    console.error(chalk.red('Error dropping database:'), error);
    throw error;
  } finally {
    await closeConnection(client);
  }
}

async function main() {
  const command = process.argv[2];
  const dbName = process.argv[3] || process.env.DB_NAME;

  if (!dbName) {
    console.error(chalk.red('❌ Database name is required'));
    process.exit(1);
  }

  try {
    switch (command) {
      case 'create':
        await createDatabase(dbName);
        break;
      case 'drop':
        await dropDatabase(dbName);
        break;
      default:
        console.error(chalk.red('❌ Invalid command. Use "create" or "drop"'));
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

export { createDatabase, dropDatabase };