import path from "path";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    path.join(__dirname, "packages/ui/**/*.{ts,tsx}"),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
