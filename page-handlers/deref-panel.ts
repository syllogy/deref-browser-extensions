import {
  PageHandler,
  urlMatchesRegex,
  makeDerefExtensionContainer,
  isNotIframe,
} from './common';

export const derefPanel: PageHandler = {
  conditions: [isNotIframe, urlMatchesRegex(/.*console.aws.amazon.com/)],
  async handler(context) {
    void makeDerefExtensionContainer({
      routeKey: 'panel',
      context,
      parent: document.body,
    });
  },
};
