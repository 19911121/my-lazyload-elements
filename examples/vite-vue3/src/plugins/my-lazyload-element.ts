import MyLazyLoadElements from '../../../../src/my-lazyload-elements';
import type { MyLazyLoadElementsOptions, MyLazyLoadElementsCallbacks } from '../../../../src/my-lazyload-elements';;
import type { App, DirectiveBinding, VNode } from 'vue';

/**
 * validate 생성
 */
const createMyLazyLoadElements = (options?: MyLazyLoadElementsOptions, callbacks?: MyLazyLoadElementsCallbacks) => {
  let myLazyLoadElements: MyLazyLoadElements | null = null;

  return {
    install(app: App) {
      app.directive('my-lazy', {
        beforeMount(el: HTMLElement, binding: DirectiveBinding, vnode: VNode) {
          myLazyLoadElements = new MyLazyLoadElements(el, options, callbacks);
        },

        updated(el: HTMLElement, binding: DirectiveBinding, vnode: VNode) {
          if (myLazyLoadElements) myLazyLoadElements.addObserve(el);
          else myLazyLoadElements = new MyLazyLoadElements(el, options, callbacks);
        },
  
        unmounted(el: HTMLElement, binding: DirectiveBinding) {
          if (myLazyLoadElements) {
            myLazyLoadElements.dispose();
            myLazyLoadElements = null;
          }
        },
      });
    },
  };
};

export default createMyLazyLoadElements;