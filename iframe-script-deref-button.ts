import { postMessageFromIframe } from '~/page-handlers/messages';

window.addEventListener('load', (event) => {
  const button = document.querySelector('#deref-button');
  if (!button) {
    throw new Error('Button not found');
  }
  button.addEventListener('click', (event) => {
    postMessageFromIframe('togglePanel', null);
  });
});
