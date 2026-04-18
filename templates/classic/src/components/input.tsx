import { tw } from '@/styles/tw';
import clsx from 'clsx';
import { FC } from 'react';

export const Input: FC<{
  type?: 'text' | 'date';
  title: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}> = ({ title, onChange, value, className, type = 'text' }) => {
  return (
    <div className={className}>
      <div
        className={clsx('block text-sm font-medium leading-6 text-neutral-900', 'dark:text-white')}
      >
        {title}
      </div>
      <input
        type={type}
        className={clsx(
          'block w-full rounded-md border px-3 py-2 text-center text-neutral-900 shadow-sm outline-none placeholder:text-neutral-400',
          'dark:bg-neutral-800 dark:text-white',
          tw.borderColor,
        )}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
};
