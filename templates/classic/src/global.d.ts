declare module 'at/options' {
  type BuildConfig = import('../build/config').BuildConfig;
  export const fields: string[];
  export const entry: BuildConfig['entry'];
  export const locale: BuildConfig['locale'];
}

declare module 'at/i18n' {
  const i18nMap: typeof import('../translations/en.json') &
    typeof import('../translations/zh.json') &
    typeof import('../translations/ja.json') &
    typeof import('../translations/pt_br.json');
  export = i18nMap;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: any;
  export default content;
}

declare module '@/BUILD_ENTRY.tsx' {}
