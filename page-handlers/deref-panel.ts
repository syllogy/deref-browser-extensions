import {
  PageHandler,
  urlMatchesRegex,
  makeDerefExtensionContainer,
} from './common';

export const derefPanel: PageHandler = {
  conditions: [urlMatchesRegex(/.*console.aws.amazon.com/)],
  async handler(context) {
    if (window.self !== window.top) {
      return;
    }
    void makeDerefExtensionContainer({
      routeKey: 'panel',
      context,
      parent: document.body,
    });
  },
};
