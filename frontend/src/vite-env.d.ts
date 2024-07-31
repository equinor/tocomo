/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Base URL to the backend server
  readonly BACKEND_BASEURL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
