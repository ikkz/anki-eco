import { useCloze } from './use-cloze';
import { AnkiField, type FieldProps } from '@/components/field';
import { FC, useRef } from 'react';

export const ClozeField: FC<FieldProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  useCloze(ref);
  return <AnkiField domRef={ref} {...props} />;
};
