import { FIELD_ID, FIELDS_CONTAINER_ID } from '@/utils/const';
import useCreation from 'ahooks/es/useCreation';
import clsx from 'clsx';
import mergeRefs from 'merge-refs';
import { FC, memo, RefObject, useCallback, useEffect, useId } from 'react';

export interface FieldProps {
  name: string;
  className?: string;
  domRef?: RefObject<HTMLDivElement>;
}

export const NativeField: FC<FieldProps> = memo(({ name, className, domRef }) => {
  const fieldNode = useCreation(
    () => document.getElementById(FIELD_ID(name)) as HTMLDivElement | null,
    [name],
  );

  const attachNode = useCallback(
    (node: HTMLDivElement) => {
      if (fieldNode && node) {
        fieldNode.remove();
        node.appendChild(fieldNode);
      }
    },
    [fieldNode],
  );

  useEffect(() => {
    return () => {
      if (fieldNode) {
        fieldNode.remove();
        document.getElementById(FIELDS_CONTAINER_ID)?.appendChild(fieldNode);
      }
    };
  }, [fieldNode]);

  const styleId = useId();

  return (
    <div
      ref={mergeRefs(attachNode, domRef)}
      id={`anki-field-${name}`}
      className={clsx(
        'anki-field anki-native-field',
        'overflow-x-auto',
        'prose prose-neutral dark:prose-invert',
        styleId,
        className,
      )}
    />
  );
});

export default NativeField;
