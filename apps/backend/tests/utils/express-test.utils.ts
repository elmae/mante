import { Request, Response } from "express";
import { jest, expect } from "@jest/globals";

// Define custom user type for request
interface RequestUser {
  id: string;
  role: string;
  permissions: string[];
}

export class MockRequest {
  public user?: RequestUser;
  public body: any;
  public query: Record<string, any>;
  public params: Record<string, string>;
  public headers: Record<string, string>;
  public method?: string;
  public path?: string;

  constructor(
    options: {
      user?: RequestUser;
      body?: any;
      query?: Record<string, any>;
      params?: Record<string, string>;
      headers?: Record<string, string>;
      method?: string;
      path?: string;
    } = {}
  ) {
    this.user = options.user;
    this.body = options.body || {};
    this.query = options.query || {};
    this.params = options.params || {};
    this.headers = options.headers || {};
    this.method = options.method;
    this.path = options.path;
  }
}

export class MockResponse {
  public statusCode: number;
  public body: any;
  private headers: Map<string, string | string[] | number>;

  constructor() {
    this.statusCode = 200;
    this.headers = new Map();
    this.body = undefined;
  }

  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  json(data: any): this {
    this.body = data;
    return this;
  }

  send(data?: any): this {
    if (data !== undefined) {
      this.body = data;
    }
    return this;
  }

  setHeader(name: string, value: string | string[] | number): this {
    this.headers.set(name.toLowerCase(), value);
    return this;
  }

  getHeader(name: string): string | string[] | number | undefined {
    return this.headers.get(name.toLowerCase());
  }

  getHeaders(): Record<string, string | string[] | number> {
    const headers: Record<string, string | string[] | number> = {};
    this.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }
}

export type MockRequestHandler = (
  req: MockRequest,
  res: MockResponse,
  next: Function
) => Promise<void> | void;

export const createMockNext = () => jest.fn();

export const expectSuccessResponse = (res: MockResponse, statusCode = 200) => {
  expect(res.statusCode).toBe(statusCode);
  expect(res.body).toBeDefined();
};

export const expectErrorResponse = (
  res: MockResponse,
  statusCode: number,
  errorMessage?: string
) => {
  expect(res.statusCode).toBe(statusCode);
  expect(res.body.error).toBeDefined();
  if (errorMessage) {
    expect(res.body.message).toContain(errorMessage);
  }
};

export const expectPaginatedResponse = (res: MockResponse) => {
  expect(res.body).toBeDefined();
  expect(Array.isArray(res.body.items)).toBe(true);
  expect(typeof res.body.total).toBe("number");
  expect(typeof res.body.page).toBe("number");
  expect(typeof res.body.limit).toBe("number");
  expect(typeof res.body.totalPages).toBe("number");
};

// Helper types for route handlers
export type RouteHandler = (
  req: Request,
  res: Response,
  next: Function
) => Promise<void> | void;

export const wrapHandler = (handler: RouteHandler): RouteHandler => {
  return async (req: Request, res: Response, next: Function) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// Type guard for checking response type
export const isMockResponse = (res: any): res is MockResponse => {
  return res instanceof MockResponse;
};

// Helper for creating common test scenarios
export const createTestContext = () => {
  const req = new MockRequest();
  const res = new MockResponse();
  const next = createMockNext();

  return { req, res, next };
};

// Declare module augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}
