import type { Config } from "tailwindcss";
import { themeConfig } from "./src/theme/theme.config";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: themeConfig.colors.primary,
        secondary: themeConfig.colors.secondary,
        success: themeConfig.colors.success,
        warning: themeConfig.colors.warning,
        error: themeConfig.colors.error,
        info: themeConfig.colors.info,
      },
      fontFamily: themeConfig.fontFamily,
      borderRadius: themeConfig.borderRadius,
      boxShadow: themeConfig.shadows,
    },
  },
  plugins: [],
};

export default config;
