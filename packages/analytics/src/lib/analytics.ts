export function sendEvent(
  domain: string,
  pathname: string,
  name: 'pageview' | string,
  props?: Record<string, any>,
) {
  return fetch('https://pla.ikkz.fun/api/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      domain,
      name,
      url: `ae://localhost${pathname}`,
      props,
    }),
  }).catch(() => {
    // do nothing
  });
}
