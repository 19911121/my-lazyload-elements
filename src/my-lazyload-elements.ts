/**
 * Copyright (c) 2017
 *
 * lazyload-element.ts
 * dom element lazy load
 *
 * @author KimMinSoo
 * @date 2018/10/11
 */

/** 이벤트명 코드 */
const EventName = {
  Error: 'error',
  Call: 'call',
  Show: 'show',
  Hide: 'hide',
} as const;
type EventNameKey = typeof EventName[keyof typeof EventName];

/** 에러 상태코드 */
const ErrorState = {
  NotSupport: 'NotSupport',
  MissingContainer: 'MissingContainer',
  InvalidContainerType: 'InvalidContainerType',
  LoadFail: 'LoadFail',
};
type ErrorStateKey = typeof ErrorState[keyof typeof ErrorState];

/** 옵션 */
interface Options {
  root?: Element;
  rootMargin?: string;
  threshold?: number[];
}

/** 이벤트 요소 반환 결과 값 */
interface LazyLoadElementResult {
  /** 이벤트가 발생 한 요소 */
  element?: Element;
  isIntersecting: boolean;
  intersectionRatio: number;
}

/** cb */
interface Callbacks {
  /** 요소가 화면에 표시되었습니다. */
  show?(result?: LazyLoadElementResult): void;
  /** 요소가 화면에서 가려졌습니다. */
  hide?(result?: LazyLoadElementResult): void;
  /** 요소에 대하여 이벤트가 발생하였습니다. */
  call?(eventName: EventNameKey, result?: LazyLoadElementResult): void;
  /** 요소에 대하여 에러가 발생하였습니다. */
  error?(state: ErrorStateKey, result?: LazyLoadElementResult, error?: unknown): void;
}

export default class LazyLoadElement {
  private readonly ActiveAttr = 'my-lazyload';
  private readonly ShowAttr = 'my-lazyload-show';
  private readonly HideAttr = 'my-lazyload-hide';

  private observer: IntersectionObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private debug = false;
  private config: IntersectionObserverInit = {};
  private callbacks: Callbacks = {};
  private appliedElements: Element[] = [];

  constructor(container: Element, options?: Options, callbacks?: Callbacks) {
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

  public dispose(): void {
    if (this.observer) {
      this.disposeAppliedElements();
      this.observer.disconnect();
      this.observer = null;
    }
  }

  // #region 공통
  /**
   * 모듈 초기화
   * 
   * @param options 
   * @param callbacks 
   */
  private init(options?: Options, callbacks?: Callbacks) {
    this.config = {
      root: options && options.root ? options.root : null,
      rootMargin: options && options.rootMargin ? options.rootMargin : '0px',
      threshold: options && options.threshold ? options.threshold : 0.01,
    };

    if (callbacks?.show) this.callbacks.show = callbacks.show;
    if (callbacks?.hide) this.callbacks.hide = callbacks.hide;
    if (callbacks?.call) this.callbacks.call = callbacks.call;
    if (callbacks?.error) this.callbacks.error = callbacks.error;
  }

  /**
   * container 내 lazyload를 적용 할 요소 반환 
   *
   * @param container lazyload 적용 할 부모 영역
   */
  private getTargetElements(container: Element): Element[] {
    let elements: Element[] = [];

    if (container) {
      if (container instanceof Element) {
        elements = Array.from(container.querySelectorAll(`[${this.ActiveAttr}]:not([${this.ShowAttr}]):not([${this.HideAttr}])`));
      }
      else {
        if (this.callbacks && this.callbacks.error) this.callbacks.error(ErrorState.InvalidContainerType, this.makeResult(container));
      }
    }
    else {
      elements = Array.from(document.querySelectorAll(`[${this.ActiveAttr}]:not([${this.ShowAttr}]):not([${this.HideAttr}])`));
    }

    return elements;
  }

  /**
   * callback에 반환 할 결과물을 생성합니다.
   *
   * @param element
   * @param entry
   */
  private makeResult(element: Element, entry?: IntersectionObserverEntry): LazyLoadElementResult {
    return {
      element,
      isIntersecting: entry ? entry.isIntersecting : false,
      intersectionRatio: entry ? entry.intersectionRatio : -1,
    };
  }

  /**
   * 화면에 노출합니다.
   *
   * @param element 화면에 표시 된 element
   * @param entry
   * @param observer
   */
  private show(element: Element, entry?: IntersectionObserverEntry, observer?: IntersectionObserver): void {
    if (element.getAttribute(this.ShowAttr)) return;

    /**
     * error handler
     * 
     * @param e
     */
    const errorHandler = (e: Event) => {
      element.removeEventListener('error', errorHandler);

      if (this.callbacks.error) this.callbacks.error(ErrorState.LoadFail, this.makeResult(element, entry), e);
    }

    for (const attr of element.attributes) {
      if (attr.nodeName.match(/data-my-lazyload/)) {
        const key = attr.nodeName.replace(/data-my-lazyload-/, '');
        const value = element.getAttribute(attr.nodeName) ?? '';

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
          // #region options
          case 'once':
            if (observer) this.deleteAppliedElement(element); 

            break;
          // #endregion
          default:
            console.warn('정의되지 않은 attribute 입니다.', key, value);

            break;
        }
      }
    }

    element.removeAttribute(this.HideAttr);
    element.setAttribute(this.ShowAttr, '');

    if (this.callbacks && this.callbacks.show) this.callbacks.show(this.makeResult(element, entry));
  }

  /**
   * 화면에서 감춥니다.
   * 
   * @param element
   * @param entry 
   */
  private hide(element: Element, entry: IntersectionObserverEntry) {
    const showed = element.hasAttribute(this.ShowAttr);

    for (const attr of element.attributes) {
      if (attr.nodeName.match(/data-my-lazyload/)) {
        const key = attr.nodeName.replace(/data-my-lazyload-/, '');
        const value = element.getAttribute(attr.nodeName) ?? '';

        switch (key) {
          case 'class':
            element.classList.remove(value);
            break;
          case 'style':
            element.setAttribute(key, (element.getAttribute('style') ?? '').replace(value, ''));
            break;
        }
      }
    }

    element.removeAttribute(this.ShowAttr);
    element.setAttribute(this.HideAttr, '');

    if (showed && this.callbacks && this.callbacks.hide) this.callbacks.hide(this.makeResult(element, entry));
  }
  // #endregion

  // #region observer
  /**
   * container 내 감시 할 요소 등록
   *
   * @param container
   */
  public addObserve(container: Element): number {
    const targetElements = this.getTargetElements(container);

    if ('IntersectionObserver' in window) {
      if (this.debug) console.log('IntersectionObserver support');

      for (const el of targetElements) {
        // samsung browser error
        setTimeout(() => {
          el.setAttribute(this.HideAttr, '');

          const appliedElementIndex = this.appliedElements.findIndex((v) => v === el);

          // 옵저버 존재 시 주시목록에 등록
          if (this.observer) this.observer.observe(el);

          // 이미 등록되어 있는 경우 위치 변동이 있을 수도 있으므로 삭제 후 재등록
          if (-1 !== appliedElementIndex) this.appliedElements.splice(appliedElementIndex, 1);

          this.appliedElements.push(el);
        }, 1);
      }

      this.observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          let eventName: EventNameKey;

          if (!this.observer) return;
          if (entry.isIntersecting) {
            this.show(entry.target, entry, this.observer);
            eventName = 'show';
          }
          else {
            this.hide(entry.target, entry);
            eventName = 'hide';
          }

          if (this.callbacks && this.callbacks.call) this.callbacks.call(eventName, this.makeResult(entry.target, entry));
        });
      }, this.config);
    }
    else {
      if (this.debug) console.log('IntersectionObserver not support');
      if (this.callbacks && this.callbacks.error) this.callbacks.error(ErrorState.NotSupport, this.makeResult(container));

      for (const el of targetElements) {
        this.show(el);
      }
    }

    return targetElements.length;
  }

  /**
   * container에 대한 MutationObserver 등록
   * 요소가 삭제되었을 경우 appliedElements에서 제거하기 위해 사용
   *
   * @param container
   */
  private addMutationObserver(container: Element) {
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
  // #endregion

  // #region appliedElements
  /**
   * lazyload 적용 되어 있는 요소 목록을 반환합니다.
   */
  public getAppliedElements(): Element[] {
    return this.appliedElements;
  }

  /**
   * 현재 노출되어 있는 element 목록을 반환합니다.
   */
  public getShowedElements(): Element[] {
    return this.appliedElements.filter((el) => el.hasAttribute(this.ShowAttr));
  }

  /**
   * 적용 된 element의 lazyload를 삭제 및 해제합니다.
   * 
   * @param el 
   */
  private deleteAppliedElement(el: Element) {
    if (!this.observer) return;

    const appliedElementIndex = this.appliedElements.findIndex((v) => v === el);

    if (-1 !== appliedElementIndex) {
      this.appliedElements.splice(appliedElementIndex, 1);
      this.observer.unobserve(el);
    }
  }

  /**
   * 적용된 element의 lazyload를 해제합니다.
   */
  private disposeAppliedElements = () => {
    if (this.appliedElements.length) {
      for (const el of this.appliedElements) {
        el.removeAttribute(this.ShowAttr);
        el.removeAttribute(this.HideAttr);
      }
    }

    this.appliedElements = [];
  };
  // #endregion
}

export {
  EventName as MyLazyLoadElementsEventName,
  ErrorState as MyLazyLoadElementsErrorState,
};

export type {
  EventNameKey as MyLazyLoadElementsEventNameKey,
  ErrorStateKey as MyLazyLoadElementsErrorStateKey,
  Options as MyLazyLoadElementsOptions,
  LazyLoadElementResult as MyLazyLoadElementsLazyLoadElementResult,
  Callbacks as MyLazyLoadElementsCallbacks
};