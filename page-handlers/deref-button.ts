import {
  PageHandler,
  urlMatchesRegex,
  makeDerefExtensionContainer,
  isNotIframe,
} from './common';

export const derefButton: PageHandler = {
  conditions: [
    isNotIframe,
    urlMatchesRegex(/.*console.aws.amazon.com/),
    () => false, // Temporarily disable the button.
  ],
  async handler(context) {
    void makeDerefExtensionContainer({
      routeKey: 'button',
      context,
      parent: document.getElementById('awsc-nav-header'),
    });
  },
};
