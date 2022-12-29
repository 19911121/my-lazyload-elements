import { AttributePrefix, AttributeSuffixes } from "./attributes";
import type { Item } from "./item";

const load = (item: Item<HTMLImageElement>): Promise<void> => {
  const el = item.el;
  const loadingSrc = item.el.getAttribute(`${AttributePrefix}${AttributeSuffixes.Loading}`);
  const hasSiblingSource = 'SOURCE' === item.el.previousElementSibling?.tagName;
  const hasLoadingSrc = !!loadingSrc;
  const canLoading = !hasSiblingSource
    && hasLoadingSrc
    && (el.currentSrc.endsWith(loadingSrc) || !el.currentSrc);
  const eventOptions: AddEventListenerOptions = {
    once: true,
  };
   
  // source가 있는 경우 loading 사용 불가!
  return new Promise((resolve, reject) => {
    if (canLoading) {
      const image = new Image();
      
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
      if (hasLoadingSrc && hasSiblingSource) console.warn('source와 함께 사용 할 경우 loading은 사용하실 수 없습니다.');

      el.addEventListener('error', (e) => {
        reject(e);
      }, eventOptions);
  
      el.addEventListener('load', () => {
        resolve();
      }, eventOptions);

      el.setAttribute(item.key, item.value);
    }
  });
};

export {
  load,
};