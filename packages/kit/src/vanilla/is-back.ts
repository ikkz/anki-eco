import { consts } from '@anki-eco/shared';
import { signal } from '@preact/signals-core';

export const isBack = () => Boolean(document.getElementById(consts.backIndicatorId));

export const isBackSignal = signal(isBack());

window[consts.globalSetBack] = (value: boolean) => (isBackSignal.value = value);
