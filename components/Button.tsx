import React, { ReactNode, ButtonHTMLAttributes, useState } from 'react';
import classNames from 'classnames';

const sizeClasses = {
  sm: 'py-1 px-2 text-xs',
  md: 'py-1 px-3 text-sm',
  lg: 'py-2 px-6 text-base',
};

type Size = keyof typeof sizeClasses;

const variantClasses = {
  default:
    'rounded hover:bg-gray-100 border border-b-2 border-gray-200 hover:border-gray-300 text-black',
  primary:
    'rounded bg-blue-500 hover:bg-blue-600 border border-b-2 border-blue-700 hover:border-blue-900 text-white',
};

type Variant = keyof typeof variantClasses;

interface Props
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  children: ReactNode;
  onClick: (e: React.MouseEvent<HTMLElement>) => Promise<void>;
  size?: Size;
  variant?: Variant;
}

export default function Button(props: Props) {
  const [isLoading, setLoading] = useState(false);
  const onClick = props.onClick
    ? async (event: React.MouseEvent<HTMLElement>) => {
        try {
          await props.onClick(event);
        } finally {
          setLoading(false);
        }
      }
    : undefined;

  return (
    <button
      disabled={isLoading}
      {...props}
      onClick={onClick}
      className={classNames(
        'select-none',
        variantClasses[props.variant ?? 'default'],
        sizeClasses[props.size ?? 'md'],
        props.className,
      )}
    >
      {props.children}
    </button>
  );
}
