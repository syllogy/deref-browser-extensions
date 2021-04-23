import {
  addWindowMessageListener,
  postMessageFromIframe,
} from '~/page-handlers/messages';

addWindowMessageListener(window, (msg) => {
  switch (msg.type) {
    case 'init': {
      const authContainer = document.querySelector<HTMLElement>(
        '#unauthenticated-container',
      )!;
      authContainer.style.display = 'block';

      const loginButton = authContainer.querySelector('#login-button')!;
      loginButton.addEventListener('click', (event) => {
        postMessageFromIframe({ type: 'login', payload: undefined });
      });
      break;
    }
  }
});
