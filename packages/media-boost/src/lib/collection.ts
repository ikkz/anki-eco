import initSqlJs from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import templateUrl from '../assets/helper-template.sqlite?url';

const NOTE_TYPE_ID = 2_147_483_001;
const DECK_ID = 2_147_483_002;
const FIELD_SEPARATOR = '\x1f';
const TAG = 'anki-eco-media-boost';
const INFO =
  'AnkiEco Media Boost helper. After the media import finishes, delete the "AnkiEco Media Boost" deck.';

const model = {
  css: '',
  did: DECK_ID,
  flds: [
    { name: 'Info', ord: 0, media: [], sticky: false, rtl: false, font: 'Arial', size: 20 },
    {
      name: 'MediaReferences',
      ord: 1,
      media: [],
      sticky: false,
      rtl: false,
      font: 'Arial',
      size: 20,
    },
  ],
  id: String(NOTE_TYPE_ID),
  latexPost: '\\end{document}',
  latexPre: '\\documentclass[12pt]{article}\\begin{document}',
  latexsvg: false,
  mod: 0,
  name: 'AnkiEco Media Boost Helper',
  req: [[0, 'all', [0]]],
  sortf: 0,
  tags: [],
  tmpls: [
    {
      name: 'Helper',
      qfmt: '{{Info}}',
      afmt: '{{FrontSide}}',
      ord: 0,
      bafmt: '',
      bqfmt: '',
      bfont: '',
      bsize: 0,
      did: null,
    },
  ],
  type: 0,
  usn: -1,
  vers: [],
};

const deck = {
  collapsed: false,
  conf: 1,
  desc: 'Temporary helper deck created by AnkiEco Media Boost.',
  dyn: 0,
  extendNew: 0,
  extendRev: 0,
  id: DECK_ID,
  lrnToday: [0, 0],
  mod: 0,
  name: 'AnkiEco Media Boost',
  newToday: [0, 0],
  revToday: [0, 0],
  timeToday: [0, 0],
  usn: -1,
};

export function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function buildReferenceField(names: readonly string[]): string {
  return names.map((name) => `<img src="${escapeHtmlAttribute(name)}">`).join('');
}

function runningInNode(): boolean {
  return typeof process !== 'undefined' && Boolean(process.versions?.node);
}

function nodeAssetPath(url: string): string {
  if (url.startsWith('/@fs/')) return url.slice('/@fs'.length);
  if (url.startsWith('/')) return `${process.cwd()}${url}`;
  return url;
}

async function loadAsset(url: string): Promise<Uint8Array> {
  if (runningInNode()) {
    const moduleName = 'node:fs/promises';
    const { readFile } = await import(moduleName);
    return readFile(nodeAssetPath(url));
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to load asset: ${url}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function fieldChecksum(value: string): Promise<number> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(value));
  return new DataView(digest).getUint32(0);
}

export async function buildHelperCollection(
  mediaNames: readonly string[],
  referencesPerNote: number,
  signal?: AbortSignal,
): Promise<Uint8Array> {
  const [template, SQL] = await Promise.all([
    loadAsset(templateUrl),
    initSqlJs({ locateFile: () => (runningInNode() ? nodeAssetPath(sqlWasmUrl) : sqlWasmUrl) }),
  ]);

  const db = new SQL.Database(template);
  const nowSecs = Math.floor(Date.now() / 1000);
  const baseId = Date.now();
  model.mod = nowSecs;
  deck.mod = nowSecs;

  db.run('update col set models = ?, decks = ?, mod = ?, scm = ?', [
    JSON.stringify({ [NOTE_TYPE_ID]: model }),
    JSON.stringify({ 1: { ...deck, id: 1, name: 'Default' }, [DECK_ID]: deck }),
    Date.now(),
    Date.now(),
  ]);

  const addNote = db.prepare('insert into notes values (?, ?, ?, ?, -1, ?, ?, ?, ?, 0, "")');
  const addCard = db.prepare(
    'insert into cards values (?, ?, ?, 0, ?, -1, 0, -1, ?, 0, 0, 0, 0, 0, 0, 0, 0, "")',
  );

  try {
    for (
      let offset = 0, index = 0;
      offset < mediaNames.length;
      offset += referencesPerNote, index++
    ) {
      signal?.throwIfAborted();
      const noteId = baseId + index * 2;
      const cardId = noteId + 1;
      const references = buildReferenceField(mediaNames.slice(offset, offset + referencesPerNote));
      addNote.run([
        noteId,
        crypto.randomUUID(),
        NOTE_TYPE_ID,
        nowSecs,
        ` ${TAG} `,
        `${INFO}${FIELD_SEPARATOR}${references}`,
        INFO,
        await fieldChecksum(INFO),
      ]);
      addCard.run([cardId, noteId, DECK_ID, nowSecs, index + 1]);
    }
  } finally {
    addNote.free();
    addCard.free();
  }

  // sql.js returns a view into WASM memory that is invalidated on close.
  const bytes = new Uint8Array(db.export());
  db.close();
  return bytes;
}
