// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataHolder = Record<string, any>;

declare global {
  interface Window {
    AnkiEcoData: DataHolder;
  }
}

function dataHolder(): DataHolder {
  return (window.AnkiEcoData = window.AnkiEcoData || {});
}

function getData<T>(scope: string, key: string): T {
  const dataKey = `${scope}:${key}`;
  return dataHolder()[dataKey] as T;
}

function setData<T>(scope: string, key: string, data: T) {
  const dataKey = `${scope}:${key}`;
  dataHolder()[dataKey] = data;
}

function mapData<T>(scope: string, key: string, mapper: (data: T) => T) {
  setData(scope, key, mapper(getData(scope, key)));
}

export { getData, setData, mapData };
