declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    AUTH_SECRET: string;
    NEXT_PUBLIC_APP_URL: string;
    NEXTAUTH_URL: string;
    ADMIN_URL: string;
    AUTH_GOOGLE_ID: string;
    AUTH_GOOGLE_SECRET: string;
  }
}

export {};