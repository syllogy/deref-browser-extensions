import React, { ReactNode, ButtonHTMLAttributes, useState } from 'react';
import classNames from 'classnames';

const sizeClasses = {
  sm: 'py-0 px-2',
  md: 'py-1 px-3',
  lg: 'py-2 px-4',
};

type Size = keyof typeof sizeClasses;

const variantClasses = {
  default: 'rounded bg-gray-100 hover:bg-gray-700 text-black',
  primary: 'rounded bg-blue-500 hover:bg-blue-700 text-white',
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
        variantClasses[props.variant ?? 'default'],
        sizeClasses[props.size ?? 'md'],
        props.className,
      )}
    >
      {props.children}
    </button>
  );
}
