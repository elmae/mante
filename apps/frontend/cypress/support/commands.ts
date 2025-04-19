/// <reference types="cypress" />

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): void;
    logout(): void;
    exists(): Chainable<JQuery<HTMLElement>>;
    clearAuthState(): void;
    getLocalStorageToken(): Chainable<string | null>;
  }

  interface AuthRequestBody {
    email?: string;
    password?: string;
    [key: string]: unknown;
  }

  interface Interception {
    request: {
      method: string;
      url: string;
      body: AuthRequestBody;
    };
  }
}

// Login command
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/login");
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
});

// Logout command
Cypress.Commands.add("logout", () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
});

// Check if element exists
Cypress.Commands.add("exists", { prevSubject: true }, (subject) => {
  cy.wrap(subject).should("have.length.gt", 0);
  return cy.wrap(subject);
});

// Clear local storage and cookies
Cypress.Commands.add("clearAuthState", () => {
  cy.clearLocalStorage();
  cy.clearCookies();
});

// Get token from localStorage
Cypress.Commands.add("getLocalStorageToken", () => {
  return cy.window().its("localStorage").invoke("getItem", "token");
});
