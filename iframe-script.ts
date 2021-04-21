import type { InstanceInfo } from '~/page-handlers/common';
import { doWarn } from './logging';

const renderPrice = async ({ type, hourlyCost }: InstanceInfo) => {
  document.body.style.display = 'unset';

  const priceSpan = document.querySelector('#deref-monthly-cost');
  if (priceSpan) {
    priceSpan.textContent = (hourlyCost * 730).toFixed(2);
  } else {
    doWarn('Price span not found');
  }

  const instanceTypeSpan = document.querySelector('#instance-type');
  if (instanceTypeSpan) {
    instanceTypeSpan.textContent = type;
  } else {
    doWarn('Instance type span not found');
  }
};

window.addEventListener(
  'message',
  (event) => void renderPrice(event.data as InstanceInfo),
);
