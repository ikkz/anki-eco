import { sendEvent } from '@anki-eco/analytics';

export function track(pathname: string, event: string, props?: Record<string, any>) {
  return sendEvent('anki-eco-ext', pathname, event, props);
}

export function pv(pathname: string) {
  return track(pathname, 'pageview');
}
