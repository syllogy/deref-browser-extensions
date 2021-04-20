import { handleAllPages } from '~/page-handlers';

const asyncSleep = (timeMilliseconds: number): Promise<void> =>
  new Promise((r) => setTimeout(r, timeMilliseconds));

const main = async () => {
  while (true) {
    await handleAllPages();
    await asyncSleep(1000);
  }
};

void main();
