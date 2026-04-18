import type { BuildConfig } from './config.ts';
import { entries } from './entries.ts';
import { template } from 'lodash-es';

export function ensureValue<T extends (...args: any[]) => any>(value: T): ReturnType<T>;
export function ensureValue<T>(value: T): T;

export function ensureValue(value: any) {
  return typeof value === 'function' ? value() : value;
}

export function configMatch(pattern: Partial<BuildConfig>, config: BuildConfig) {
  return Object.entries(pattern)
    .filter(([, v]) => !!v)
    .every(([k, v]) => config[k as keyof BuildConfig] === v);
}

export function findMatchNote(config: BuildConfig) {
  const notes = entries[config.entry].notes;
  return notes.filter(({ config: noteConfig }: { config: any }) => configMatch(noteConfig, config));
}

export function renderTemplate(html: string, data: object) {
  return template(html, {
    interpolate: /{{([\s\S]+?)}}/g,
  })(data);
}
