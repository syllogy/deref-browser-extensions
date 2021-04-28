import React from 'react';

interface BarProps {
  size: BarSize;
  children?: React.ReactNode[];
}

type BarSize = 'mini' | 'compact' | 'comfortable';

export default function Bar({ size, children }: BarProps) {
  const height = {
    mini: 40,
    compact: 40,
    comfortable: 48,
  };

  return (
    <div
      style={{ height: height[size] }}
      className={`${
        size === 'comfortable' ? 'flex' : 'inline-flex'
      } flex-nowrap items-center border border-gray-300 rounded-md shadow-md border-3d overflow-hidden select-none`}
    >
      {children?.map((item, i) => {
        return (
          <>
            {i !== 0 && <BarDivider />}
            {item}
          </>
        );
      })}
    </div>
  );
}

function BarDivider() {
  return <div className="w-px h-full bg-gray-300" />;
}
