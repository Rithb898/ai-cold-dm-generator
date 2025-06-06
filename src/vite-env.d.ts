/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_POSTHOG_KEY: string;
  readonly VITE_PUBLIC_POSTHOG_HOST: string;
  readonly VITE_GROQ_API_KEY: string;
  readonly VITE_GOOGLE_GENERATIVE_AI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}