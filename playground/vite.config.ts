// Documentation: https://vitejs.dev/config/

import { Plugin, defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import { resolve } from 'path';

const root = resolve(__dirname, '..');

export default defineConfig((configEnv) => {
  const plugins: Plugin[] = [reactRefresh()];

  return {
    plugins,

    root: __dirname,

    server: {
      host: 'localhost',
      hmr: {
        protocol: 'ws',
        host: 'localhost',
      },
    },

    resolve: {
      alias: {
        '~': root,
      },
    },
  };
});
