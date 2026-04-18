import { render, h } from 'preact';
import { App } from './app.js';
import { ensureContainer } from '@anki-eco/shared';

const CONTAINER_ID = 'anki-eco-dev-ui-container';

const container = ensureContainer(CONTAINER_ID);
render(h(App, {}), container);
