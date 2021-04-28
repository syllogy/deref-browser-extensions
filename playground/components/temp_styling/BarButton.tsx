import React from 'react';

interface BarButtonProps {
  children?: React.ReactNode;
  size: BarSize;
}
type BarSize = 'mini' | 'compact' | 'comfortable';

export default function BarButton({ children, size }: BarButtonProps) {
  return (
    <div
      className={`flex ${
        size === 'comfortable' && 'flex-grow'
      } items-center px-4 h-full hover:bg-gray-100 active:bg-gray-200 cursor-pointer font-medium`}
    >
      {children}
    </div>
  );
}
