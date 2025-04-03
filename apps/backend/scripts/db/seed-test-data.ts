#!/usr/bin/env ts-node
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';
import chalk from 'chalk';
import bcrypt from 'bcrypt';

import { Role, RoleType } from '../../src/domain/entities/role.entity';
import { User } from '../../src/domain/entities/user.entity';
import { Permission } from '../../src/domain/entities/permission.entity';

// Load environment variables
config({ path: resolve(__dirname, '../../.env') });

async function createConnection(): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'cmms_user',
    password: process.env.DB_PASS || 'cmms_password2',
    database: process.env.DB_NAME || 'mante_test',
    entities: [User, Role, Permission],
    synchronize: true,
  });

  await dataSource.initialize();
  return dataSource;
}

async function seedTestData(dataSource: DataSource) {
  console.log(chalk.blue('🌱 Seeding test data...'));

  // Create permissions
  console.log(chalk.yellow('Creating permissions...'));
  const permissionRepository = dataSource.getRepository(Permission);
  
  const permissions = await permissionRepository.save([
    { name: '*', description: 'All permissions' },
    { name: 'read:users', description: 'Read users' },
    { name: 'create:users', description: 'Create users' },
    { name: 'update:users', description: 'Update users' },
    { name: 'delete:users', description: 'Delete users' },
    { name: 'read:tickets', description: 'Read tickets' },
    { name: 'create:tickets', description: 'Create tickets' },
    { name: 'update:tickets', description: 'Update tickets' },
    { name: 'delete:tickets', description: 'Delete tickets' },
    { name: 'read:maintenance', description: 'Read maintenance records' },
    { name: 'create:maintenance', description: 'Create maintenance records' },
    { name: 'update:maintenance', description: 'Update maintenance records' },
  ]);

  // Create roles
  console.log(chalk.yellow('Creating roles...'));
  const roleRepository = dataSource.getRepository(Role);

  const adminRole = await roleRepository.save({
    name: RoleType.ADMIN,
    description: 'System Administrator',
    permissions: [permissions[0]], // All permissions
  });

  const techRole = await roleRepository.save({
    name: RoleType.TECHNICIAN,
    description: 'Field Technician',
    permissions: [
      permissions[5], // read:tickets
      permissions[7], // update:tickets
      permissions[9], // read:maintenance
      permissions[10], // create:maintenance
      permissions[11], // update:maintenance
    ],
  });

  const operatorRole = await roleRepository.save({
    name: RoleType.OPERATOR,
    description: 'System Operator',
    permissions: [
      permissions[5], // read:tickets
      permissions[6], // create:tickets
      permissions[9], // read:maintenance
    ],
  });

  // Create users
  console.log(chalk.yellow('Creating users...'));
  const userRepository = dataSource.getRepository(User);
  const hashedPassword = await bcrypt.hash('test123', 10);

  await userRepository.save([
    {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      full_name: 'System Administrator',
      role: adminRole,
      is_active: true,
    },
    {
      username: 'tech',
      email: 'tech@example.com',
      password: hashedPassword,
      full_name: 'Test Technician',
      role: techRole,
      is_active: true,
    },
    {
      username: 'operator',
      email: 'operator@example.com',
      password: hashedPassword,
      full_name: 'Test Operator',
      role: operatorRole,
      is_active: true,
    },
  ]);

  console.log(chalk.green('✅ Test data seeded successfully!'));
  console.log(chalk.blue('\nTest Users:'));
  console.log('- admin@example.com / test123 (Administrator)');
  console.log('- tech@example.com / test123 (Technician)');
  console.log('- operator@example.com / test123 (Operator)');
}

async function main() {
  let connection: DataSource | undefined;

  try {
    connection = await createConnection();
    await seedTestData(connection);
  } catch (error) {
    console.error(chalk.red('Error seeding test data:'), error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.destroy();
    }
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}

export { seedTestData };