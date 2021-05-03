import { ExtensionApi } from '~/lib/extension-api/api';
import { arnToUrl } from '~/lib/arn';

export const initOmnibox = (browser: ExtensionApi) => {
  browser.omnibox.setDefaultSuggestion({
    description: 'Enter an ARN',
  });

  browser.omnibox.onInputEntered.addListener(async (text, disposition) => {
    if (!text.startsWith('arn:')) {
      return;
    }
    const url = await arnToUrl(text);
    if (!url) {
      return;
    }
    switch (disposition) {
      case 'currentTab':
        browser.tabs.update({ url });
        break;
      case 'newForegroundTab':
        browser.tabs.create({ url });
        break;
      case 'newBackgroundTab':
        browser.tabs.create({ url, active: false });
        break;
    }
  });
};
