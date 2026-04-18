import { tw } from '@/styles/tw';
import clsx from 'clsx';
import { FC, ReactNode, useId } from 'react';
import { doNothing } from 'remeda';

export const Checkbox: FC<{
  onChange?: (checked: boolean) => void;
  checked?: boolean;
  className?: string;
  title: string;
  subtitle?: ReactNode;
  disabled?: boolean;
  'data-testid'?: string;
}> = ({ onChange, className, checked, title, subtitle, disabled, ...props }) => {
  const id = useId();
  return (
    <div className={clsx('relative flex gap-x-3', className)} data-testid={props['data-testid']}>
      <div className="flex h-6 items-center">
        <input
          id={id}
          type="checkbox"
          className={clsx(
            'h-4 w-4 rounded text-indigo-500 focus:ring-0 disabled:bg-gray-200',
            tw.borderColor,
            'dark:bg-neutral-600',
          )}
          checked={checked}
          onChange={disabled ? doNothing : (e) => onChange?.(Boolean(e.target.checked))}
          disabled={disabled}
        />
      </div>
      <div className="text-sm leading-6">
        <label htmlFor={id} className={clsx('font-medium text-gray-900', 'dark:text-white')}>
          {title}
        </label>
        <p className={clsx('text-gray-500', 'dark:text-gray-400')}>{subtitle}</p>
      </div>
    </div>
  );
};
