import { version } from '../../package.json';
import { locale } from 'at/options';
import clsx from 'clsx';

export const EnAbout = () => (
  <div className={clsx('prose prose-sm', 'dark:prose-invert')}>
    <p>
      Thank you for using my carefully crafted Anki template! The best way to
      support me is giving me a star at{' '}
      <a href="https://github.com/ikkz/anki-template">github</a>, or consider
      sponsoring me
      <a href="https://ko-fi.com/M4M212WUCI" target="_blank" rel="noreferrer">
        <img
          height="36"
          className="border-none h-9"
          src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
          alt="Buy Me a Coffee at ko-fi.com"
        />
      </a>
    </p>

    <p>
      You can find all the templates I&apos;ve created{' '}
      <a href="https://template.ikkz.fun/?from=anki">here</a>.
    </p>

    <p>
      For suggestions and feedback, please submit them{' '}
      <a href="https://github.com/ikkz/anki-template/issues">here</a>.
    </p>

    <blockquote>
      Current version: {version},{' '}
      <a href="https://template.ikkz.fun/?from=anki">check</a> update
    </blockquote>
  </div>
);

export const ZhAbout = () => (
  <div className={clsx('prose prose-sm', 'dark:prose-invert')}>
    <p>
      感谢您使用我精心制作的 Anki 模板！ 支持我的最好方式是在{' '}
      <a href="https://github.com/ikkz/anki-template">github</a> 为我点一颗
      star，或者可以考虑在 <a href="https://afdian.com/a/leoly">这里</a> 赞助我
      ❤️
    </p>
    <p>
      您可以在 <a href="https://template.ikkz.fun/?from=anki">这里</a>{' '}
      找到我创建的所有模板
    </p>

    <p>
      对于建议和反馈，请在{' '}
      <a href="https://github.com/ikkz/anki-template/issues">这里</a> 提交
    </p>

    <blockquote>
      当前版本： {version}，{' '}
      <a href="https://template.ikkz.fun/?from=anki">检查</a>更新
    </blockquote>
  </div>
);

export const About = locale === 'zh' ? ZhAbout : EnAbout;
