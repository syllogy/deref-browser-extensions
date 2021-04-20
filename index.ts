import { pageHandlers } from './page-handlers';
import { doPageHandler } from './page-handlers/common';

const asyncSleep = (timeMilliseconds: number): Promise<void> =>
  new Promise((r) => setTimeout(r, timeMilliseconds));

const main = async () => {
  while (true) {
    await Promise.all(pageHandlers.map(doPageHandler));
    await asyncSleep(1000);
  }
};

void main();
