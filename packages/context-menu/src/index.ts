import { runEffect } from '@anki-eco/utils';
import { name as packageName } from '../package.json';

type Data = {};

runEffect<Data>(packageName, 'main', (data) => {
  return {};
});
