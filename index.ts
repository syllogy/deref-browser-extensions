import { pageHandlers } from './page-handlers';
import { doPageHandler } from './page-handlers/common';
import { addWindowMessageListener } from '~/page-handlers/messages';

const asyncSleep = (timeMilliseconds: number): Promise<void> =>
  new Promise((r) => setTimeout(r, timeMilliseconds));

const main = async () => {
  while (true) {
    await Promise.all(pageHandlers.map(doPageHandler));
    await asyncSleep(1000);
  }
};

let derefPanel: HTMLIFrameElement | null = null;
const findDerefPanel = () => {
  const panel = document.getElementById('deref-panel');
  if (panel instanceof HTMLIFrameElement) {
    derefPanel = panel;
  }
  return derefPanel;
};

addWindowMessageListener(window, (msg) => {
  if (msg.type === 'togglePanel') {
    const panel = findDerefPanel();
    if (panel) {
      panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    }
  }
});

void main();
