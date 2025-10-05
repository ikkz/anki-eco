import { CardShell } from '@/components/card-shell';
import { useBack } from '@/hooks/use-back';
import { useCrossState } from '@/hooks/use-cross-state';
import { FIELD_ID } from '@/utils/const';
import { isFieldEmpty } from '@/utils/field';
import { useAutoAnimate } from '@formkit/auto-animate/preact';
import useCreation from 'ahooks/es/useCreation';
import useMemoizedFn from 'ahooks/es/useMemoizedFn';
import * as t from 'at/i18n';
import { extractItems } from 'at/virtual/extract-tf-items';
import { AnkiField } from 'at/virtual/field';
import clsx from 'clsx';
import { CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState, type ReactElement } from 'react';

interface ItemProp {
  index: number;
  node: ReactElement;
  answer: boolean;
}

const Item = ({ node, answer, index }: ItemProp) => {
  const [back] = useBack();

  const [status, setStatus] = useCrossState<boolean | undefined>(
    `status-${index}`,
    undefined,
  );

  const onStatusChange = useMemoizedFn((status: boolean) => {
    if (back) {
      return;
    }
    setStatus(status);
  });

  const [laterBack, setLaterBack] = useState(false);

  useEffect(() => {
    if (!back) {
      return;
    }
    const id = setTimeout(() => {
      setLaterBack(true);
    }, 500);
    return () => clearTimeout(id);
  }, [back, status]);

  const displayButtons = laterBack
    ? typeof status === 'boolean'
      ? [status]
      : [answer]
    : [true, false];

  const [animationRef] = useAutoAnimate({
    duration: 200,
  });

  return (
    <div
      className={clsx(
        'rounded-xl pl-4 pr-2 py-2 mt-4 flex items-center justify-between transition-colors duration-200 border-transparent border-2',
        laterBack
          ? {
              'bg-green-50 !border-green-500': status === answer,
              'bg-red-50 !border-red-500':
                typeof status !== 'undefined' && status !== answer,
              'bg-indigo-50': typeof status === 'undefined',
            }
          : 'bg-indigo-50',
        'dark:bg-opacity-10',
      )}
    >
      <div
        className={clsx(
          'prose prose-neutral dark:prose-invert rm-prose-y',
          'flex-grow mr-2',
        )}
      >
        {node}
      </div>
      <div className="relative">
        <div
          className="flex space-x-2 justify-end transition-[width] duration-500"
          ref={animationRef}
          style={{ width: laterBack ? 40 : 88, height: 40 }}
        >
          {displayButtons.map((bool) => (
            <div
              className={clsx(
                'p-2 rounded-full relative',
                {
                  'cursor-pointer transition-transform hover:scale-105 active:scale-95':
                    !back,
                },
                status === bool
                  ? 'bg-indigo-500 text-white'
                  : 'bg-indigo-100 dark:bg-neutral-700 text-gray-600 dark:text-neutral-400',
              )}
              onClick={() => onStatusChange(bool)}
              key={String(bool)}
            >
              {bool ? <CheckCircle size={24} /> : <XCircle size={24} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default () => {
  const items = useCreation(() => {
    const field = document.getElementById(FIELD_ID('items'));
    if (!field) {
      return [];
    }
    return extractItems(field).map(({ node, answer }, idx) => (
      <Item index={idx} key={idx} node={node} answer={answer} />
    ));
  }, []);

  const hasNote = !isFieldEmpty(FIELD_ID('note'));

  return (
    <CardShell
      title={t.question}
      questionExtra={<>{items}</>}
      answerTitle={t.note}
      answer={
        hasNote ? (
          <AnkiField
            name="note"
            className={clsx('prose prose-sm', 'dark:prose-invert')}
          />
        ) : null
      }
    />
  );
};
