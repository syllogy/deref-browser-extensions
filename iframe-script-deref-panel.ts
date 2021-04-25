import {
  addWindowMessageListener,
  postMessageFromIframe,
} from '~/page-handlers/messages';

const loginEventListener = () => {
  postMessageFromIframe({ type: 'login', payload: undefined });
};

const logoutEventListener = () => {
  postMessageFromIframe({ type: 'logout', payload: undefined });
};

addWindowMessageListener(window, (msg) => {
  switch (msg.type) {
    case 'init': {
      const unauthenticatedContainer = document.querySelector<HTMLElement>(
        '#unauthenticated-container',
      )!;
      const authenticatedContainer = document.querySelector<HTMLElement>(
        '#authenticated-container',
      )!;

      if (msg.payload.user) {
        unauthenticatedContainer.style.display = 'none';
        authenticatedContainer.style.display = 'block';

        const user = authenticatedContainer.querySelector('#username')!;
        user.textContent = msg.payload.user.email;

        const logoutButton = authenticatedContainer.querySelector(
          '#logout-button',
        )!;
        logoutButton.removeEventListener('click', logoutEventListener);
        logoutButton.addEventListener('click', logoutEventListener);
      } else {
        authenticatedContainer.style.display = 'none';
        unauthenticatedContainer.style.display = 'block';

        const loginButton = unauthenticatedContainer.querySelector(
          '#login-button',
        )!;
        loginButton.removeEventListener('click', loginEventListener);
        loginButton.addEventListener('click', loginEventListener);
      }
      break;
    }
  }
});
