import type { InstanceInfo } from './index';

const renderPrice = async ({ type, hourlyCost }: InstanceInfo) => {
  document.body.style.display = 'unset';

  const priceSpan = document.querySelector('#deref-monthly-cost');
  if (!priceSpan) {
    console.warn('Price span not found');
  } else {
    priceSpan.textContent = (hourlyCost * 730).toFixed(2);
  }

  const instanceTypeSpan = document.querySelector('#instance-type');
  if (!instanceTypeSpan) {
    console.warn('Instance type span not found');
  } else {
    instanceTypeSpan.textContent = type;
  }
};

window.addEventListener(
  'message',
  (event) => void renderPrice(event.data as InstanceInfo),
);
