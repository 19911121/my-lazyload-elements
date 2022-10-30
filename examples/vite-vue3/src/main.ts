import { createSSRApp } from 'vue';
import App from './App.vue';
import createRouter from './router/index';
import type { ServerContext, VueContext } from './interfaces/types';

// plugins
import createMyLazyLoadElements from '@/plugins/my-lazyload-element';

export default async function(serverContext?: ServerContext) {
  const app = createSSRApp(App);
  const router = createRouter();
  const vueContext: VueContext = { router };

  app.use(router);
  app.use(createMyLazyLoadElements({}, {
    error(state, result?, error?) {
      if (result?.element instanceof HTMLImageElement) result.element.src = './assets/logo.png';
    },
  }));

  return {
    app,
    router,
  };
}
