import './cloze-input.css';
import {
  CLOZE_CLASS,
  ClozeUnitData,
  domToCloze,
  getClozeData,
  getClozeNodes,
} from './dom-to-cloze';
import type { FieldProps } from '@/components/native-field';
import { useBack } from '@/hooks/use-back';
import { caseSensitiveAtom, instantFeedbackAtom } from '@/store/settings';
import { flipToBack } from '@/utils/bridge';
import { IS_DEV } from '@/utils/const';
import { crossStorage } from '@/utils/cross-storage';
import { getEditOps, Op } from '@/utils/edit-ops';
import useLatest from 'ahooks/es/useLatest';
import { AnkiField } from 'at/virtual/field';
import { useAtomValue } from 'jotai';
import { FC, useEffect, useLayoutEffect, useRef } from 'react';

const CORRECT_CLS = 'at-input-correct';

function createInput(node: HTMLElement) {
  const input = document.createElement('input');
  input.classList.add('at-cloze-input');
  node.parentElement?.insertBefore(input, node);
}

const inputKey = (k: number) => `cloze-input-value-${k}`;

export type Report = {
  datas: ClozeUnitData[];
  nodes: Element[];
  answer: string;
  value: string;
  ops?: Op[];
  hasWholeType?: boolean;
};

export const ClozeInputField: FC<
  FieldProps & {
    setReports: (reports: Report[]) => void;
  }
> = ({ setReports, ...props }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [back] = useBack();
  const instantFeedback = useLatest(useAtomValue(instantFeedbackAtom));
  const caseSensitive = useLatest(useAtomValue(caseSensitiveAtom));

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current.style.visibility = 'hidden';
  }, []);

  const clozed = useRef(false);

  useEffect(() => {
    const { current: el } = ref;
    if (!el) {
      return;
    }
    const clozeCount = domToCloze(el);
    const clozeInfos = Array.from({
      length: IS_DEV
        ? new Set(
            Array.from(el.querySelectorAll(`.${CLOZE_CLASS}`))
              .map(getClozeData)
              .map((data) => data?.index),
          ).size
        : clozeCount,
    }).map((_, idx) => {
      const nodes = getClozeNodes(el, idx);
      const datas = nodes.map(getClozeData) as ClozeUnitData[];
      const hasWholeType = datas.some((data) => data.type === 'whole');
      const answer = datas
        .map((data) => data?.answer || '')
        .join('')
        .trim();
      return {
        datas,
        nodes,
        answer,
        hasWholeType,
      };
    });

    const compare = (a: string, b: string) =>
      caseSensitive.current ? a === b : a.toLowerCase() === b.toLowerCase();

    if (!back) {
      if (clozed.current) {
        return;
      }
      clozed.current = true;
      for (let clozeIndex = 0; clozeIndex < clozeCount; clozeIndex++) {
        crossStorage.removeItem(inputKey(clozeIndex));
        const nodes = getClozeNodes(el, clozeIndex);
        if (!nodes.length) {
          continue;
        }
        nodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            node.style.display = 'none';
          }
        });
        const firstNode = nodes[0];
        if (firstNode instanceof HTMLElement) {
          createInput(firstNode);
        }
      }

      const getClozeInfoFromEvent = (event: Event) => {
        const { target } = event;
        if (
          !(target instanceof HTMLInputElement) ||
          !target.nextSibling ||
          !(target.nextSibling instanceof Element)
        ) {
          return;
        }
        const data = getClozeData(target.nextSibling);
        if (!data) {
          return;
        }
        const info = clozeInfos[data.index];
        if (!info) {
          return;
        }

        return info;
      };

      const onInput = (event: Event) => {
        const info = getClozeInfoFromEvent(event);
        if (!info) {
          return;
        }
        const target = event.target as HTMLInputElement;
        const value = target.value || '';
        if (instantFeedback.current) {
          if (compare(value, info.answer)) {
            target.classList.add(CORRECT_CLS);
          } else {
            target.classList.remove(CORRECT_CLS);
          }
        }
        crossStorage.setItem(inputKey(info.datas[0].index), value);
      };

      const onKeyDown = (event: KeyboardEvent) => {
        const info = getClozeInfoFromEvent(event);
        if (!info) {
          return;
        }
        if (event.key !== 'Enter' || event.isComposing) {
          return;
        }
        if (info.datas[0].index !== clozeCount - 1) {
          return;
        }

        flipToBack();
      };

      el.addEventListener('input', onInput, true);
      el.addEventListener('keydown', onKeyDown, true);

      return () => {
        for (let clozeIndex = 0; clozeIndex < clozeCount; clozeIndex++) {
          const nodes = getClozeNodes(el, clozeIndex);
          if (!nodes.length) {
            continue;
          }
          nodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              node.style.display = 'unset';
            }
          });
          const firstNode = nodes[0];
          if (
            firstNode instanceof HTMLElement &&
            firstNode.previousSibling instanceof HTMLInputElement
          ) {
            firstNode.previousSibling.remove();
          }
        }
        el.removeEventListener('input', onInput, true);
        el.removeEventListener('keydown', onKeyDown, true);
      };
    } else {
      const reports: Report[] = clozeInfos.map((info, idx) => {
        const value = (crossStorage.getItem(inputKey(idx), '') as string).trim();
        return {
          ...info,
          value,
          ops: info.hasWholeType ? undefined : getEditOps(value, info.answer, compare),
        };
      });
      setReports(reports);
    }

    return;
  }, [back]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current.style.visibility = 'visible';
  }, [back]);

  return <AnkiField domRef={ref} {...props} />;
};
