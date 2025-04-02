interface EnvConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

const env = process.env.NODE_ENV || "development";

export const config: EnvConfig = {
  isDevelopment: env === "development",
  isProduction: env === "production",
  isTest: env === "test",
};
