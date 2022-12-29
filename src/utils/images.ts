import { AttributePrefix, AttributeSuffixes } from "./attributes";
import type { Item } from "./item";
import type { Callbacks } from "./load";

const load = (item: Item<HTMLImageElement>): Promise<void> => {
  const el = item.el;
  const loadingSrc = item.el.getAttribute(`${AttributePrefix}${AttributeSuffixes.Loading}`);
  const hasLoadingSrc = !!loadingSrc;
  const isLoading = hasLoadingSrc && (el.currentSrc.endsWith(loadingSrc) || !el.currentSrc);

  // source가 있는 경우 loading 사용 불가!
  return new Promise((resolve, reject) => {
    if (isLoading) {
      const image = new Image();
      const eventOptions: AddEventListenerOptions = {
        once: true,
      };
      
      image.addEventListener('error', (e) => {
        reject(e);
      }, eventOptions);

      image.addEventListener('load', () => {
        el.setAttribute(item.key, item.value);

        resolve();
      }, eventOptions);

      image.src = item.value;
    }
    else {
      el.setAttribute(item.key, item.value);

      resolve();
    }
  });
};

export {
  load,
};