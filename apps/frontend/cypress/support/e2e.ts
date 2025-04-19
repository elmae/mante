// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************************

declare global {
  namespace Cypress {
    interface Chainable {
      // add custom commands here
    }
  }
}

// Import commands.js using ES2015 syntax:
import "./commands";

Cypress.on("window:before:load", (win) => {
  Object.defineProperty(win, "localStorage", {
    value: {
      getItem: (key: string) => win.localStorage[key],
      setItem: (key: string, value: string) => {
        win.localStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete win.localStorage[key];
      },
    },
    configurable: true,
  });
});

// Alternatively you can use CommonJS syntax:
// require('./commands')
