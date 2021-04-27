import {
  PageHandler,
  urlMatchesRegex,
  makeDerefExtensionContainer,
} from './common';

export const derefButton: PageHandler = {
  conditions: [urlMatchesRegex(/.*console.aws.amazon.com/)],
  async handler(context) {
    void makeDerefExtensionContainer({
      routeKey: 'button',
      context,
      parent: document.getElementById('awsc-nav-header'),
    });
  },
};
