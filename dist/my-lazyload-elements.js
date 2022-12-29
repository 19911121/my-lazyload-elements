'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const ErrorState = {
    NotSupport: 'NotSupport',
    MissingContainer: 'MissingContainer',
    InvalidContainerType: 'InvalidContainerType',
    LoadFail: 'LoadFail',
};

const makeResult = (element, entry) => {
    return {
        element,
        isIntersecting: entry ? entry.isIntersecting : false,
        intersectionRatio: entry ? entry.intersectionRatio : -1,
    };
};

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

class LazyLoadElement {
    observer = null;
    observerOptions = {};
    mutationObserver = null;
    callbacks = {};
    appliedElements = [];
    constructor(container, options, callbacks) {
        if (container)
            this.init(container, options, callbacks);
        else
            this.callbacks.error?.(new TypeError('container type error'));
    }
    dispose() {
        this.resetAppliedElements();
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
    init(container, options, callbacks) {
        this.observerOptions = {
            root: options && options.root ? options.root : null,
            rootMargin: options && options.rootMargin ? options.rootMargin : '0px',
            threshold: options && options.threshold ? options.threshold : 0,
        };
        this.setCallbacks(callbacks);
        this.addObserve(container);
        this.addMutationObserver(container);
    }
    setCallbacks = (callbacks) => {
        if (callbacks) {
            for (const [key, value] of Object.entries(callbacks)) {
                this.callbacks[key] = value;
            }
        }
    };
    isGroup(el) {
        return el.hasAttribute(Attributes.ActiveGroup);
    }
    showGroup(el, entry, observer) {
        for (const child of el.children) {
            this.show(child, entry, observer);
            if (child.children.length)
                this.showGroup(child, entry, observer);
        }
    }
    ;
    async show(el, entry, observer) {
        try {
            await show(el);
            if (observer && hasOnce(el)) {
                observer.unobserve(el);
                this.deleteAppliedElement(el);
            }
            this.callbacks.show?.(makeResult(el, entry));
        }
        catch (ex) {
            this.callbacks.error?.(ex, makeResult(el, entry));
        }
    }
    hideGroup(el, entry) {
        for (const child of el.children) {
            this.hide(child, entry);
            if (child.children.length)
                this.hideGroup(child, entry);
        }
    }
    ;
    hide(el, entry) {
        const showed = el.hasAttribute(Attributes.Show);
        hide(el);
        if (showed)
            this.callbacks.hide?.(makeResult(el, entry));
    }
    addObserve(container) {
        const targetElements = getTargetElements(container);
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(this.observerHandler, this.observerOptions);
            this.addAppliedElements(targetElements);
        }
        else {
            this.callbacks.error?.(ErrorState.NotSupport, makeResult(container));
            for (const el of targetElements) {
                if (this.isGroup(el))
                    this.showGroup(el);
                else
                    this.show(el);
            }
        }
    }
    observerHandler = (entries) => {
        for (const entry of entries) {
            let eventName;
            if (!this.observer)
                return;
            if (entry.isIntersecting) {
                if (this.isGroup(entry.target))
                    this.showGroup(entry.target, entry, this.observer);
                else
                    this.show(entry.target, entry, this.observer);
                eventName = 'show';
            }
            else {
                if (this.isGroup(entry.target))
                    this.hideGroup(entry.target, entry);
                else
                    this.hide(entry.target, entry);
                eventName = 'hide';
            }
            this.callbacks.call?.(eventName, makeResult(entry.target, entry));
        }
    };
    addMutationObserver(container) {
        if (this.mutationObserver) {
            this.mutationObserver.observe(container, {
                childList: true,
            });
        }
        else {
            this.mutationObserver = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    for (const node of mutation.removedNodes) {
                        if (node instanceof Element)
                            this.deleteAppliedElement(node);
                    }
                }
            });
        }
    }
    getAppliedElements() {
        return this.appliedElements;
    }
    getShowedElements() {
        return this.appliedElements.filter((el) => el.hasAttribute(Attributes.Show));
    }
    addAppliedElements = (els) => {
        for (const el of els) {
            this.addAppliedElement(el);
        }
    };
    addAppliedElement = (el) => {
        if (!this.observer)
            return;
        this.deleteAppliedElement(el);
        this.appliedElements.push(el);
        this.observer.observe(el);
        el.setAttribute(Attributes.Hide, '');
    };
    deleteAppliedElement = (el) => {
        const appliedElementIndex = this.appliedElements.findIndex((v) => v === el);
        if (-1 !== appliedElementIndex)
            this.appliedElements.splice(appliedElementIndex, 1);
    };
    resetAppliedElements = () => {
        if (this.appliedElements.length) {
            for (const el of this.appliedElements) {
                el.removeAttribute(Attributes.Show);
                el.removeAttribute(Attributes.Hide);
            }
        }
        this.appliedElements = [];
    };
}

exports.MyLazyLoadElementsErrorState = ErrorState;
exports.default = LazyLoadElement;
