import {
  BlobReader,
  BlobWriter,
  type Entry,
  type FileEntry,
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipReader,
  ZipWriter,
} from '@zip.js/zip.js';
import { Zstd } from '@hpcc-js/wasm-zstd';
import { buildHelperCollection } from './collection.js';
import { parseMediaNames, parsePackageVersion } from './protobuf.js';
import {
  MediaBoostError,
  type GenerateMediaBoostOptions,
  type MediaBoostAnalysis,
  type MediaBoostResult,
} from './types.js';

const DEFAULT_REFERENCES_PER_NOTE = 5000;
let zstdReady: Promise<Zstd> | undefined;

function ensureZstd(): Promise<Zstd> {
  return (zstdReady ??= Zstd.load());
}

function abortError(): MediaBoostError {
  return new MediaBoostError('ABORTED', 'Operation cancelled.');
}

function checkSignal(signal?: AbortSignal): void {
  if (signal?.aborted) throw abortError();
}

function isSafeMediaFilename(name: string): boolean {
  return (
    name.length > 0 &&
    name !== '.' &&
    name !== '..' &&
    !name.includes('/') &&
    !name.includes('\\') &&
    !hasControlCharacter(name)
  );
}

function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    if (code <= 0x1f || code === 0x7f) {
      return true;
    }
  }

  return false;
}

async function entryBytes(entry: FileEntry, signal?: AbortSignal): Promise<Uint8Array> {
  checkSignal(signal);
  return entry.getData(new Uint8ArrayWriter(), { signal });
}

interface OpenedPackage {
  reader: ZipReader<Blob>;
  entries: Map<string, FileEntry>;
  media: MediaItem[];
  version: 1 | 2 | 3;
  collectionFilename: 'collection.anki2' | 'collection.anki21' | 'collection.anki21b';
}

interface MediaItem {
  zipFilename: string;
  name: string;
}

function parseLegacyMedia(bytes: Uint8Array): MediaItem[] {
  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new MediaBoostError('INVALID_PACKAGE', 'Unable to decode the legacy APKG media list.');
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new MediaBoostError('INVALID_PACKAGE', 'Invalid legacy APKG media list.');
  }

  return Object.entries(value).map(([zipFilename, name]) => {
    if (!/^\d+$/u.test(zipFilename) || typeof name !== 'string') {
      throw new MediaBoostError('INVALID_PACKAGE', 'Invalid legacy APKG media entry.');
    }
    return { zipFilename, name };
  });
}

async function openAndValidate(input: File, signal?: AbortSignal): Promise<OpenedPackage> {
  checkSignal(signal);
  const reader = new ZipReader(new BlobReader(input));
  const entries = new Map<string, FileEntry>();
  for await (const entry of reader.getEntriesGenerator()) {
    if (entry.directory) continue;
    if (entries.has(entry.filename)) {
      await reader.close();
      throw new MediaBoostError('DUPLICATE_ENTRY', `Duplicate ZIP entry: ${entry.filename}`);
    }
    if (entry.encrypted) {
      await reader.close();
      throw new MediaBoostError('ENCRYPTED_PACKAGE', 'Encrypted APKG files are not supported.');
    }
    entries.set(entry.filename, entry);
  }

  if (!entries.has('media')) {
    await reader.close();
    throw new MediaBoostError(
      'UNSUPPORTED_PACKAGE',
      'This does not appear to be a valid APKG file.',
    );
  }

  let version: number;
  if (entries.has('meta')) {
    version = parsePackageVersion(await entryBytes(entries.get('meta')!, signal));
  } else {
    version = entries.has('collection.anki21') ? 2 : 1;
  }
  if (version !== 1 && version !== 2 && version !== 3) {
    await reader.close();
    throw new MediaBoostError('UNSUPPORTED_PACKAGE', `Unsupported APKG format version ${version}.`);
  }

  const collectionFilename =
    version === 3 ? 'collection.anki21b' : version === 2 ? 'collection.anki21' : 'collection.anki2';
  if (!entries.has(collectionFilename)) {
    await reader.close();
    throw new MediaBoostError(
      'UNSUPPORTED_PACKAGE',
      `APKG version ${version} must contain ${collectionFilename}.`,
    );
  }

  let media: MediaItem[];
  try {
    const encodedMedia = await entryBytes(entries.get('media')!, signal);
    if (version === 3) {
      const zstd = await ensureZstd();
      media = parseMediaNames(zstd.decompress(encodedMedia)).map((name, index) => ({
        zipFilename: String(index),
        name,
      }));
    } else {
      media = parseLegacyMedia(encodedMedia);
    }
  } catch (error) {
    await reader.close();
    if (error instanceof MediaBoostError) throw error;
    if (signal?.aborted) throw abortError();
    throw new MediaBoostError('INVALID_PACKAGE', 'Unable to decode the APKG media list.');
  }

  for (const { zipFilename, name } of media) {
    if (!isSafeMediaFilename(name)) {
      await reader.close();
      throw new MediaBoostError('INVALID_MEDIA_FILENAME', `Unsafe media filename: ${name}`);
    }
    if (!entries.has(zipFilename)) {
      await reader.close();
      throw new MediaBoostError('MISSING_MEDIA_ENTRY', `Missing media ZIP entry: ${zipFilename}`);
    }
  }

  return {
    reader,
    entries,
    media,
    version,
    collectionFilename,
  };
}

export async function analyzeMediaBoostPackage(
  input: File,
  options: { signal?: AbortSignal } = {},
): Promise<MediaBoostAnalysis> {
  const opened = await openAndValidate(input, options.signal);
  await opened.reader.close();
  return {
    inputName: input.name,
    inputBytes: input.size,
    estimatedOutputBytes: input.size,
    mediaCount: opened.media.length,
    helperNoteCount: Math.ceil(opened.media.length / DEFAULT_REFERENCES_PER_NOTE),
    format: opened.version === 3 ? 'latest' : 'legacy',
  };
}

function outputName(name: string): string {
  return `${name.replace(/\.apkg$/iu, '')}.media-boost.apkg`;
}

async function copyEntry(
  entry: FileEntry,
  writer: ZipWriter<unknown>,
  signal?: AbortSignal,
): Promise<void> {
  await writer.add(entry.filename, new Uint8ArrayReader(await entryBytes(entry, signal)), {
    level: 0,
    lastModDate: entry.lastModDate,
    signal,
  });
}

export async function generateMediaBoostPackage(
  input: File,
  options: GenerateMediaBoostOptions = {},
): Promise<MediaBoostResult> {
  const referencesPerNote = options.referencesPerNote ?? DEFAULT_REFERENCES_PER_NOTE;
  if (!Number.isInteger(referencesPerNote) || referencesPerNote < 1) {
    throw new RangeError('referencesPerNote must be a positive integer.');
  }
  const progress = options.onProgress ?? (() => {});
  progress({ stage: 'reading', completed: 0, total: input.size });
  const opened = await openAndValidate(input, options.signal);
  const { entries, media, reader, version, collectionFilename } = opened;
  const mediaNames = media.map(({ name }) => name);
  const helperNoteCount = Math.ceil(media.length / referencesPerNote);

  try {
    checkSignal(options.signal);
    progress({ stage: 'building-collection', completed: 0, total: helperNoteCount });
    const collection = await buildHelperCollection(mediaNames, referencesPerNote, options.signal);
    if (new TextDecoder().decode(collection.subarray(0, 15)) !== 'SQLite format 3') {
      throw new MediaBoostError('INVALID_PACKAGE', 'Failed to build helper collection.');
    }
    const outputCollection =
      version === 3 ? (await ensureZstd()).compress(collection, 3) : collection;
    progress({
      stage: 'building-collection',
      completed: helperNoteCount,
      total: helperNoteCount,
    });

    const zipWriter = new ZipWriter(new BlobWriter('application/octet-stream'), {
      zip64: input.size >= 0xffffffff,
    });
    if (entries.has('meta')) await copyEntry(entries.get('meta')!, zipWriter, options.signal);
    await copyEntry(entries.get('media')!, zipWriter, options.signal);

    for (const [index, item] of media.entries()) {
      checkSignal(options.signal);
      await copyEntry(entries.get(item.zipFilename)!, zipWriter, options.signal);
      progress({
        stage: 'writing-media',
        completed: index + 1,
        total: media.length,
        currentFile: item.name,
      });
    }
    await zipWriter.add(collectionFilename, new Uint8ArrayReader(outputCollection), {
      level: 0,
      signal: options.signal,
    });

    progress({ stage: 'finalizing', completed: 0, total: 1 });
    const blob = await zipWriter.close();
    progress({ stage: 'finalizing', completed: 1, total: 1 });
    return {
      outputName: outputName(input.name),
      outputBytes: blob.size,
      mediaCount: media.length,
      helperNoteCount,
      blob,
    };
  } catch (error) {
    if (options.signal?.aborted) throw abortError();
    throw error;
  } finally {
    await reader.close();
  }
}

export function isMediaEntry(entry: Entry): entry is FileEntry {
  return !entry.directory && /^\d+$/u.test(entry.filename);
}
