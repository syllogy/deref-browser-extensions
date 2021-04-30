import React from 'react';

interface Props {
  angle?: number;
}

export default function Caret({ angle }: Props) {
  return (
    <div
      style={{
        width: 1,
        height: 1,
        opacity: 0.5,
        border: '4px solid transparent',
        borderTop: '5px solid currentColor',
        marginBottom: -5,
        transform: `rotate(${angle}deg)`,
        transition: 'all 0.25s',
        transformOrigin: '50% 2.5px',
      }}
    />
  );
}
