/** @returns {import('vite').Plugin} */
export const injectFields = (/** @type import('../index.d.ts').Props */ props) => {
  let config;

  return {
    name: '@anki-eco/injectFields',
    configResolved(resolved) {
      config = resolved;
    },
    async transformIndexHtml() {
      const { consts } = await import('@anki-eco/shared');
      const devFields = props.notes[0]?.fields;
      if (!devFields) {
        throw new Error('requires at least one note');
      }
      return [
        {
          injectTo: 'body-prepend',

          tag: 'div',
          attrs: {
            style: 'display: none',
            id: consts.fieldContainerId,
          },
          children: props.fields.map((name) => ({
            tag: 'div',
            attrs: {
              [consts.fieldNameAttr]: name,
            },
            children: config?.command === 'build' ? `{{${name}}}` : devFields[name] || name,
          })),
        },
      ];
    },
  };
};
