/// <reference types="vite/client" />
declare module '*.html?raw' {
  const src: string;
  export default src;
}

declare module '*.vue' {
  import { defineComponent } from 'vue';
  const component: ReturnType<typeof defineComponent>;
  export default component;
}

declare const EXT_CM: {
  css: string;
  script: string;
};

declare const SPONSORS: Array<{
  username: string;
  avatar: string;
  url: string;
}>;

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
