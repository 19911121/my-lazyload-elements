interface Item<E extends Element = Element> {
  el: E;
  key: string;
  value: string;
  entry?: IntersectionObserverEntry;
  observer?: IntersectionObserver;
}

/**
 * 이미지 요소 여부 반환
 * 
 * @param item 
 */
const isImageItem = (item: Item): item is Item<HTMLImageElement> => {
  return item.el instanceof HTMLImageElement;
};

export {
  isImageItem
};

export type {
  Item
};