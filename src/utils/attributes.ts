import { loading } from "./load";
import type { Item } from "./item";

const AttributePrefix = 'data-my-lazy-';
const AttributeSuffixes = {
  Source: 'src',
  Class: 'class',
  Once: 'once',
  Loading: 'loading',
} as const;

const Attributes = {
  Active: 'my-lazy',
  ActiveGroup: 'my-lazy-group',
  Show: 'my-lazy-show',
  Hide: 'my-lazy-hide',
} as const;

const dataSourceAttributeName = `${AttributePrefix}${AttributeSuffixes.Source}`;

/**
 * source를 반환합니다.
 * 
 * @param el lazyload 적용 된 요소
 */
const getSource = (el: Element) => {
  return el.getAttribute(`${AttributePrefix}${AttributeSuffixes.Source}`);
};

/**
 * once 존재여부 반환
 * 
 * @param el lazyload 적용 된 요소
 */
const hasOnce = (el: Element) => {
  return el.hasAttribute(`${AttributePrefix}${AttributeSuffixes.Once}`);
};

/**
 * attributes 적용
 * 
 * @param el lazyload가 적용 된 요소
 */
const setAttributes = (el: Element) => {
  for (const attr of el.attributes) {
    if (attr.nodeName.startsWith(AttributePrefix) && dataSourceAttributeName !== attr.nodeName) {
      const key = attr.nodeName.replace(AttributePrefix, '');
      const value = el.getAttribute(attr.nodeName) ?? '';
      const item: Item = { el, key, value };

      setAttribute(item);  
    }
  }
};

/**
 * attribute 적용
 * 
 * @param item {@link item}
 */
const setAttribute = (item: Item) => {
  const { el, key, value } = item;

  switch (key) {
    case 'class':
      el.classList.add(value);

      break;
    case 'style':
      el.setAttribute(key, (el.getAttribute('style') || '') + value);

      break;
    case 'loading':
      loading(item);

      break;
    default:
      el.setAttribute(key, value);

      break;
  }
};

/**
 * attributes 제거
 * 
 * @param el lazyload가 적용 된 요소
 */
const removeAttributes = (el: Element) => {
  for (const attr of el.attributes) {
    if (attr.nodeName.startsWith(AttributePrefix) && dataSourceAttributeName !== attr.nodeName) {
      const key = attr.nodeName.replace(AttributePrefix, '');
      const value = el.getAttribute(attr.nodeName) ?? '';
      const item: Item = { el, key, value };

      removeAttribute(item);  
    }
  }
};

/**
 * attribute 삭제
 * 
 * @param item {@link item}
 */
const removeAttribute = (item: Item) => {
  const { el, key } = item;

  switch (key) {
    case 'class':
      el.classList.value = el.classList.value.replace(item.value, '');

      break;
    case 'style':
      el.setAttribute(item.key, (el.getAttribute(item.key) ?? '').replace(item.value, ''))

      break;
    default:
      el.removeAttribute(key);

      break;
  }
};

export {
  getSource,
  hasOnce,
  setAttribute,
  setAttributes,
  removeAttribute,
  removeAttributes,
};

export {
  AttributePrefix,
  AttributeSuffixes,
  Attributes,
};