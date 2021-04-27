import { PageHandler, urlMatchesRegex, makeDerefContainer } from './common';

export const derefPanel: PageHandler = {
  conditions: [urlMatchesRegex(/.*console.aws.amazon.com/)],
  async handler(context) {
    void makeDerefContainer({
      routeKey: 'panel',
      context,
      parent: document.body,
    });
  },
};
