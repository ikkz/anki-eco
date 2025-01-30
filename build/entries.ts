import type { BuildConfig } from './config';

export interface Note<F extends string> {
  config: Partial<BuildConfig>;
  fields: Partial<Record<F, string>>;
}

interface Entry<F extends readonly string[]> {
  fields: F;
  notes: Note<F[number]>[];
}

function defineEntry<F extends readonly string[]>(
  entry: Entry<readonly [...F]>,
) {
  return entry;
}

const mdQuestion =
  "## Markdown Basic Syntax<br><br>I just love **bold text**. Italicized text is the _cat's meow_. At the command prompt, type `nano`.<br><br>My favorite markdown editor is [ByteMD](https://github.com/bytedance/bytemd).<br><br>1. First item<br>2. Second item<br>3. Third item<br><br>&gt; Dorothy followed her through many of the beautiful rooms in her castle.<br><br>```js<br>import gfm from '@bytemd/plugin-gfm'<br>import { Editor, Viewer } from 'bytemd'<br><br>const plugins = [<br>&nbsp; gfm(),<br>&nbsp; // Add more plugins here<br>]<br><br>const editor = new Editor({<br>&nbsp; target: document.body, // DOM to render<br>&nbsp; props: {<br>&nbsp;&nbsp;&nbsp; value: '',<br>&nbsp;&nbsp;&nbsp; plugins,<br>&nbsp; },<br>})<br><br>editor.on('change', (e) =&gt; {<br>&nbsp; editor.$set({ value: e.detail.value })<br>})<br>```<br><br>## GFM Extended Syntax<br><br>Automatic URL Linking: <a href=\"https://github.com/bytedance/bytemd\">https://github.com/bytedance/bytemd</a><br><br>~~The world is flat.~~ We now know that the world is round.<br><br>- [x] Write the press release<br>- [ ] Update the website<br>- [ ] Contact the media<br><br>| Syntax&nbsp;&nbsp;&nbsp; | Description |<br>| --------- | ----------- |<br>| Header&nbsp;&nbsp;&nbsp; | Title&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |<br>| Paragraph | Text&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |<br><br>## Math Equation<br><br>Inline math equation: $a+b$<br><br>$$<br>\\displaystyle \\left( \\sum_{k=1}^n a_k b_k \\right)^2 \\leq \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right)<br>$$<br><br>## Mermaid Diagrams<br><br>```mermaid<br><div>mindmap<br>&nbsp; root((mindmap))<br>&nbsp;&nbsp;&nbsp; Origins<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Long history<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ::icon(fa fa-book)<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Popularisation<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; British popular psychology author Tony Buzan<br>&nbsp;&nbsp;&nbsp; Research<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; On effectiveness&lt;br/&gt;and features<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; On Automatic creation<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Uses<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Creative techniques<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Strategic planning<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Argument mapping<br>&nbsp;&nbsp;&nbsp; Tools<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Pen and paper<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Mermaid<br><br></div>```";

const mcq = defineEntry({
  fields: [
    'question',
    'optionA',
    'optionB',
    'optionC',
    'optionD',
    'optionE',
    'optionF',
    'answer',
    'note',
    'noteA',
    'noteB',
    'noteC',
    'noteD',
    'noteE',
    'noteF',
    'Tags',
  ],
  notes: [
    {
      config: {
        field: 'native',
      },
      fields: {
        question:
          'This is the stem of the question. It supports various content formats in Anki, including bold, formulas, etc.',
        optionA: 'This is the content of the question options.',
        optionB: 'Options that are not filled in will not be displayed.',
        optionC: 'And various formats are also supported.',
        answer: 'AC',
        note: 'Above is the answer to the question. For multiple-choice questions, please write the uppercase letter of the correct answer, for example, A. For multiple-choice questions, write all the correct answer letters, such as ABC.',
        noteA: 'Note for optionA',
        noteC: 'Note for optionC',
      },
    },
    {
      config: {
        field: 'markdown',
      },
      fields: {
        question: mdQuestion,
        optionA: 'This is the content of the question options.',
        optionB: 'Options that are not filled in will not be displayed.',
        optionC: 'And various formats are also supported.',
        answer: 'AC',
        note: 'Above is the answer to the question. For multiple-choice questions, please write the uppercase letter of the correct answer, for example, A. For multiple-choice questions, write all the correct answer letters, such as ABC.',
        noteA: 'Note for optionA',
        noteC: 'Note for optionC',
      },
    },
  ],
});

const mcq_10 = defineEntry({
  fields: [
    'question',
    'optionA',
    'optionB',
    'optionC',
    'optionD',
    'optionE',
    'optionF',
    'optionG',
    'optionH',
    'optionI',
    'optionJ',
    'answer',
    'note',
    'noteA',
    'noteB',
    'noteC',
    'noteD',
    'noteE',
    'noteF',
    'noteG',
    'noteH',
    'noteI',
    'noteJ',
    'Tags',
  ],
  notes: mcq.notes,
});

const entries = {
  mcq,
  mcq_10,
  basic: defineEntry({
    fields: ['question', 'answer', 'note', 'Tags'],
    notes: [
      {
        config: {
          field: 'native',
        },
        fields: {
          question:
            'This is the stem of the question. It supports various content formats in Anki, including bold, formulas, etc.',
          answer: 'This is answer',
          note: 'Above is the answer to the question.',
        },
      },
      {
        config: {
          field: 'markdown',
        },
        fields: {
          question: mdQuestion,
          answer: 'This is answer',
          note: 'Above is the answer to the question.',
        },
      },
    ],
  }),
  tf: defineEntry({
    fields: ['question', 'items', 'note', 'Tags'],
    notes: [
      {
        config: {
          field: 'native',
        },
        fields: {
          question:
            'This is the stem of the question. It supports various content formats in Anki, including bold, formulas, etc.',
          items:
            'T===<br>All sub-questions should meet the format constriant<br><br>T===<br>Each sub-question must begin with a line "T===" or "F===", indicating whether the sub-question is true or false<br><br>T===<br>Pay special attention to ensuring "T/F" is followed by three or more equal signs',
          note: 'note',
        },
      },
      {
        config: {
          field: 'markdown',
        },
        fields: {
          question: mdQuestion,
          items:
            "T===<br>I just love **bold text**. Italicized text is the _cat's meow_. At the command prompt, type `nano`.<br><br>T===<br>| Syntax&nbsp;&nbsp;&nbsp; | Description |<br>| --------- | ----------- |<br>| Header&nbsp;&nbsp;&nbsp; | Title&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |<br>| Paragraph | Text&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |<br><br>T===<br><br>```mermaid<br>graph TD;<br>&nbsp; A--&gt;B;<br>&nbsp; A--&gt;C;<br>&nbsp; B--&gt;D;<br>&nbsp; C--&gt;D;<br>```",
          note: 'note',
        },
      },
    ],
  }),
  match: defineEntry({
    fields: ['question', 'items', 'note', 'Tags'],
    notes: [
      {
        config: {
          field: 'native',
        },
        fields: {
          question:
            'This is the stem of the question. It supports various content formats in Anki, including bold, formulas, etc.',
          items:
            'Mammals::Tiger,,Elephant<br>Birds::Penguin,,Parrot<br>Reptiles::Cobra,,Crocodile',
          note: 'note',
        },
      },
      {
        config: {
          field: 'markdown',
        },
        fields: {
          question: mdQuestion,
          items:
            'Mammals::Tiger,,Elephant<br>Birds::Penguin,,Parrot<br>Reptiles::Cobra,,Crocodile',
          note: 'note',
        },
      },
    ],
  }),
};

export { entries };
