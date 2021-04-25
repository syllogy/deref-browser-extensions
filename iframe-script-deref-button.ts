import {
  postMessageFromIframe,
  addWindowMessageListener,
} from '~/page-handlers/messages';

const buttonEventListener = () => {
  postMessageFromIframe({ type: 'togglePanel', payload: undefined });
};

addWindowMessageListener(window, (message) => {
  switch (message.type) {
    case 'init': {
      const button = document.querySelector('#deref-button');
      if (!button) {
        throw new Error('Button not found');
      }
      button.removeEventListener('click', buttonEventListener);
      button.addEventListener('click', buttonEventListener);
      break;
    }
  }
});
