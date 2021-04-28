import React from 'react';
import ReactDOM from 'react-dom';
import Playground from '~/playground/components/Playground';
import '~/styles/tailwind.css';
import '~/styles/main.css';

ReactDOM.render(
  <React.StrictMode>
    <Playground />
  </React.StrictMode>,
  document.getElementById('root'),
);
