import { entry, locale } from 'at/options';
import clsx from 'clsx';
import { memo, useEffect, useState } from 'react';

export const EnAbout = () => (
  <div className={clsx('prose prose-sm', 'dark:prose-invert')}>
    <p>Thanks for using my carefully crafted Anki template!</p>
    <ul>
      <li>
        <a href={`https://anki.ikkz.fun/templates/classic/${entry}.html`}>Docs &amp; updates</a>
      </li>
      <li>
        <a href="https://anki.ikkz.fun/sponsor" target="_blank" rel="noreferrer">
          Sponsor
        </a>{' '}
        ❤️ — support this project
      </li>
      <li>
        <a href="https://github.com/ikkz/anki-eco">Star on GitHub</a>
      </li>
      <li>
        <a href="https://github.com/ikkz/anki-eco/issues">Feedback / issues</a>
      </li>
    </ul>
  </div>
);

export const ZhAbout = () => (
  <div className={clsx('prose prose-sm', 'dark:prose-invert')}>
    <p>感谢你使用我精心打磨的 Anki 模板！</p>
    <ul>
      <li>
        <a href={`https://anki.ikkz.fun/templates/classic/${entry}.html`}>文档与更新</a>
      </li>
      <li>
        <a href="https://anki.ikkz.fun/zh/sponsor" target="_blank" rel="noreferrer">
          赞助
        </a>{' '}
        ❤️ — 支持本项目
      </li>
      <li>
        <a href="https://github.com/ikkz/anki-eco">在 GitHub 点个 Star</a>
      </li>
      <li>
        <a href="https://github.com/ikkz/anki-eco/issues">反馈 / 提交 Issue</a>
      </li>
    </ul>
  </div>
);

const AboutComponent = locale === 'zh' ? ZhAbout : EnAbout;

export const About = memo(() => {
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    if (clicks === 10) {
      const script = document.createElement('script');
      script.src = '//cdn.jsdelivr.net/npm/eruda';
      script.onload = () => {
        window.eruda?.init();
      };
      document.head.appendChild(script);
    }
  }, [clicks]);

  return (
    <div onClick={() => setClicks((prev) => prev + 1)}>
      <AboutComponent />
    </div>
  );
});

declare global {
  interface Window {
    eruda?: any;
  }
}
