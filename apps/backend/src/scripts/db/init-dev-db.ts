import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from '../../config';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function initDevDatabase() {
  console.log('\nInitializing development database...\n');

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
    logging: appConfig.database.logging,
    synchronize: true, // Only for development!
    entities: ['src/**/*.entity{.ts,.js}']
  };

  const dataSource = new DataSource(dbConfig);

  try {
    // Initialize database connection
    console.log('🔌 Connecting to database...');
    await dataSource.initialize();
    console.log('  ✅ Database connection successful');

    // Drop existing schema and recreate it
    console.log('\n🗑️  Cleaning database...');
    await dataSource.synchronize(true);
    console.log('  ✅ Database cleaned');

    // Create default users
    console.log('\n👥 Creating default users...');
    const userRepository = dataSource.getRepository(User);

    const defaultUsers = [
      {
        email: 'admin@example.com',
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        firstName: 'Admin',
        lastName: 'User',
        role: Role.ADMIN,
        isActive: true
      },
      {
        email: 'tech@example.com',
        username: 'technician',
        password: await bcrypt.hash('tech123', 10),
        firstName: 'Tech',
        lastName: 'User',
        role: Role.TECHNICIAN,
        isActive: true
      },
      {
        email: 'user@example.com',
        username: 'user',
        password: await bcrypt.hash('user123', 10),
        firstName: 'Regular',
        lastName: 'User',
        role: Role.VIEWER,
        isActive: true
      }
    ];

    for (const userData of defaultUsers) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`  ✅ Created user: ${userData.username} (${userData.role})`);
    }

    // Create test data
    console.log('\n📊 Creating test data...');

    // TODO: Add creation of test data for:
    // - ATMs
    // - Clients
    // - Geographic Zones
    // - Maintenance Records
    // - Tickets
    // - Comments
    // etc.

    console.log('  ✅ Test data created');

    // Database initialization complete
    console.log('\n✨ Database initialization complete!');
    console.log('\nDefault users created:');
    console.log('  Admin     : admin@example.com / admin123');
    console.log('  Technician: tech@example.com / tech123');
    console.log('  User      : user@example.com / user123\n');

    await dataSource.destroy();
    return true;
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }

    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }

    process.exit(1);
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initDevDatabase();
}

export { initDevDatabase };
