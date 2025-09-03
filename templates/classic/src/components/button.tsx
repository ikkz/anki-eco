import clsx from 'clsx';
import { FC, PropsWithChildren } from 'react';

interface ButtonProps {
  status?: 'normal' | 'danger';
  onClick?: () => void;
  className?: string;
  'data-testid'?: string;
}

export const Button: FC<PropsWithChildren & ButtonProps> = ({
  status = 'normal',
  onClick,
  children,
  className,
  ...props
}) => (
  <span
    className={clsx('cursor-pointer font-bold', className, {
      'text-indigo-500': status === 'normal',
      'text-red-500': status === 'danger',
    })}
    onClick={onClick}
    data-testid={props['data-testid']}
  >
    {children}
  </span>
);
