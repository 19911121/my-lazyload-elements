'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const EventName = {
    Error: 'error',
    Call: 'call',
    Show: 'show',
    Hide: 'hide',
};
const ErrorState = {
    NotSupport: 'NotSupport',
    MissingContainer: 'MissingContainer',
    InvalidContainerType: 'InvalidContainerType',
    LoadFail: 'LoadFail',
};
class LazyLoadElement {
    constructor(container, options, callbacks) {
        this.ActiveAttr = 'my-lazyload';
        this.ShowAttr = 'my-lazyload-show';
        this.HideAttr = 'my-lazyload-hide';
        this.observer = null;
        this.mutationObserver = null;
        this.debug = false;
        this.config = {};
        this.callbacks = {};
        this.appliedElements = [];
        this.disposeAppliedElements = () => {
            if (this.appliedElements.length) {
                for (const el of this.appliedElements) {
                    el.removeAttribute(this.ShowAttr);
                    el.removeAttribute(this.HideAttr);
                }
            }
            this.appliedElements = [];
        };
        this.init(options, callbacks);
        if (container) {
            this.addObserve(container);
            this.addMutationObserver(container);
        }
        else {
            if (this.callbacks && this.callbacks.error) {
                this.callbacks.error(ErrorState.MissingContainer);
            }
        }
    }
    dispose() {
        if (this.observer) {
            this.disposeAppliedElements();
            this.observer.disconnect();
            this.observer = null;
        }
    }
    init(options, callbacks) {
        this.config = {
            root: options && options.root ? options.root : null,
            rootMargin: options && options.rootMargin ? options.rootMargin : '0px',
            threshold: options && options.threshold ? options.threshold : 0.01,
        };
        if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.show)
            this.callbacks.show = callbacks.show;
        if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.hide)
            this.callbacks.hide = callbacks.hide;
        if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.call)
            this.callbacks.call = callbacks.call;
        if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.error)
            this.callbacks.error = callbacks.error;
    }
    getTargetElements(container) {
        let elements = [];
        if (container) {
            if (container instanceof Element) {
                elements = Array.from(container.querySelectorAll(`[${this.ActiveAttr}]:not([${this.ShowAttr}]):not([${this.HideAttr}])`));
            }
            else {
                if (this.callbacks && this.callbacks.error)
                    this.callbacks.error(ErrorState.InvalidContainerType, this.makeResult(container));
            }
        }
        else {
            elements = Array.from(document.querySelectorAll(`[${this.ActiveAttr}]:not([${this.ShowAttr}]):not([${this.HideAttr}])`));
        }
        return elements;
    }
    makeResult(element, entry) {
        return {
            element,
            isIntersecting: entry ? entry.isIntersecting : false,
            intersectionRatio: entry ? entry.intersectionRatio : -1,
        };
    }
    show(element, entry, observer) {
        var _a;
        if (element.getAttribute(this.ShowAttr))
            return;
        const errorHandler = (e) => {
            element.removeEventListener('error', errorHandler);
            if (this.callbacks.error)
                this.callbacks.error(ErrorState.LoadFail, this.makeResult(element, entry), e);
        };
        for (const attr of element.attributes) {
            if (attr.nodeName.match(/data-my-lazyload/)) {
                const key = attr.nodeName.replace(/data-my-lazyload-/, '');
                const value = (_a = element.getAttribute(attr.nodeName)) !== null && _a !== void 0 ? _a : '';
                switch (key) {
                    case 'class':
                        element.classList.add(value);
                        break;
                    case 'style':
                        element.setAttribute(key, (element.getAttribute('style') || '') + value);
                        break;
                    case 'src':
                        element.addEventListener('error', errorHandler);
                        element.setAttribute(key, value);
                        break;
                    case 'once':
                        if (observer)
                            this.deleteAppliedElement(element);
                        break;
                    default:
                        console.warn('정의되지 않은 attribute 입니다.', key, value);
                        break;
                }
            }
        }
        element.removeAttribute(this.HideAttr);
        element.setAttribute(this.ShowAttr, '');
        if (this.callbacks && this.callbacks.show)
            this.callbacks.show(this.makeResult(element, entry));
    }
    hide(element, entry) {
        var _a, _b;
        const showed = element.hasAttribute(this.ShowAttr);
        for (const attr of element.attributes) {
            if (attr.nodeName.match(/data-my-lazyload/)) {
                const key = attr.nodeName.replace(/data-my-lazyload-/, '');
                const value = (_a = element.getAttribute(attr.nodeName)) !== null && _a !== void 0 ? _a : '';
                switch (key) {
                    case 'class':
                        element.classList.remove(value);
                        break;
                    case 'style':
                        element.setAttribute(key, ((_b = element.getAttribute('style')) !== null && _b !== void 0 ? _b : '').replace(value, ''));
                        break;
                }
            }
        }
        element.removeAttribute(this.ShowAttr);
        element.setAttribute(this.HideAttr, '');
        if (showed && this.callbacks && this.callbacks.hide)
            this.callbacks.hide(this.makeResult(element, entry));
    }
    addObserve(container) {
        const targetElements = this.getTargetElements(container);
        if ('IntersectionObserver' in window) {
            if (this.debug)
                console.log('IntersectionObserver support');
            for (const el of targetElements) {
                setTimeout(() => {
                    el.setAttribute(this.HideAttr, '');
                    const appliedElementIndex = this.appliedElements.findIndex((v) => v === el);
                    if (this.observer)
                        this.observer.observe(el);
                    if (-1 !== appliedElementIndex)
                        this.appliedElements.splice(appliedElementIndex, 1);
                    this.appliedElements.push(el);
                }, 1);
            }
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    let eventName;
                    if (!this.observer)
                        return;
                    if (entry.isIntersecting) {
                        this.show(entry.target, entry, this.observer);
                        eventName = 'show';
                    }
                    else {
                        this.hide(entry.target, entry);
                        eventName = 'hide';
                    }
                    if (this.callbacks && this.callbacks.call)
                        this.callbacks.call(eventName, this.makeResult(entry.target, entry));
                });
            }, this.config);
        }
        else {
            if (this.debug)
                console.log('IntersectionObserver not support');
            if (this.callbacks && this.callbacks.error)
                this.callbacks.error(ErrorState.NotSupport, this.makeResult(container));
            for (const el of targetElements) {
                this.show(el);
            }
        }
        return targetElements.length;
    }
    addMutationObserver(container) {
        if (this.mutationObserver) {
            this.mutationObserver.observe(container, {
                childList: true,
            });
        }
        else {
            this.mutationObserver = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    const removeNodes = mutation.removedNodes;
                    if (removeNodes.length) {
                        for (const node of removeNodes) {
                            const appliedElementIndex = this.appliedElements.findIndex((v) => v === node);
                            this.appliedElements.splice(appliedElementIndex, 1);
                        }
                    }
                }
            });
        }
    }
    getAppliedElements() {
        return this.appliedElements;
    }
    getShowedElements() {
        return this.appliedElements.filter((el) => el.hasAttribute(this.ShowAttr));
    }
    deleteAppliedElement(el) {
        if (!this.observer)
            return;
        const appliedElementIndex = this.appliedElements.findIndex((v) => v === el);
        if (-1 !== appliedElementIndex) {
            this.appliedElements.splice(appliedElementIndex, 1);
            this.observer.unobserve(el);
        }
    }
}

exports.MyLazyLoadElementsErrorState = ErrorState;
exports.MyLazyLoadElementsEventName = EventName;
exports.default = LazyLoadElement;
