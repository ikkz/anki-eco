import {
  analyzeMediaBoostPackage,
  generateMediaBoostPackage,
  type MediaBoostProgress,
} from '@anki-eco/media-boost';

let controller: AbortController | undefined;

self.addEventListener('message', async (event: MessageEvent) => {
  const { id, type, file } = event.data as {
    id: string;
    type: 'analyze' | 'cancel' | 'generate';
    file?: File;
  };

  if (type === 'cancel') {
    controller?.abort();
    return;
  }

  controller = new AbortController();
  try {
    if (!file) throw new Error('Missing input file.');
    if (type === 'analyze') {
      const analysis = await analyzeMediaBoostPackage(file, { signal: controller.signal });
      self.postMessage({ id, type: 'result', result: analysis });
    } else {
      const result = await generateMediaBoostPackage(file, {
        signal: controller.signal,
        onProgress: (progress: MediaBoostProgress) => {
          self.postMessage({ id, type: 'progress', progress });
        },
      });
      self.postMessage({ id, type: 'result', result });
    }
  } catch (error) {
    const detail =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            code: 'code' in error ? error.code : undefined,
          }
        : { name: 'Error', message: String(error) };
    self.postMessage({ id, type: 'error', error: detail });
  }
});
