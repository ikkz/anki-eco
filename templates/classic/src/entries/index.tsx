import '@/global.css';
import store from '@/store';
import { APP_CONTAINER_ID } from '@/utils/const';
import { isBack } from '@/utils/is-back';
import { sendEvent } from '@anki-eco/analytics';
import { entry, locale, field } from 'at/options';
import { Provider } from 'jotai';
import { render } from 'preact';
import { ComponentType } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

let container: HTMLElement | null = document.getElementById(APP_CONTAINER_ID);

export const setup = (App: ComponentType) => {
  render(
    <ErrorBoundary fallbackRender={fallbackRender}>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>,
    container!,
  );
  const id = setInterval(() => {
    if (container !== document.getElementById(APP_CONTAINER_ID)!) {
      render(null, container!);
      clearInterval(id);
      container = null;
    }
  }, 500);
};
function fallbackRender({ error }: FallbackProps) {
  return (
    <div role="alert" className="p-10">
      <p>Something went wrong.</p>
      <p>
        Please open an issue at{' '}
        <a className="underline" href="https://github.com/ikkz/anki-template/issues">
          https://github.com/ikkz/anki-template/issues
        </a>{' '}
        with screenshot
      </p>
      <pre style={{ color: 'red' }}>{error?.message}</pre>
      <pre style={{ color: 'red' }}>{error?.stack}</pre>
    </div>
  );
}

if (!isBack() && !window.e2eAnki) {
  setTimeout(() => {
    sendEvent('anki-eco-classic', `/${entry}`, 'pageview', {
      locale,
      field,
    });
  }, 10);
}
