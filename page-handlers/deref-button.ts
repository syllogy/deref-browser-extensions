import { PageHandler, urlMatchesRegex, makeDerefContainer } from './common';

export const derefButton: PageHandler = {
  conditions: [urlMatchesRegex(/.*console.aws.amazon.com/)],
  async handler(context) {
    void makeDerefContainer({
      routeKey: 'button',
      context,
      parent: document.getElementById('awsc-nav-header'),
    });
  },
};
