import { AttributeSuffixes } from './attributes';
import { load as imageLoad } from './images';
import { isImageItem } from './item';
import type {  Item } from './item';

interface Callbacks<E extends HTMLElement = HTMLElement> {
  error: (e: Event, item: Item<E>) => void
  loaded: (e: Event, item: Item<E>) => void
}

/**
 * loading 이미지를 불러옵니다.
 * 
 * @param item {@link Item}
 */
const loading = (item: Item) => {
  const el = item.el;

  if (Reflect.has(el, AttributeSuffixes.Source)) el.setAttribute(AttributeSuffixes.Source, item.value);
  else console.warn(`${item.key} 속성을 지원하지 않는 요소입니다.`, item.el);
}

/**
 * source를 불러옵니다.
 * 
 * @param item {@link item}
 */
const load = async (item: Item) => {
  if (isImageItem(item)) await imageLoad(item);
  else item.el.setAttribute(item.key, item.value);
};

export {
  loading,
  load,
};

export type {
  Callbacks
};