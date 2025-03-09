import { mapData } from './data.js';

type MaybeEffect<T> = (data: T | undefined) => T;

function runEffect<T>(scope: string, key: string, effect: MaybeEffect<T>) {
  mapData(scope, `effect:${key}`, effect);
}

export { runEffect };
