import { AttributePrefix, Attributes, AttributeSuffixes, getSource, removeAttributes, setAttributes } from "./attributes";
import { load } from "./load";
import type { Item } from "./item";

/**
 * container 내 lazyload를 적용 할 요소를 반환 합니다.
 *
 * @param container lazyload 적용 할 부모 요소
 */
const getTargetElements = (container: Element) => {
  let els: Element[] = [];

  if (container instanceof Element) {
    els = Array.from(container.querySelectorAll(`[${Attributes.Active}]:not([${Attributes.Show}]):not([${Attributes.Hide}])`));
    // els.push(...Array.from(container.querySelectorAll(`[${Attributes.ActiveGroup}]:not([${Attributes.Show}]):not([${Attributes.Hide}])`)));
    els = els.concat(getGroupTargetElements([...container.querySelectorAll(`[${Attributes.ActiveGroup}]:not([${Attributes.Show}]):not([${Attributes.Hide}])`)], []))
  }
  else {
    throw new TypeError('container의 타입이 잘못되었습니다. Element 요소만 올 수 있습니다.', container);
  }

  return els;
}

/**
 * container group 내 lazyload를 적용 할 요소를 반환합니다. 
 * 
 * @param els 검색 할 요소
 * @param cumulative 누적 요소
 */
const getGroupTargetElements = (els: Element[], cumulative: Element[]): Element[] => {
  return [
    ...cumulative,
    ...els.flatMap(v => {
      const hasPrefix = -1 !== [...v.attributes].findIndex(vv => vv.name.startsWith(AttributePrefix));
      const parents = hasPrefix ? [v] : [];

      return v.children.length ? getGroupTargetElements([...v.children], parents) : parents;
    })
  ];
}

/**
 * 화면에 노출되었습니다.
 * 
 * @param el lazyload가 적용 된 요소
 */
const show = async (el: Element): Promise<void> => {
  try {
    const source = getSource(el);

    setAttributes(el);

    if (source) {
      const sourceItem: Item = { el, key: AttributeSuffixes.Source, value: source };

      await load(sourceItem);
    }
  }
  catch (ex) {
    throw ex;
  }
  finally {
    el.removeAttribute(Attributes.Hide);
    el.setAttribute(Attributes.Show, '');
  }
};

/**
 * 화면에서 가려졌습니다.
 * 
 * @param el lazyload가 적용 된 요소
 */
const hide = (el: Element) => {
  removeAttributes(el);

  el.removeAttribute(Attributes.Show);
  el.setAttribute(Attributes.Hide, '');
};

export {
  getTargetElements,
  show,
  hide,
};