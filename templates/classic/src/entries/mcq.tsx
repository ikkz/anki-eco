import { CardShell } from '@/components/card-shell';
import { useBack } from '@/hooks/use-back';
import { useCrossState } from '@/hooks/use-cross-state';
import {
  biggerTextAtom,
  blurOptionsAtom,
  hideMcqAnswerAtom,
  hideQuestionTypeAtom,
  keepRandomOrderOnBackAtom,
  randomOptionsAtom,
} from '@/store/settings';
import '@/styles/mcq.css';
import { flipToBack } from '@/utils/bridge';
import { FIELD_ID } from '@/utils/const';
import { getFieldText, isFieldEmpty } from '@/utils/field';
import { useAutoAnimate } from '@formkit/auto-animate/preact';
import useCreation from 'ahooks/es/useCreation';
import useKeyPress from 'ahooks/es/useKeyPress';
import useLatest from 'ahooks/es/useLatest';
import useMemoizedFn from 'ahooks/es/useMemoizedFn';
import useSelections from 'ahooks/es/useSelections';
import * as t from 'at/i18n';
import { locale } from 'at/options';
import { fields } from 'at/options';
import { AnkiField } from 'at/virtual/field';
import clsx from 'clsx';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { doNothing, shuffle } from 'remeda';

const ANSWER_TYPE_MAP = {
  missedAnswer: t.missedAnswer,
  correctAnswer: t.correctAnswer,
  wrongAnswer: t.wrongAnswer,
};

const fieldToAlpha = (field: string) => field.slice(field.length - 1);

const MAX_KEYBOARD_OPTIONS = 9;

export default () => {
  const prefRandomOptions = useAtomValue(randomOptionsAtom);
  const prefKeepRandomOrderOnBack = useAtomValue(keepRandomOrderOnBackAtom);
  const prefKeepRandomOrderOnBackLatest = useLatest(prefKeepRandomOrderOnBack);
  const prefBiggerText = useAtomValue(biggerTextAtom);
  const prefHideQuestionType = useAtomValue(hideQuestionTypeAtom);

  const answers = useCreation(
    () => (getFieldText('answer') || '').split('').map((c) => `option${c}`),
    [],
  );
  const [originOptions, shuffledOptions, notedOptions] = useCreation(() => {
    const options = fields.filter(
      (name) => name.startsWith('option') && !isFieldEmpty(FIELD_ID(name)),
    );
    const notedOptions = options.filter(
      (name) => !isFieldEmpty(FIELD_ID(`note${name.slice('option'.length)}`)),
    );

    return [options, shuffle(options), notedOptions] as const;
  }, []);
  const [options, setOptions] = useCrossState(
    'options-array',
    prefRandomOptions ? shuffledOptions : originOptions,
  );

  const [storedSelections, setStoredSelections] = useCrossState<string[]>(
    'selected',
    [],
  );
  const { isSelected, toggle, selected, setSelected } = useSelections(
    options,
    storedSelections,
  );
  useEffect(() => {
    setStoredSelections(selected);
  }, [selected]);

  const [back] = useBack();

  const onClick = useMemoizedFn((name: string) => {
    if (back) {
      return;
    }

    if (isMultipleChoice || prefHideQuestionType) {
      toggle(name);
    } else {
      setSelected([name]);
      setTimeout(flipToBack, 300);
    }
  });

  // Add keyboard shortcuts for options (Ctrl+1/2/3... for A/B/C...)
  useKeyPress(
    Array.from({ length: MAX_KEYBOARD_OPTIONS }, (_, i) => `ctrl.${i + 1}`),
    (event, key) => {
      // Don't handle shortcuts on the answer side
      if (back) {
        return;
      }

      event.preventDefault();
      // Extract the numeric part from the key (e.g., 'ctrl.1' -> 1)
      const keyStr = typeof key === 'string' ? key : String(key);
      const parts = keyStr.split('.');
      const numericPart = parts.length > 1 ? parts[parts.length - 1] : parts[0];
      const numericValue = parseInt(numericPart, 10);

      if (!isNaN(numericValue)) {
        const index = numericValue - 1;
        if (index >= 0 && index < options.length) {
          onClick(options[index]);
        }
      }
    },
    {
      exactMatch: true,
    },
  );

  const getSelectResult = useMemoizedFn((name: string) => {
    switch (true) {
      case back && isSelected(name) && !answers.includes(name):
        return 'wrong';
      case back && isSelected(name) && answers.includes(name):
        return 'correct';
      case back && !isSelected(name) && answers.includes(name):
        return 'missed';
      default:
        return 'none';
    }
  });

  const [parent] = useAutoAnimate();
  useEffect(() => {
    if (back && !prefKeepRandomOrderOnBackLatest.current) {
      const timeout = setTimeout(() => {
        setOptions(originOptions);
      }, 600);
      return () => clearTimeout(timeout);
    }
    return doNothing;
  }, [back]);

  const hasNote = !isFieldEmpty(FIELD_ID('note'));
  const isMultipleChoice = answers.length > 1;

  const [blurred, setBlurred] = useCrossState(
    'blurred',
    useAtomValue(blurOptionsAtom),
  );

  const hideMcqAnswer = useAtomValue(hideMcqAnswerAtom);

  return (
    <CardShell
      title={
        prefHideQuestionType || !options.length ? (
          t.question
        ) : (
          <>{isMultipleChoice ? t.multipleAnswer : t.singleAnswer}</>
        )
      }
      questionExtra={
        options.length ? (
          <div
            className={clsx(
              'mt-5 space-y-3 lg:space-y-6',
              prefBiggerText ? 'prose-xl' : '',
            )}
            ref={parent}
            onClick={() => setBlurred(false)}
          >
            {options.map((name) => {
              const selectResult = getSelectResult(name);
              return (
                <div
                  key={name}
                  onClick={() => onClick(name)}
                  className={clsx(
                    'select-type-hint relative cursor-pointer transition-transform before:select-none after:select-none',
                    {
                      'active:scale-95': !back,
                      'after:absolute after:left-0 after:top-[-2px] after:block after:-translate-x-full after:rounded-l after:px-0.5 after:py-1 after:text-xs after:text-white':
                        selectResult !== 'none',
                      'after:origin-top-right after:scale-75':
                        selectResult !== 'none' &&
                        ['en', 'ja', 'pt_br'].includes(locale),
                      'before:text-red-500 after:bg-red-500':
                        selectResult === 'wrong',
                      'before:text-green-500 after:bg-green-500':
                        selectResult === 'correct',
                      'before:text-amber-500 after:bg-amber-500':
                        selectResult === 'missed',
                      [`after:content-['${
                        ANSWER_TYPE_MAP[
                          `${
                            selectResult as Exclude<typeof selectResult, 'none'>
                          }Answer`
                        ]
                      }']`]: selectResult !== 'none',
                      [clsx(
                        `before:absolute before:content-['${fieldToAlpha(
                          name,
                        )}'] before:-top-5 before:right-1 before:text-4xl before:font-extrabold before:italic before:opacity-20`,
                        'dark:before:opacity-50',
                      )]: back,
                      'before:text-indigo-500 after:hidden':
                        selectResult === 'none',
                    },
                    {
                      [`pointer-events-none blur`]: blurred,
                    },
                    'rounded-xl border-2 border-transparent bg-indigo-50 px-4 py-2 transition-colors',
                    {
                      '!border-indigo-500 !bg-indigo-50':
                        !back && isSelected(name),
                      '!border-red-500 !bg-red-50': selectResult === 'wrong',
                      '!border-green-500 !bg-green-50':
                        selectResult === 'correct',
                      '!border-amber-500 !bg-amber-50':
                        selectResult === 'missed',
                      '!rounded-tl-none': selectResult !== 'none',
                    },
                    'dark:!bg-opacity-10',
                  )}
                >
                  <AnkiField name={name} />
                  {back && notedOptions.includes(name) ? (
                    <AnkiField
                      name={`note${name.slice('option'.length)}`}
                      className="prose-sm border-t mt-2"
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null
      }
      answer={
        <>
          {options.length ? (
            hideMcqAnswer ? null : (
              <div className="text-center text-3xl font-bold italic text-opacity-50">
                <span className="align-super">
                  {selected.length ? (
                    originOptions.map((name) => {
                      const selectResult = getSelectResult(name);
                      if (!['wrong', 'correct'].includes(selectResult)) {
                        return null;
                      }
                      return (
                        <span
                          key={name}
                          className={clsx({
                            'text-red-400': selectResult === 'wrong',
                            'text-green-400': selectResult === 'correct',
                          })}
                        >
                          {fieldToAlpha(name)}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-amber-400">-</span>
                  )}
                </span>
                <span className="text-5xl text-gray-200">/</span>
                <span className="align-sub text-green-400">
                  {answers.map((name) => fieldToAlpha(name))}
                </span>
              </div>
            )
          ) : (
            <>
              <AnkiField name="answer" />
              <hr className="my-3" />
            </>
          )}
          {hasNote ? (
            <AnkiField
              name="note"
              className={clsx('prose prose-sm mt-3', 'dark:prose-invert')}
            />
          ) : null}
        </>
      }
    />
  );
};
