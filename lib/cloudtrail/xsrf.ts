import { addWindowMessageListener } from '~/page-handlers/messages';

const getXsrfToken = async () => {
  if (window.top !== window.self) {
    return null;
  }

  const url = new URL(document.URL);
  url.pathname = '/cloudtrail/home';
  url.host = 'console.aws.amazon.com';
  url.search = '';

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url.toString();

  const tokenPromise = new Promise<string>((resolve, reject) => {
    let isResolved = false;
    addWindowMessageListener(window.top, (msg) => {
      if (!isResolved && msg.type === 'token') {
        isResolved = true;
        resolve(msg.payload.token);
      }
    });
    setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        reject(new Error('Timed out waiting for xsrf token'));
      }
    }, 30_000);
  });

  try {
    document.body.append(iframe);
    await new Promise<void>((resolve) => {
      iframe.onload = () => void resolve();
    });

    return await tokenPromise;
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
