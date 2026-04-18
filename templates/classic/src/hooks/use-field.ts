import { FIELD_ID } from '@/utils/const';
import useCreation from 'ahooks/es/useCreation';

export const useField = (field: string): string | null =>
  useCreation(() => document.getElementById(FIELD_ID(field))?.innerText || null, [field]);
