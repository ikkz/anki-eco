import { crossStorage } from '@/utils/cross-storage';

export function getFirstUnansweredIndex(itemOrder: number[]) {
  for (const index of itemOrder) {
    if (typeof crossStorage.getItem(`status-${index}`, undefined) !== 'boolean') {
      return index;
    }
  }
  return -1;
}
