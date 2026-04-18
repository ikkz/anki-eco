import { consts } from '@anki-eco/shared';

export const getFieldNode = (name: string) => {
  return document.querySelector(`div[${consts.fieldNameAttr}="${name}"]`) as HTMLDivElement | null;
};

export const cloneFieldNode = (name: string) => {
  return getFieldNode(name)?.cloneNode(true) || null;
};

export const getFieldText = (name: string) => getFieldNode(name)?.innerText?.trim() || undefined;

export const isFieldEmpty = (name: string) => {
  const node = getFieldNode(name);
  if (!node) {
    return true;
  }
  if (node.innerText?.trim()?.length) {
    return false;
  }
  return !/<(img|video)/.test(node.innerHTML);
};
