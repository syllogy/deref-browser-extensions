import { addWindowMessageListener } from '~/page-handlers/messages';

addWindowMessageListener(window, (payload) => {
  console.log('got message', payload);
});
