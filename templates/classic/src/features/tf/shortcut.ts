import { crossStorage } from '@/utils/cross-storage';

export function getFirstUnansweredIndex(itemCount: number) {
  for (let i = 0; i < itemCount; i++) {
    if (typeof crossStorage.getItem(`status-${i}`, undefined) !== 'boolean') {
      return i;
    }
  }
  return -1;
}
