import { CardShell } from '@/components/card-shell';
import { ClozeInputField, Report } from '@/features/cloze/cloze-input-field';
import '@/styles/input.css';
import { tw } from '@/styles/tw';
import { FIELD_ID } from '@/utils/const';
import { isFieldEmpty } from '@/utils/field';
import * as t from 'at/i18n';
import { AnkiField } from 'at/virtual/field';
import clsx from 'clsx';
import { LocateFixed } from 'lucide-react';
import { useState } from 'react';

const HIGHLIGHT_CLS = 'at-cloze-highlight';

export default () => {
  const hasNote = !isFieldEmpty(FIELD_ID('note'));
  const hasAnswer = !isFieldEmpty(FIELD_ID('answer'));

  const [reports, setReports] = useState<Report[]>([]);
  const highlightCloze = (report: Report) => {
    report.nodes.forEach((el) => {
      el.classList.add(HIGHLIGHT_CLS);
    });
    setTimeout(() => {
      report.nodes.forEach((el) => {
        el.classList.remove(HIGHLIGHT_CLS);
      });
    }, 300);
  };

  return (
    <CardShell
      title={t.question}
      question={<ClozeInputField name="question" setReports={setReports} />}
      questionExtra={
        reports.length
          ? reports.map((report) => (
              <div
                key={report.datas[0].index}
                className={clsx('flex border-t py-2 mt-2', tw.borderColor)}
              >
                <div className="flex-1">
                  <div className="text-neutral-500 mb-1 text-sm">
                    #{report.datas[0].index}{' '}
                    {report.hasWholeType ? `(${t.unsupportedClozeType})` : ''}
                  </div>
                  <div className="typeAns">
                    {report.ops?.map((op, idx) => (
                      <span
                        key={idx}
                        className={clsx({
                          'bg-green-200 dark:bg-green-900/50 typeGood': op.kind === 'retain',
                          'bg-yellow-200 dark:bg-yellow-900/50 typeMissed': op.kind === 'insert',
                          'bg-red-200 dark:bg-red-900/50 line-through typeBad':
                            op.kind === 'delete',
                        })}
                      >
                        {op.content}
                      </span>
                    )) ||
                      report.value ||
                      '-'}
                  </div>
                </div>
                <div className="p-2 cursor-pointer" onClick={() => highlightCloze(report)}>
                  <LocateFixed strokeWidth="1.5px" />
                </div>
              </div>
            ))
          : null
      }
      answer={
        <>
          {hasAnswer ? <AnkiField name="answer" className={tw.prose} /> : null}
          {hasAnswer && hasNote ? <hr className={clsx('my-4', tw.borderColor)} /> : null}
          {hasNote ? <AnkiField name="note" className={clsx('prose-sm', tw.prose)} /> : null}
        </>
      }
    />
  );
};
