import { Text } from 'domhandler';
import { parseDocument, DomUtils } from 'htmlparser2';

const genFrontHtml = (html) => {
  const dom = parseDocument(html);
  const body = DomUtils.getElementsByTagName('body', dom)[0];

  const headNodes = DomUtils.getElementsByTagName(
    (name) => ['script', 'style'].includes(name),
    DomUtils.getElementsByTagName('head', dom),
  );

  headNodes.reverse().forEach((node) => DomUtils.prependChild(body, node));

  const scriptNodes = DomUtils.getElementsByTagName('script', body, true);

  scriptNodes.forEach((node) => DomUtils.removeElement(node));
  scriptNodes.forEach((node) => {
    delete node.attribs['type'];
    DomUtils.prependChild(node, new Text('(function() {"use strict";'));
    DomUtils.appendChild(node, new Text('})();'));
    DomUtils.appendChild(body, node);
  });
  return DomUtils.getInnerHTML(body);
};

const prependBanner = (html) => `
<!-- @anki-eco/vite-plugin -->
${html}
`;

/** @returns {import('vite').Plugin} */
export const packager = (/** @type import('../index.d.ts').Props */ props) => {
  return {
    name: '@anki-eco/package',

    async generateBundle(_, bundle) {
      const { consts } = await import('@anki-eco/shared');
      const html = bundle['index.html']?.source;

      if (!html) {
        throw new Error('index.html not found');
      }

      this.emitFile({
        type: 'asset',
        fileName: 'build.json',
        source: JSON.stringify({
          note_type_id: props.note_type_id,
          note_type_name: props.note_type_name,
          deck_id: props.deck_id,
          deck_name: props.deck_name,
          fields: props.fields,
          notes: props.notes,
        }),
      });
      this.emitFile({
        type: 'asset',
        fileName: 'front.html',
        source: prependBanner(genFrontHtml(html)),
      });
      this.emitFile({
        type: 'asset',
        fileName: 'back.html',
        source: prependBanner(`<div id="${consts.backIndicatorId}"></div>{{FrontSide}}`),
      });
    },

    async writeBundle(options) {
      const { ankiPackage } = await import('@anki-eco/packager');
      console.log('\nStart generating apkg...');
      await ankiPackage({ cwd: options.dir, input: '.', output: '.' });
    },
    apply: 'build',
    enforce: 'post',
  };
};
