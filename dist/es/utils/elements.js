const load$1 = (item) => {
    const el = item.el;
    const loadingSrc = item.el.getAttribute(`${AttributePrefix}${AttributeSuffixes.Loading}`);
    const hasSiblingSource = 'SOURCE' === item.el.previousElementSibling?.tagName;
    const hasLoadingSrc = !!loadingSrc;
    const canLoading = !hasSiblingSource
        && hasLoadingSrc
        && (el.currentSrc.endsWith(loadingSrc) || !el.currentSrc);
    const eventOptions = {
        once: true,
    };
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
            if (hasLoadingSrc && hasSiblingSource)
                console.warn('source와 함께 사용 할 경우 loading은 사용하실 수 없습니다.');
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

const isImageItem = (item) => {
    return item.el instanceof HTMLImageElement;
};

const loading = (item) => {
    const el = item.el;
    if (Reflect.has(el, AttributeSuffixes.Source))
        el.setAttribute(AttributeSuffixes.Source, item.value);
    else
        console.warn(`${item.key} 속성을 지원하지 않는 요소입니다.`, item.el);
};
const load = async (item) => {
    if (isImageItem(item))
        await load$1(item);
    else
        item.el.setAttribute(item.key, item.value);
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

const getTargetElements = (container) => {
    let els = [];
    if (container instanceof Element) {
        els = Array.from(container.querySelectorAll(`[${Attributes.Active}]:not([${Attributes.Show}]):not([${Attributes.Hide}])`));
        els = els.concat(getGroupTargetElements([...container.querySelectorAll(`[${Attributes.ActiveGroup}]:not([${Attributes.Show}]):not([${Attributes.Hide}])`)], []));
    }
    else {
        throw new TypeError('container의 타입이 잘못되었습니다. Element 요소만 올 수 있습니다.', container);
    }
    return els;
};
const getGroupTargetElements = (els, cumulative) => {
    return [
        ...cumulative,
        ...els.flatMap(v => {
            const hasPrefix = -1 !== [...v.attributes].findIndex(vv => vv.name.startsWith(AttributePrefix));
            const parents = hasPrefix ? [v] : [];
            return v.children.length ? getGroupTargetElements([...v.children], parents) : parents;
        })
    ];
};
const show = async (el) => {
    try {
        const source = getSource(el);
        setAttributes(el);
        if (source) {
            const sourceItem = { el, key: AttributeSuffixes.Source, value: source };
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
const hide = (el) => {
    removeAttributes(el);
    el.removeAttribute(Attributes.Show);
    el.setAttribute(Attributes.Hide, '');
};

export { getTargetElements, hide, show };
