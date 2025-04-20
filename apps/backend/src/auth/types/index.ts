export * from './auth.types';

// Type utilities
export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

export type RequireOnlyOne<T> = {
  [K in keyof T]: Required<Pick<T, K>> & Partial<Record<Exclude<keyof T, K>, never>>;
}[keyof T];
