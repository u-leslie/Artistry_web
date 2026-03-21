/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_SITE_URL?: string;
  /** YouTube video URL or 11-char id — background audio in immersive shuffle (optional). */
  readonly VITE_SHUFFLE_YOUTUBE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
