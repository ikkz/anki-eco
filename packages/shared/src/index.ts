export const consts = {
  backIndicatorId: 'anki-eco-back-indicator',
  fieldContainerId: 'anki-eco-fields',
  fieldNameAttr: 'data-anki-eco-field',
  globalSetBack: '_ankiEcoSetCardBack',
} as const;

export interface PackagerType {
  note_type_id: number;
  note_type_name: string;
  deck_name: string;
  deck_id: number;
  fields: string[];
  notes: {
    fields: Record<string, string>;
  }[];
}

export * from './utils.js';
