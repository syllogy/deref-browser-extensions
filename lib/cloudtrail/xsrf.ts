import { doWarn } from '~/logging';

const getXsrfToken = async () => {
  const url = new URL(document.URL);
  url.pathname = '/cloudtrail/home';
  url.host = 'console.aws.amazon.com';
  url.search = '';

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
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

export const getCloudTrailXsrfToken = async (forceRefresh = false) => {
  if (!cloudTrailXsrfToken || forceRefresh) {
    cloudTrailXsrfToken = await getXsrfToken();
  }
  return cloudTrailXsrfToken;
};
