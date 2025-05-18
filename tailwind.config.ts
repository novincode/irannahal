import path from "path";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./apps/web/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/web/app/**/*.{js,ts,jsx,tsx,mdx}",

    "./apps/admin/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/admin/app/**/*.{js,ts,jsx,tsx,mdx}",

    "./packages/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;