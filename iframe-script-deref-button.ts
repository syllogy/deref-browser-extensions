import {
  postMessageFromIframe,
  addWindowMessageListener,
} from '~/page-handlers/messages';

addWindowMessageListener(window, (message) => {
  switch (message.type) {
    case 'init': {
      const button = document.querySelector('#deref-button');
      if (!button) {
        throw new Error('Button not found');
      }
      button.addEventListener('click', (event) => {
        postMessageFromIframe({ type: 'togglePanel', payload: undefined });
      });
      break;
    }
  }
});
