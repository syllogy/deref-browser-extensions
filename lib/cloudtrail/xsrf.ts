import { doWarn } from '~/logging';
import { getRegionCode } from '~/page-handlers/common';

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

  console.log('val', val);

  const { token }: { token: string | undefined } = JSON.parse(val);
  if (!token) {
    doWarn('No token in XSRF attribute');
    return null;
  }
  return token;
};

// Singleton token state.
let token: string | null = null;
let isRefreshing: boolean;

// Starts a token fetch if necessary, and then blocks until the current token
// fetch completes.
const refresh = async () => {
  if (isRefreshing) {
    return isRefreshing;
  }
  try {
    isRefreshing = true;
    token = await fetchToken();
  } finally {
    isRefreshing = false;
  }
};

// Synchronization state for simultaneous token gets.
type Callback = (token: string | null) => void;
let callbacks: Callback[] = [];

const wake = async () => {
  if (token === null) {
    await refresh();
  }
  const captured = callbacks;
  callbacks = [];
  for (const callback of captured) {
    callback(token);
  }
};

// Gets the current token. If not initially available, awaits a refreshed token.
export const getBlocking = () =>
  new Promise<string | null>((accept) => {
    callbacks.push(accept);
    void wake();
  });

// Gets the current token, if it is already available. Has side-effect of
// triggering a refresh, so subsequent calls may succeed.
export const getReady = () => {
  void getBlocking();
  return token;
};

// Clears the current token and triggers a refresh.
export const reset = (): void => {
  token = null;
  if (isRefreshing) {
    isRefreshing = false;
  }
  void wake();
};
