import React, { useRef, useEffect } from 'react';
import { makeDerefContainer } from '~/page-handlers/utils';
import { RouteKey } from '~/components/routes';

interface Props {
  routeKey: RouteKey;
}

export default function Iframe({ routeKey }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void makeDerefContainer({
      routeKey,
      src: '../iframe-index.html',
      context: {
        user: null,
      },
      parent: containerRef.current,
    });
  }, []);

  return (
    <div>
      <h3>{routeKey}</h3>
      <div ref={containerRef} />
    </div>
  );
}
