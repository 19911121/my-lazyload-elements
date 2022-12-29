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
    error(error, result) {
      if (result?.element instanceof HTMLImageElement) {
        const errorImageSource = '/assets/logo.png';

        result.element.src = errorImageSource;
        
        if (result.element.previousElementSibling) result.element.parentElement?.querySelectorAll('source').forEach(el => el.srcset = errorImageSource);
      }
    },
  }));

  return {
    app,
    router,
  };
}
