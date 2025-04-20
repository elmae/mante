import { ObjectLiteral, DeleteResult, UpdateResult } from 'typeorm';

export type JestMockFn<TResult = any, TArgs extends any[] = any[]> = {
  (...args: TArgs): TResult;
  mockReturnThis(): JestMockFn<TResult, TArgs>;
  mockResolvedValue(value: Awaited<TResult>): JestMockFn<TResult, TArgs>;
  mockImplementation(fn: (...args: TArgs) => TResult): JestMockFn<TResult, TArgs>;
};

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
};

export interface MockQueryBuilder<T extends ObjectLiteral = any> {
  where: JestMockFn<MockQueryBuilder<T>>;
  andWhere: JestMockFn<MockQueryBuilder<T>>;
  orderBy: JestMockFn<MockQueryBuilder<T>>;
  skip: JestMockFn<MockQueryBuilder<T>>;
  take: JestMockFn<MockQueryBuilder<T>>;
  getMany: JestMockFn<Promise<T[]>>;
  getOne: JestMockFn<Promise<T | null>>;
  getManyAndCount: JestMockFn<Promise<[T[], number]>>;
  getCount: JestMockFn<Promise<number>>;
}

export interface MockRepository<T extends ObjectLiteral> {
  find: JestMockFn<Promise<T[]>>;
  findOne: JestMockFn<Promise<T | null>>;
  findOneBy: JestMockFn<Promise<T | null>>;
  save: JestMockFn<Promise<T>, [DeepPartial<T>]>;
  create: JestMockFn<T, [DeepPartial<T>]>;
  merge: JestMockFn<T, [T, ...DeepPartial<T>[]]>;
  delete: JestMockFn<Promise<DeleteResult>>;
  update: JestMockFn<Promise<UpdateResult>>;
  createQueryBuilder: JestMockFn<MockQueryBuilder<T>>;
}

export interface TestConfig {
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
  };
  auth: {
    jwtSecret: string;
    expiresIn: string;
  };
  storage: {
    path: string;
  };
  mail: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
}

export interface TestConstants {
  VALID_UUID: string;
  VALID_EMAIL: string;
  VALID_PASSWORD: string;
  INVALID_UUID: string;
  INVALID_EMAIL: string;
  INVALID_PASSWORD: string;
  DEFAULT_TIMEOUT: number;
}

// Extensiones de Jest
export interface CustomMatchers<R = unknown> {
  toBeUUID(): R;
  toBeISODate(): R;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}
