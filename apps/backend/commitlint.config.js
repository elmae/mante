module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Code style changes (formatting, etc)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding or modifying tests
        'build',    // Build system changes
        'ci',       // CI configuration changes
        'chore',    // Other changes
        'revert'    // Revert previous commit
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'auth',        // Authentication and authorization
        'user',        // User management
        'atm',         // ATM management
        'ticket',      // Ticket management
        'maintenance', // Maintenance management
        'sla',         // SLA management
        'config',      // Configuration changes
        'db',          // Database changes
        'api',         // API changes
        'test',        // Test infrastructure
        'docs',        // Documentation
        'deps'         // Dependencies
      ]
    ],
    'type-case': [2, 'always', 'lower'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower'],
    'subject-case': [2, 'always', 'lower'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [1, 'always']
  },
  prompt: {
    settings: {
      enableMultipleScopes: true
    },
    messages: {
      skip: '(opcional)',
      max: 'máximo %d caracteres',
      min: 'mínimo %d caracteres',
      emptyWarning: 'no puede estar vacío',
      upperLimitWarning: 'sobre el límite',
      lowerLimitWarning: 'bajo el límite'
    },
    questions: {
      type: {
        description: "Seleccione el tipo de cambio que está realizando:"
      },
      scope: {
        description: "Seleccione el alcance del cambio (puede ser múltiple):"
      },
      subject: {
        description: "Escriba una descripción corta del cambio:"
      },
      body: {
        description: "Proporcione una descripción más detallada del cambio (opcional):"
      },
      breaking: {
        description: "Liste cualquier cambio que rompa compatibilidad (opcional):"
      },
      footer: {
        description: "Liste cualquier issue cerrado por este cambio (opcional):"
      }
    }
  },
  helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint'
};