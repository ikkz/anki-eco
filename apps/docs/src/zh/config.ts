import { defineAdditionalConfig } from 'vitepress';

export default defineAdditionalConfig({
  themeConfig: {
    nav: [
      { text: '首页', link: '/zh/' },
      {
        text: '模板',
        items: [
          { text: '概览', link: '/zh/templates/classic/' },
          { text: '多项选择', link: '/zh/templates/classic/mcq' },
          { text: '匹配', link: '/zh/templates/classic/match' },
          { text: '基础问答', link: '/zh/templates/classic/basic' },
          { text: '填空', link: '/zh/templates/classic/cloze' },
          { text: '正误题', link: '/zh/templates/classic/tf' },
          { text: '项目排序', link: '/zh/templates/classic/item-ordering' },
          { text: '排序', link: '/zh/templates/classic/ordering' },
          { text: '输入题', link: '/zh/templates/classic/input' },
        ],
      },
      {
        text: '插件',
        items: [
          {
            text: '概览',
            link: '/zh/extension/',
          },
          {
            text: 'ImageViewer',
            link: '/zh/extension/image-viewer',
          },
          {
            text: 'XMarkdown',
            link: '/zh/extension/xmarkdown',
          },
          {
            text: 'StyleKit',
            link: '/zh/extension/style-kit',
          },
          {
            text: 'CardMotion',
            link: '/zh/extension/card-motion',
          },
          {
            text: 'Tldraw',
            link: '/zh/extension/tldraw',
          },
        ],
      },
      { text: '开发指南', link: '/zh/guide/quick-start' },
      {
        text: '赞助',
        link: '/zh/sponsor',
      },
    ],
    sidebar: {
      '/zh/guide/': [
        {
          text: 'Vite 插件',
          items: [
            {
              text: '快速开始',
              link: '/zh/guide/quick-start',
            },
            {
              text: '开发指南',
              link: '/zh/guide/kit',
            },
          ],
        },
        {
          text: '其他工具',
          items: [
            {
              text: '打包器',
              link: '/zh/guide/packager',
            },
          ],
        },
      ],
      '/zh/templates/classic/': [
        {
          text: 'Classic 模板',
          items: [
            { text: '概览', link: '/zh/templates/classic/' },
            { text: '多项选择', link: '/zh/templates/classic/mcq' },
            { text: '匹配', link: '/zh/templates/classic/match' },
            { text: '基础问答', link: '/zh/templates/classic/basic' },
            { text: '填空', link: '/zh/templates/classic/cloze' },
            { text: '正误题', link: '/zh/templates/classic/tf' },
            { text: '项目排序', link: '/zh/templates/classic/item-ordering' },
            { text: '排序', link: '/zh/templates/classic/ordering' },
            { text: '输入题', link: '/zh/templates/classic/input' },
          ],
        },
      ],
    },
  },
});
