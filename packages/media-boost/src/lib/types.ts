export interface MediaBoostAnalysis {
  inputName: string;
  inputBytes: number;
  estimatedOutputBytes: number;
  mediaCount: number;
  helperNoteCount: number;
  format: 'latest' | 'legacy';
}

export type MediaBoostStage =
  | 'reading'
  | 'parsing-media'
  | 'building-collection'
  | 'writing-media'
  | 'finalizing';

export interface MediaBoostProgress {
  stage: MediaBoostStage;
  completed: number;
  total: number;
  currentFile?: string;
}

export interface GenerateMediaBoostOptions {
  referencesPerNote?: number;
  signal?: AbortSignal;
  onProgress?: (progress: MediaBoostProgress) => void;
}

export interface MediaBoostResult {
  outputName: string;
  outputBytes: number;
  mediaCount: number;
  helperNoteCount: number;
  blob: Blob;
}

export type MediaBoostErrorCode =
  | 'ABORTED'
  | 'DUPLICATE_ENTRY'
  | 'ENCRYPTED_PACKAGE'
  | 'INVALID_MEDIA_FILENAME'
  | 'INVALID_PACKAGE'
  | 'MISSING_MEDIA_ENTRY'
  | 'UNSUPPORTED_PACKAGE';

export class MediaBoostError extends Error {
  constructor(
    public readonly code: MediaBoostErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'MediaBoostError';
  }
}
