import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { flushSync } from 'react-dom';
import App from './app';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

flushSync(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
