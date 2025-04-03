#!/usr/bin/env ts-node
import { readFileSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';

const ENV_EXAMPLE_PATH = resolve(__dirname, '../../.env.example');
const ENV_PATH = resolve(__dirname, '../../.env');

interface EnvVar {
  key: string;
  value: string;
  isComment: boolean;
  category: string;
}

function parseEnvFile(path: string): EnvVar[] {
  try {
    const content = readFileSync(path, 'utf-8');
    const vars: EnvVar[] = [];
    let currentCategory = 'General';

    content.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      
      // Handle category comments
      if (trimmedLine.startsWith('# ') && !trimmedLine.includes('=')) {
        currentCategory = trimmedLine.replace('# ', '').replace(' Configuration', '').trim();
        return;
      }

      // Skip empty lines
      if (!trimmedLine) return;

      // Handle variable lines
      if (trimmedLine.includes('=')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=');
        vars.push({
          key: key.trim(),
          value: value.trim(),
          isComment: false,
          category: currentCategory
        });
      }
    });

    return vars;
  } catch (error) {
    console.error(chalk.red(`Error reading ${path}:`), error);
    process.exit(1);
  }
}

function validateEnv() {
  console.log(chalk.blue('🔍 Validating environment configuration...\n'));

  // Read example and actual env files
  const exampleVars = parseEnvFile(ENV_EXAMPLE_PATH);
  const envVars = parseEnvFile(ENV_PATH);

  // Create maps for easy lookup
  const envVarsMap = new Map(envVars.map(v => [v.key, v]));
  const exampleVarsMap = new Map(exampleVars.map(v => [v.key, v]));

  // Track issues by category
  const issues: Record<string, { missing: string[]; extra: string[]; }> = {};

  // Check for missing variables
  exampleVars.forEach(({ key, category }) => {
    if (!envVarsMap.has(key)) {
      if (!issues[category]) {
        issues[category] = { missing: [], extra: [] };
      }
      issues[category].missing.push(key);
    }
  });

  // Check for extra variables
  envVars.forEach(({ key, category }) => {
    if (!exampleVarsMap.has(key)) {
      if (!issues[category]) {
        issues[category] = { missing: [], extra: [] };
      }
      issues[category].extra.push(key);
    }
  });

  // Report results
  let hasIssues = false;

  Object.entries(issues).forEach(([category, { missing, extra }]) => {
    if (missing.length > 0 || extra.length > 0) {
      hasIssues = true;
      console.log(chalk.yellow(`\n${category} Configuration:`));
      
      if (missing.length > 0) {
        console.log(chalk.red('  Missing variables:'));
        missing.forEach(key => {
          const exampleVar = exampleVarsMap.get(key);
          console.log(chalk.red(`    - ${key}=${exampleVar?.value || ''}`));
        });
      }
      
      if (extra.length > 0) {
        console.log(chalk.yellow('  Extra variables:'));
        extra.forEach(key => {
          const envVar = envVarsMap.get(key);
          console.log(chalk.yellow(`    - ${key}=${envVar?.value || ''}`));
        });
      }
    }
  });

  if (!hasIssues) {
    console.log(chalk.green('✅ Environment configuration is valid!'));
    return true;
  } else {
    console.log(chalk.red('\n❌ Environment configuration needs attention.'));
    console.log(chalk.blue('\nSuggestions:'));
    console.log('1. Copy missing variables from .env.example to .env');
    console.log('2. Review extra variables in .env file');
    console.log('3. Run this validation again');
    return false;
  }
}

// Run validation if script is executed directly
if (require.main === module) {
  const isValid = validateEnv();
  process.exit(isValid ? 0 : 1);
}

export { validateEnv };