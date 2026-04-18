import { Block } from './block';
import { Button } from './button';
import { Dot } from './dot';
import { TimerBlock } from './timer';
import { ClozeField } from '@/features/cloze/cloze-field';
import { useBack } from '@/hooks/use-back';
import { useField } from '@/hooks/use-field';
import { Page, PageContext } from '@/hooks/use-page';
import { DEFAULT_PAGES } from '@/pages';
import { biggerTextAtom, noScrollAtom } from '@/store/settings';
import { IS_DEV } from '@/utils/const';
import * as t from 'at/i18n';
import { entry, locale } from 'at/options';
import clsx from 'clsx';
import { useAtomValue } from 'jotai';
import { FC, ReactNode, useState } from 'react';

interface Props {
  header?: ReactNode;
  title: ReactNode;
  question?: ReactNode;
  questionExtra?: ReactNode;
  answerTitle?: string;
  answer?: ReactNode;
}

export const CardShell: FC<Props> = ({
  header,
  title,
  question,
  questionExtra,
  answerTitle = t.answer,
  answer,
}) => {
  const prefBiggerText = useAtomValue(biggerTextAtom);
  const prefNoScroll = useAtomValue(noScrollAtom);
  const [back, setBack] = useBack();

  const tags = useField('Tags')?.split(' ');

  const [page, setPage] = useState(Page.Index);
  const PageComponent = DEFAULT_PAGES[page];

  return (
    <div
      className={clsx(
        'tappable m-auto py-7 font-sans text-base',
        'w-full max-w-2xl lg:max-w-3xl',
        `locale-${locale}`,
      )}
      data-at-entry={entry}
    >
      {header}
      <PageContext.Provider value={{ page, setPage }}>
        {PageComponent ? <PageComponent /> : null}
        <div className={page !== Page.Index ? 'hidden' : 'block'}>
          <Block
            name={
              <span>
                {title}
                {tags?.length ? (
                  <>
                    <Dot />
                    <span data-testid="tags">{tags.join(' / ')}</span>
                  </>
                ) : null}
              </span>
            }
            action={
              <Button onClick={() => setPage(Page.Settings)} data-testid="index:setting">
                {t.templateSetting}
              </Button>
            }
            className="relative"
            enableTools
          >
            {question ? (
              question
            ) : (
              <ClozeField name="question" className={clsx(prefBiggerText ? 'prose-xl' : '')} />
            )}
            {questionExtra}
          </Block>
          {back && answer ? (
            <Block name={answerTitle} id={prefNoScroll ? undefined : 'answer'} enableTools>
              {answer}
            </Block>
          ) : null}
          <TimerBlock />
        </div>
      </PageContext.Provider>
      {IS_DEV ? (
        <button className="fixed top-1 left-1" onClick={() => setBack(true)}>
          Back
        </button>
      ) : null}
    </div>
  );
};
