import {
  BlobReader,
  BlobWriter,
  TextReader,
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipReader,
  ZipWriter,
} from '@zip.js/zip.js';
import { Zstd } from '@hpcc-js/wasm-zstd';
import initSqlJs from 'sql.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { analyzeMediaBoostPackage, generateMediaBoostPackage } from './archive.js';
import { buildHelperCollection } from './collection.js';

function varint(value: number): number[] {
  const bytes: number[] = [];
  do {
    let byte = value & 0x7f;
    value >>>= 7;
    if (value) byte |= 0x80;
    bytes.push(byte);
  } while (value);
  return bytes;
}

function field(number: number, bytes: number[]): number[] {
  return [(number << 3) | 2, ...varint(bytes.length), ...bytes];
}

function mediaList(names: string[]): Uint8Array {
  const encoder = new TextEncoder();
  const bytes = names.flatMap((name) => field(1, field(1, [...encoder.encode(name)])));
  return new Uint8Array(bytes);
}

async function fixture(): Promise<File> {
  const names = ['a.jpg', 'b & c.mp3'];
  const writer = new ZipWriter(new BlobWriter('application/octet-stream'));
  await writer.add('meta', new Uint8ArrayReader(new Uint8Array([0x08, 0x03])), { level: 0 });
  await writer.add('media', new Uint8ArrayReader(zstd.compress(mediaList(names))), { level: 0 });
  await writer.add('collection.anki21b', new Uint8ArrayReader(zstd.compress(new Uint8Array([1]))), {
    level: 0,
  });
  for (const [index, name] of names.entries()) {
    await writer.add(String(index), new TextReader(`data:${name}`), { level: 0 });
  }
  return new File([await writer.close()], 'fixture.apkg');
}

async function legacyFixture(): Promise<File> {
  const writer = new ZipWriter(new BlobWriter('application/octet-stream'));
  await writer.add('meta', new Uint8ArrayReader(new Uint8Array([0x08, 0x02])), { level: 0 });
  await writer.add('media', new TextReader('{"7":"legacy.jpg"}'), { level: 0 });
  await writer.add('collection.anki21', new Uint8ArrayReader(new Uint8Array([1])), { level: 0 });
  await writer.add('7', new TextReader('legacy data'), { level: 0 });
  return new File([await writer.close()], 'legacy.apkg');
}

async function legacyV1Fixture(): Promise<File> {
  const writer = new ZipWriter(new BlobWriter('application/octet-stream'));
  await writer.add('media', new TextReader('{}'), { level: 0 });
  await writer.add('collection.anki2', new Uint8ArrayReader(new Uint8Array([1])), { level: 0 });
  return new File([await writer.close()], 'legacy-v1.apkg');
}

let zstd: Zstd;

beforeAll(async () => {
  zstd = await Zstd.load();
});

describe('media boost APKG', () => {
  it('builds and compresses the helper collection', async () => {
    const collection = await buildHelperCollection(['a.jpg'], 1);
    expect(new TextDecoder().decode(collection.subarray(0, 15))).toBe('SQLite format 3');
    const encoded = zstd.compress(collection);
    expect([...encoded.subarray(0, 4)]).toEqual([0x28, 0xb5, 0x2f, 0xfd]);
    const writer = new ZipWriter(new BlobWriter());
    await writer.add('collection.anki21b', new Uint8ArrayReader(encoded), { level: 0 });
    const reader = new ZipReader(new BlobReader(await writer.close()));
    const entry = (await reader.getEntries())[0];
    if (entry.directory) throw new Error('unexpected directory');
    expect([...(await entry.getData(new Uint8ArrayWriter())).subarray(0, 4)]).toEqual([
      0x28, 0xb5, 0x2f, 0xfd,
    ]);
  });

  it('splits large media lists into unique paused helper notes', async () => {
    const names = Array.from({ length: 20_001 }, (_, index) => `${index}.jpg`);
    const collection = await buildHelperCollection(names, 5000);
    const SQL = await initSqlJs();
    const db = new SQL.Database(collection);
    expect(db.exec('select count(*), count(distinct guid) from notes')[0].values[0]).toEqual([
      5, 5,
    ]);
    expect(
      db.exec('select count(*), count(distinct id) from cards where queue = -1')[0].values[0],
    ).toEqual([5, 5]);
    db.close();
  });

  it('analyzes and creates a helper-only latest APKG', async () => {
    const input = await fixture();
    const analysis = await analyzeMediaBoostPackage(input);
    expect(analysis).toMatchObject({ mediaCount: 2, helperNoteCount: 1, format: 'latest' });

    const result = await generateMediaBoostPackage(input, { referencesPerNote: 1 });
    expect(result).toMatchObject({ mediaCount: 2, helperNoteCount: 2 });
    expect(result.blob).toBeInstanceOf(Blob);

    const reader = new ZipReader(new BlobReader(result.blob!));
    const entries = await reader.getEntries();
    const byName = new Map(entries.map((entry) => [entry.filename, entry]));
    expect([...byName.keys()].sort()).toEqual(['0', '1', 'collection.anki21b', 'media', 'meta']);
    expect(byName.has('collection.anki2')).toBe(false);

    const collectionEntry = byName.get('collection.anki21b');
    if (!collectionEntry || collectionEntry.directory) throw new Error('missing collection');
    const encodedCollection = await collectionEntry.getData(new Uint8ArrayWriter());
    expect([...encodedCollection.subarray(0, 4)]).toEqual([0x28, 0xb5, 0x2f, 0xfd]);
    const collection = zstd.decompress(encodedCollection);
    const SQL = await initSqlJs();
    const db = new SQL.Database(collection);
    expect(db.exec('select count(*) from notes')[0].values[0][0]).toBe(2);
    expect(db.exec('select count(*) from cards where queue = -1')[0].values[0][0]).toBe(2);
    const fields = db.exec('select flds from notes order by id')[0].values.flat() as string[];
    expect(fields.join('')).toContain('a.jpg');
    expect(fields.join('')).toContain('b &amp; c.mp3');
    db.close();
    await reader.close();
  });

  it('supports cancellation', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      analyzeMediaBoostPackage(await fixture(), { signal: controller.signal }),
    ).rejects.toMatchObject({
      code: 'ABORTED',
    });
  });

  it('analyzes and creates a legacy helper APKG with non-contiguous media indexes', async () => {
    const input = await legacyFixture();
    await expect(analyzeMediaBoostPackage(input)).resolves.toMatchObject({
      mediaCount: 1,
      format: 'legacy',
    });

    const result = await generateMediaBoostPackage(input);
    const reader = new ZipReader(new BlobReader(result.blob!));
    const entries = await reader.getEntries();
    const byName = new Map(entries.map((entry) => [entry.filename, entry]));
    expect([...byName.keys()].sort()).toEqual(['7', 'collection.anki21', 'media', 'meta']);
    const collectionEntry = byName.get('collection.anki21');
    if (!collectionEntry || collectionEntry.directory) throw new Error('missing collection');
    const collection = await collectionEntry.getData(new Uint8ArrayWriter());
    expect(new TextDecoder().decode(collection.subarray(0, 15))).toBe('SQLite format 3');
    await reader.close();
  });

  it('supports legacy version 1 APKG files without meta', async () => {
    const input = await legacyV1Fixture();
    await expect(analyzeMediaBoostPackage(input)).resolves.toMatchObject({
      mediaCount: 0,
      format: 'legacy',
    });
    const result = await generateMediaBoostPackage(input);
    const reader = new ZipReader(new BlobReader(result.blob!));
    expect((await reader.getEntries()).map((entry) => entry.filename).sort()).toEqual([
      'collection.anki2',
      'media',
    ]);
    await reader.close();
  });
});
