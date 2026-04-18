import { atomWithGlobalStorage } from '@/utils/storage';
import * as t from 'at/i18n';
import { locale } from 'at/options';

export interface Tool {
  id: string;
  name?: string;
  prefixText?: string;
  suffixText?: string;
  url?: string;
}

export const DEFAULT_TOOLS: Tool[] = [
  {
    id: 'search',
    name: t.search,
    url: locale === 'zh' ? 'https://www.baidu.com/#wd={q}' : 'https://www.google.com/search?q={q}',
  },
  {
    id: 'translate',
    name: t.translate,
    url:
      locale === 'zh'
        ? 'https://fanyi.baidu.com/#en/zh/{q}'
        : 'https://translate.google.com/?sl=auto&text={q}&op=translate',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    prefixText: t.explainFollowing,
    url: 'https://chatgpt.com/?q={q}',
  },
];

export const toolsAtom = atomWithGlobalStorage('tools', DEFAULT_TOOLS);
