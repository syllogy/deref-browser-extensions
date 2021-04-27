import React from 'react';
import Iframe from '~/playground/components/Iframe';
import { getRouteKeys } from '~/components/routes';
import MessagePoster from '~/playground/components/MessagePoster';

export default function App() {
  return (
    <div>
      <h1>App</h1>

      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <div style={{ borderRight: '1px solid gray', width: 200 }}>
          <MessagePoster />
        </div>
        <div style={{ flexGrow: 1 }}>
          {getRouteKeys().map((k) => (
            <div key={k}>
              <Iframe routeKey={k} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
