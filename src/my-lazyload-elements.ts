import { ErrorState } from "./utils/error";
import { load } from "./utils/load";
import { makeResult } from "./utils/callbacks";
import { Attributes, AttributeSuffixes, getSource, hasOnce } from "./utils/attributes";
import type { CallbackNameKey, CallbackResult, Callbacks, } from "./utils/callbacks";
import type { ErrorStateKey } from "./utils/error";
import type { Item } from "./utils/item";
import { getTargetElements, hide, show } from "./utils/elements";

type Options = IntersectionObserverInit;

export default class LazyLoadElement {
  private observer: IntersectionObserver | null = null;
  private observerOptions: IntersectionObserverInit = {};
  private mutationObserver: MutationObserver | null = null;
  private callbacks: Callbacks = {};
  private appliedElements: Element[] = [];

  constructor(container: Element, options?: IntersectionObserverInit, callbacks?: Callbacks) {
    if (container) this.init(container, options, callbacks);
    else this.callbacks.error?.(new TypeError('container type error'));
  }

  /**
   * lazyload 해제
   */
  public dispose(): void {
    this.resetAppliedElements();

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * 모듈 초기화
   * 
   * @param options {@link IntersectionObserverInit}
   * @param callbacks {@link Callbacks}
   */
  private init(container: Element, options?: IntersectionObserverInit, callbacks?: Callbacks) {
    this.observerOptions = {
      root: options && options.root ? options.root : null,
      rootMargin: options && options.rootMargin ? options.rootMargin : '0px',
      threshold: options && options.threshold ? options.threshold : 0,
    };

    this.setCallbacks(callbacks);
    this.addObserve(container);
    this.addMutationObserver(container);
  }

  /**
   * callbacks 등록
   * 
   * @param callbacks 
   */
  private setCallbacks = (callbacks?: Callbacks) => {
    if (callbacks) {
      for (const [key, value] of Object.entries(callbacks)) {
        this.callbacks[key as keyof Callbacks] = value;
      }
    }
  };

  /**
   * group 여부를 반환합니다.
   * 
   * @param el lazyload가 적용 된 요소
   */
  private isGroup(el: Element) {
    return el.hasAttribute(Attributes.ActiveGroup);
  }

  /**
   * 그룹 내 항목을 화면에 노출합니다.
   * 
   * @param el lazyload가 적용 된 요소
   * @param entry {@link IntersectionObserverEntry}
   * @param observer {@link IntersectionObserver}
   */
  private showGroup(el: Element, entry?: IntersectionObserverEntry, observer?: IntersectionObserver) {
    for (const child of el.children) {
      this.show(child, entry, observer);

      if (child.children.length) this.showGroup(child, entry, observer);
    }
  };

  /**
   * 화면에 노출합니다.
   *
   * @param el 화면에 표시 된 element
   * @param entry {@link IntersectionObserverEntry}
   * @param observer {@link IntersectionObserver}
   */
  private async show(el: Element, entry?: IntersectionObserverEntry, observer?: IntersectionObserver): Promise<void> {
    try {
      show(el);
      
      if (observer && hasOnce(el)) {
        observer.unobserve(el)
        this.deleteAppliedElement(el);
      }

      this.callbacks.show?.(makeResult(el, entry));
    }
    catch (ex) {
      this.callbacks.error?.(ex, makeResult(el, entry));
    }
  }

  /**
   * 그룹 내 항목을 화면에서 감춥니다.
   * 
   * @param el lazyload가 적용 된 요소
   * @param entry {@link IntersectionObserverEntry}
   * @param observer {@link IntersectionObserver}
   */
  private hideGroup(el: Element, entry?: IntersectionObserverEntry) {
    for (const child of el.children) {
      this.hide(child, entry);

      if (child.children.length) this.hideGroup(child, entry);
    }
  };

  /**
   * 화면에서 감춥니다.
   * 
   * @param el lazyload가 적용 된 요소
   * @param entry 
   */
  private hide(el: Element, entry?: IntersectionObserverEntry) {
    const showed = el.hasAttribute(Attributes.Show);

    console.log('showed: ', showed, el);
    
    hide(el);

    if (showed) this.callbacks.hide?.(makeResult(el, entry));
  }

  // #region observer
  /**
   * container 내 감시 할 요소 등록
   *
   * @param container
   */
  public addObserve(container: Element) {
    const targetElements = getTargetElements(container);

    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(this.observerHandler, this.observerOptions);
      this.addAppliedElements(targetElements);
    }
    else {
      this.callbacks.error?.(ErrorState.NotSupport, makeResult(container));

      for (const el of targetElements) {
        if (this.isGroup(el)) this.showGroup(el);
        else this.show(el);
      }
    }
  }

  /**
   * observer 콜백 핸들러
   * 
   * @param entries 
   */
   private observerHandler = (entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      let eventName: CallbackNameKey;

      if (!this.observer) return;
      if (entry.isIntersecting) {
        if (this.isGroup(entry.target)) this.showGroup(entry.target, entry, this.observer);
        else this.show(entry.target, entry, this.observer);

        eventName = 'show';
      }
      else {
        if (this.isGroup(entry.target)) this.hideGroup(entry.target, entry);
        else this.hide(entry.target, entry);
        
        eventName = 'hide';
      }

      this.callbacks.call?.(eventName, makeResult(entry.target, entry));
    }
  };

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
          for (const node of mutation.removedNodes) {
            if (node instanceof Element) this.deleteAppliedElement(node);
          }
        }
      });
    }
  }
  // #endregion

  // #region targetElements
  /**
   * lazyload가 적용 되어 있는 요소 목록을 반환합니다.
   */
  public getAppliedElements(): Element[] {
    return this.appliedElements;
  }

  /**
   * 현재 노출되어 있는 element 목록을 반환합니다.
   */
  public getShowedElements(): Element[] {
    return this.appliedElements.filter((el) => el.hasAttribute(Attributes.Show));
  }

  /**
   * 적용 목록에 요소들 추가 
   * 
   * @param els lazyload가 적용 할 요소들
   */
  private addAppliedElements = (els: Element[]) => {
    for (const el of els) {
      this.addAppliedElement(el);
    }
  };

  /**
   * 적용 목록에 요소 추가
   * 
   * @param el lazyload가 적용 할 요소
   */
  private addAppliedElement = (el: Element) => {
    if (!this.observer) return;

    // 이미 등록되어 있는 경우 위치 변동이 있을 수도 있으므로 삭제 후 재등록
    this.deleteAppliedElement(el);
    this.appliedElements.push(el);
    this.observer.observe(el);

    el.setAttribute(Attributes.Hide, '');
  }; 

  /**
   * 적용 목록에서 제거
   * 
   * @param el lazyload가 적용 된 요소
   */
  private deleteAppliedElement = (el: Element) => {
    const appliedElementIndex = this.appliedElements.findIndex((v) => v === el);

    if (-1 !== appliedElementIndex) this.appliedElements.splice(appliedElementIndex, 1);
  };

  /**
   * 적용된 element 목록을 초기화 합니다.
   */
  private resetAppliedElements = () => {
    if (this.appliedElements.length) {
      for (const el of this.appliedElements) {
        el.removeAttribute(Attributes.Show);
        el.removeAttribute(Attributes.Hide);
      }
    }

    this.appliedElements = [];
  };
  // #endregion
}

export {
  ErrorState as MyLazyLoadElementsErrorState,
};

export type {
  Options as MyLazyLoadElementsOptions,
  CallbackNameKey as MyLazyLoadElementsEventNameKey,
  ErrorStateKey as MyLazyLoadElementsErrorStateKey,
  CallbackResult as MyLazyLoadElementsLazyLoadElementResult,
  Callbacks as MyLazyLoadElementsCallbacks,
};