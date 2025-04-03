#!/usr/bin/env ts-node
import { spawnSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const ROOT_DIR = join(__dirname, '../..');

async function main() {
  console.log(chalk.blue('🚀 Initializing development environment...\n'));

  // Create necessary directories
  const dirs = [
    'logs',
    'tmp',
    'coverage',
    '.husky'
  ];

  console.log(chalk.yellow('📁 Creating directories...'));
  dirs.forEach(dir => {
    const path = join(ROOT_DIR, dir);
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
      console.log(chalk.green(`✓ Created ${dir}`));
    }
  });

  // Install dependencies
  console.log(chalk.yellow('\n📦 Installing dependencies...'));
  const install = spawnSync('npm', ['install'], {
    stdio: 'inherit',
    cwd: ROOT_DIR
  });

  if (install.status !== 0) {
    console.error(chalk.red('❌ Failed to install dependencies'));
    process.exit(1);
  }

  // Initialize Husky
  console.log(chalk.yellow('\n🐶 Setting up Husky...'));
  const husky = spawnSync('npx', ['husky', 'install'], {
    stdio: 'inherit',
    cwd: ROOT_DIR
  });

  if (husky.status !== 0) {
    console.error(chalk.red('❌ Failed to initialize Husky'));
    process.exit(1);
  }

  // Make Husky hooks executable
  console.log(chalk.yellow('\n📝 Making Husky hooks executable...'));
  ['pre-commit', 'commit-msg'].forEach(hook => {
    const hookPath = join(ROOT_DIR, '.husky', hook);
    if (existsSync(hookPath)) {
      spawnSync('chmod', ['+x', hookPath], { stdio: 'inherit' });
      console.log(chalk.green(`✓ Made ${hook} executable`));
    }
  });

  // Create test database
  console.log(chalk.yellow('\n🗄️  Setting up test database...'));
  const setupDb = spawnSync('npm', ['run', 'db:create'], {
    stdio: 'inherit',
    cwd: ROOT_DIR,
    env: {
      ...process.env,
      NODE_ENV: 'test'
    }
  });

  if (setupDb.status !== 0) {
    console.error(chalk.red('❌ Failed to setup test database'));
    process.exit(1);
  }

  // Run initial type check
  console.log(chalk.yellow('\n📝 Running type check...'));
  const typecheck = spawnSync('npm', ['run', 'typecheck'], {
    stdio: 'inherit',
    cwd: ROOT_DIR
  });

  if (typecheck.status !== 0) {
    console.error(chalk.red('❌ Type check failed'));
    process.exit(1);
  }

  // Run tests
  console.log(chalk.yellow('\n🧪 Running tests...'));
  const test = spawnSync('npm', ['test'], {
    stdio: 'inherit',
    cwd: ROOT_DIR
  });

  if (test.status !== 0) {
    console.error(chalk.red('❌ Tests failed'));
    process.exit(1);
  }

  console.log(chalk.green('\n✅ Development environment initialized successfully!'));
  console.log(chalk.blue('\nNext steps:'));
  console.log('1. Create a .env file based on .env.example');
  console.log('2. Start the development server: npm run dev');
  console.log('3. Visit http://localhost:3000 to verify the setup');
}

main().catch(error => {
  console.error(chalk.red('\n❌ Setup failed:'), error);
  process.exit(1);
});