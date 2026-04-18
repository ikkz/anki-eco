import { entry, locale } from 'at/options';
import clsx from 'clsx';
import { memo, useEffect, useState } from 'react';

export const EnAbout = () => (
  <div className={clsx('prose prose-sm', 'dark:prose-invert')}>
    <p>
      Docs & updates for this template:{' '}
      <a href={`https://anki.ikkz.fun/templates/classic/${entry}.html`}>
        View docs/updates
      </a>
    </p>
    <p>
      Thanks for using my carefully crafted Anki template! The best way to
      support my work is to star it on{' '}
      <a href="https://github.com/ikkz/anki-eco">GitHub</a>, or consider
      sponsoring me via{' '}
      <a
        href="https://github.com/sponsors/ikkz"
        target="_blank"
        rel="noreferrer"
      >
        GitHub Sponsors
      </a>
      .
    </p>

    <p>
      Explore all my templates <a href="https://anki.ikkz.fun/">here</a>.
    </p>

    <p>
      Have suggestions or feedback? Open an issue{' '}
      <a href="https://github.com/ikkz/anki-eco/issues">here</a>.
    </p>
  </div>
);

export const ZhAbout = () => (
  <div className={clsx('prose prose-sm', 'dark:prose-invert')}>
    <p>
      本模板的文档与更新：{' '}
      <a href={`https://anki.ikkz.fun/templates/classic/${entry}.html`}>
        点击此处
      </a>
    </p>
    <p>
      感谢你使用我精心打磨的 Anki 模板！支持我的最佳方式是在{' '}
      <a href="https://github.com/ikkz/anki-eco">GitHub</a> 点个 Star，或在{' '}
      <a
        href="https://github.com/sponsors/ikkz"
        target="_blank"
        rel="noreferrer"
      >
        GitHub Sponsors
      </a>{' '}
      赞助我 ❤️
    </p>
    <p>
      你可以在 <a href="https://anki.ikkz.fun/">这里</a> 浏览我制作的所有模板。
    </p>

    <p>
      如果有建议或反馈，请在{' '}
      <a href="https://github.com/ikkz/anki-eco/issues">这里</a> 提交 Issue。
    </p>
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
