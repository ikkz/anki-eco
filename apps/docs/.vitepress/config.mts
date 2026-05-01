import { defineConfig } from 'vitepress';
import fs from 'node:fs/promises';
import path from 'node:path/posix';
import { loadSponsors } from './sponsors.js';

const EXT_CM_SCRIPT = await fs.readFile(
  path.join(import.meta.dirname, '../../../packages/extensions/dist/card-motion.js'),
  {
    encoding: 'utf8',
  },
);

const SPONSORS = await loadSponsors();

const EXT_CM_CSS = await fs.readFile(
  path.join(import.meta.dirname, '../../../packages/extensions/src/features/card-motion/index.css'),
  {
    encoding: 'utf8',
  },
);

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: 'src',
  title: 'Anki Eco',
  description: 'Enhance your Anki experience',
  lastUpdated: true,
  sitemap: {
    hostname: 'https://anki.ikkz.fun',
  },
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Templates',
        items: [
          { text: 'Overview', link: '/templates/classic/' },
          { text: 'Multiple Choice', link: '/templates/classic/mcq' },
          { text: 'Match', link: '/templates/classic/match' },
          { text: 'Basic', link: '/templates/classic/basic' },
          { text: 'Cloze', link: '/templates/classic/cloze' },
          {
            text: 'Multiple Choice (10 options)',
            link: '/templates/classic/mcq_10',
          },
          { text: 'True or False', link: '/templates/classic/tf' },
          { text: 'Item Ordering', link: '/templates/classic/item-ordering' },
          { text: 'Ordering', link: '/templates/classic/ordering' },
          { text: 'Input', link: '/templates/classic/input' },
          {
            text: 'Multiple Choice (26 options)',
            link: '/templates/classic/mcq_26',
          },
        ],
      },
      {
        text: 'Extension',
        items: [
          {
            text: 'Overview',
            link: '/extension/',
          },
          {
            text: 'ImageViewer',
            link: '/extension/image-viewer',
          },
          {
            text: 'XMarkdown',
            link: '/extension/xmarkdown',
          },
          {
            text: 'StyleKit',
            link: '/extension/style-kit',
          },
          {
            text: 'CardMotion',
            link: '/extension/card-motion',
          },
          {
            text: 'Tldraw',
            link: '/extension/tldraw',
          },
        ],
      },
      { text: 'Dev Guide', link: '/guide/packager' },
      {
        text: 'Sponsor',
        link: '/sponsor',
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            {
              text: 'Packager',
              link: '/guide/packager',
            },
          ],
        },
      ],
      '/templates/classic/': [
        {
          text: 'Templates',
          items: [
            { text: 'Overview', link: '/templates/classic/' },
            { text: 'Multiple Choice', link: '/templates/classic/mcq' },
            { text: 'Match', link: '/templates/classic/match' },
            { text: 'Basic', link: '/templates/classic/basic' },
            { text: 'Cloze', link: '/templates/classic/cloze' },
            {
              text: 'Multiple Choice (10 options)',
              link: '/templates/classic/mcq_10',
            },
            { text: 'True or False', link: '/templates/classic/tf' },
            { text: 'Item Ordering', link: '/templates/classic/item-ordering' },
            { text: 'Ordering', link: '/templates/classic/ordering' },
            { text: 'Input', link: '/templates/classic/input' },
            {
              text: 'Multiple Choice (26 options)',
              link: '/templates/classic/mcq_26',
            },
          ],
        },
      ],
    },
    socialLinks: [
      {
        icon: 'discord',
        link: 'https://discord.gg/wBP7H3QJ4Q',
      },
      {
        icon: 'github',
        link: 'https://github.com/ikkz/anki-eco',
      },
    ],
  },

  rewrites: {
    'en/:rest*': ':rest*',
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
    },
    zh: {
      label: '简体中文',
      lang: 'zh',
    },
  },
  cleanUrls: true,
  head: [
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        href: '/logo.png',
      },
    ],
    [
      'script',
      {
        defer: '',
        'data-domain': 'anki-eco',
        src: 'https://pla.ikkz.fun/js/script.js',
      },
    ],
  ],

  vite: {
    define: {
      EXT_CM: { css: EXT_CM_CSS, script: EXT_CM_SCRIPT },
      SPONSORS: JSON.stringify(SPONSORS),
    },
  },
});
