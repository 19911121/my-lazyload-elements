const loading = (item) => {
    const el = item.el;
    if (Reflect.has(el, AttributeSuffixes.Source))
        el.setAttribute(AttributeSuffixes.Source, item.value);
    else
        console.warn(`${item.key} 속성을 지원하지 않는 요소입니다.`, item.el);
};

const AttributePrefix = 'data-my-lazy-';
const AttributeSuffixes = {
    Source: 'src',
    Class: 'class',
    Once: 'once',
    Loading: 'loading',
};
const Attributes = {
    Active: 'my-lazy',
    ActiveGroup: 'my-lazy-group',
    Show: 'my-lazy-show',
    Hide: 'my-lazy-hide',
};
const dataSourceAttributeName = `${AttributePrefix}${AttributeSuffixes.Source}`;
const getSource = (el) => {
    return el.getAttribute(`${AttributePrefix}${AttributeSuffixes.Source}`);
};
const hasOnce = (el) => {
    return el.hasAttribute(`${AttributePrefix}${AttributeSuffixes.Once}`);
};
const setAttributes = (el) => {
    for (const attr of el.attributes) {
        if (attr.nodeName.startsWith(AttributePrefix) && dataSourceAttributeName !== attr.nodeName) {
            const key = attr.nodeName.replace(AttributePrefix, '');
            const value = el.getAttribute(attr.nodeName) ?? '';
            const item = { el, key, value };
            setAttribute(item);
        }
    }
};
const setAttribute = (item) => {
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
        case 'once':
            break;
        default:
            el.setAttribute(key, value);
            break;
    }
};
const removeAttributes = (el) => {
    for (const attr of el.attributes) {
        if (attr.nodeName.startsWith(AttributePrefix)) {
            const key = attr.nodeName.replace(AttributePrefix, '');
            const value = el.getAttribute(attr.nodeName) ?? '';
            const item = { el, key, value };
            removeAttribute(item);
        }
    }
};
const removeAttribute = (item) => {
    const { el, key } = item;
    switch (key) {
        case 'class':
            el.classList.value = el.classList.value.replace(item.value, '');
            break;
        case 'style':
            el.setAttribute(item.key, (el.getAttribute(item.key) ?? '').replace(item.value, ''));
            break;
        default:
            el.removeAttribute(key);
            break;
    }
};

export { AttributePrefix, AttributeSuffixes, Attributes, getSource, hasOnce, removeAttribute, removeAttributes, setAttribute, setAttributes };
