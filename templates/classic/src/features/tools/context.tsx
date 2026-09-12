import { useTextSelection } from '@/hooks/use-text-selection';
import { toolsAtom } from '@/store/tools';
import { tw } from '@/styles/tw';
import { getUrl } from '@/utils/tool';
import useThrottle from 'ahooks/es/useThrottle';
import clsx from 'clsx';
import { useAtomValue } from 'jotai/react';
import { FC, PropsWithChildren, useMemo, useRef } from 'react';

export const ToolsContext: FC<PropsWithChildren & { enabled?: boolean }> = ({
  children,
  enabled,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { clientRect, textContent } = useTextSelection(ref);
  const throttledRect = useThrottle(clientRect, { wait: 60 });
  const text = textContent?.trim();
  const tools = useAtomValue(toolsAtom);

  const toolsPopover = useMemo(() => {
    if (!throttledRect || !text || !enabled) {
      return null;
    }
    const { top, left, height } = throttledRect;
    return (
      <div
        className="pointer-events-none absolute flex items-center transition-all"
        style={{
          top: `${top + height + 10}px`,
          left: `${left}px`,
          zIndex: 999,
        }}
      >
        <div
          className={clsx(
            'pointer-events-auto mx-auto flex flex-col rounded-md border bg-white dark:bg-neutral-600 p-1 shadow-xl text-sm',
            tw.borderColor,
          )}
        >
          {tools.map((tool) => (
            <a
              key={tool.id}
              className="block p-2"
              href={getUrl(tool, text)}
              target="_blank"
              rel="noreferrer"
            >
              {tool.name}
            </a>
          ))}
        </div>
      </div>
    );
  }, [throttledRect, text, tools, enabled]);

  return (
    <div className="relative" ref={ref}>
      {children}
      {toolsPopover}
    </div>
  );
};
