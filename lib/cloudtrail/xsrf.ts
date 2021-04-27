import { doWarn } from '~/logging';
import { getRegionCode } from '~/page-handlers/common';

const getXsrfToken = async () => {
  const url = new URL(document.URL);
  url.href = '/cloudtrail/home';
  url.search = '';
  const iframe = document.createElement('iframe');
  iframe.src = url.toString();
  try {
    document.body.append(iframe);
    await new Promise<void>((resolve) => {
      iframe.onload = () => void resolve();
    });
    const iframeDocument = iframe.contentDocument;
    if (!iframeDocument) {
      doWarn('Could not access iframe document');
      return null;
    }
    const preloadElement = iframeDocument.getElementById('preload');
    if (!preloadElement) {
      doWarn('No preloadElement found');
      return null;
    }
    const val = preloadElement.getAttribute('data-xsrf-token');
    if (!val) {
      doWarn('No XSRF attribute found');
      return null;
    }

    const { token }: { token: string | undefined } = JSON.parse(val);
    if (!token) {
      doWarn('No token in XSRF attribute');
      return null;
    }
    return token;
  } finally {
    iframe.remove();
  }
};

// Singleton token state.
let cloudTrailXsrfToken: string | null = null;

// Fetch a CloudTrail console page's HTML and extract the XSRF token from it.
const fetchToken = async (): Promise<string | null> => {
  console.log('fetch a token');
  const region = getRegionCode();
  if (!region) {
    doWarn('No region');
    return null;
  }
  const response = await fetch(
    `https://${region}.console.aws.amazon.com/cloudtrail/home?region=${region}&derefToken=true#/dashboard`,
    {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:88.0) Gecko/20100101 Firefox/88.0',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Upgrade-Insecure-Requests': '1',
      },
    },
  );
  const text = await response.text();
  const dom = new DOMParser().parseFromString(text, 'text/html');
  const preloadElement = dom.getElementById('preload');
  if (!preloadElement) {
    doWarn('No preloadElement found');
    return null;
  }
  const val = preloadElement.getAttribute('data-xsrf-token');
  if (!val) {
    doWarn('No XSRF attribute found');
    return null;
  }

  const { token }: { token: string | undefined } = JSON.parse(val);
  if (!token) {
    doWarn('No token in XSRF attribute');
    return null;
  }
  return token;
};

export const getCloudTrailXsrfToken = async (forceRefresh = false) => {
  if (!cloudTrailXsrfToken || forceRefresh) {
    cloudTrailXsrfToken = await getXsrfToken();
  }
  return cloudTrailXsrfToken;
};
