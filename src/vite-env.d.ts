/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Web3Forms access key. Public by design — it identifies a form, not an
   * account, and Web3Forms expects it in client-side code.
   */
  readonly VITE_WEB3FORMS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
