import { injectStyleTag, isIOSOrIPadOSSafariEngine } from './index.js';

const fullScreenGlobalStyle = `
  html {
    overflow: hidden !important;
  }

  html, body {
    margin: 0 !important;
    padding: 0 !important;
  }

  #qa {
    display: none !important;
  }
`;

export function applyFullScreenGlobalStyle(scriptSrcIncludes?: string) {
  if (!isIOSOrIPadOSSafariEngine()) {
    return undefined;
  }
  document.documentElement.scrollTop = 0;
  return injectStyleTag(fullScreenGlobalStyle, { scriptSrcIncludes });
}
