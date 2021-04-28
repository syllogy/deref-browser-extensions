import React, { useRef, useEffect } from 'react';
import { makeDerefContainer } from '~/page-handlers/utils';
import { RouteKey } from '~/components/routes';
import { DerefContext } from '~/page-handlers/messages';

interface Props {
  routeKey: RouteKey;
  derefContext: DerefContext;
}

export default function Iframe({ routeKey, derefContext }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void makeDerefContainer({
      routeKey,
      src: '../iframe-index.html',
      context: derefContext,
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
