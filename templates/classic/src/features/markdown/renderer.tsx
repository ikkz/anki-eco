import pluginBreaks from '@bytemd/plugin-breaks';
import pluginGfm from '@bytemd/plugin-gfm';
import pluginMath from '@bytemd/plugin-math';
import pluginZoom from '@bytemd/plugin-medium-zoom';
import pluginMermaid from '@bytemd/plugin-mermaid';
import { useCreation, useExternal } from 'ahooks';
import { locale } from 'at/options';
import { getProcessor } from 'bytemd';
import clsx from 'clsx';
import mergeRefs from 'merge-refs';
import { FC, memo, RefObject, useEffect, useMemo, useRef } from 'react';

export const Markdown: FC<{
  value: string;
  id?: string;
  className?: string;
  domRef?: RefObject<HTMLDivElement>;
}> = memo(({ value, className, id, domRef }) => {
  const ref = useRef<HTMLDivElement>(null);
  const plugins = useCreation(
    () => [
      pluginBreaks(),
      pluginGfm(),
      pluginMath({
        katexOptions: { output: 'html' },
      }),
      pluginZoom(),
      pluginMermaid(),
    ],
    [],
  );
  const processer = useCreation(() => {
    return getProcessor({
      plugins,
    });
  }, [plugins]);
  const file = useMemo(() => {
    try {
      return processer.processSync(value);
    } catch (error) {
      console.log(error);
      return;
    }
  }, [value, processer]);

  useEffect(() => {
    const markdownBody = ref.current;
    if (!markdownBody || !file) return;

    const cbs = plugins?.map(({ viewerEffect }) => viewerEffect?.({ markdownBody, file }));
    return () => {
      cbs?.forEach((cb) => cb && cb());
    };
  }, [file, plugins]);

  useExternal(
    locale === 'zh'
      ? 'https://cdn.bootcdn.net/ajax/libs/KaTeX/0.16.9/katex.min.css'
      : 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
    {
      type: 'css',
    },
  );

  return (
    <div
      ref={mergeRefs(ref, domRef)}
      className={clsx('markdown-body', className)}
      id={id}
      dangerouslySetInnerHTML={{ __html: file?.toString() || '' }}
    />
  );
});
