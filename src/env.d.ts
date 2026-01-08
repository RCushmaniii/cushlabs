/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_CONSULTATION_URL?: string;
  readonly PUBLIC_CONSULTATION_URL_30?: string;
  readonly PUBLIC_CONSULTATION_URL_60?: string;
  readonly PUBLIC_WHATSAPP_NUMBER?: string;
  readonly WHATSAPP_NUMBER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}