/// <reference types="cypress" />

interface InterceptRequest {
  body: unknown;
  headers: Record<string, string>;
  method: string;
  url: string;
  reply(response: {
    statusCode?: number;
    body?: unknown;
    headers?: Record<string, string>;
    delay?: number;
    fixture?: string;
  }): void;
}

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to intercept requests
     * @param method HTTP method
     * @param url URL to intercept
     * @param response Response to return
     */
    intercept(
      method: string,
      url: string,
      response?: string | object
    ): Chainable<null>;

    /**
     * Custom command to intercept requests with a handler
     * @param method HTTP method
     * @param url URL to intercept
     * @param handler Response handler
     */
    intercept(
      method: string,
      url: string,
      handler: (req: InterceptRequest) => void
    ): Chainable<null>;

    /**
     * Custom command to intercept requests with options
     * @param options Intercept options
     */
    intercept(options: {
      method?: string;
      url: string;
      response?: string | object;
      fixture?: string;
      headers?: Record<string, string>;
      statusCode?: number;
    }): Chainable<null>;
  }
}
