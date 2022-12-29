import type { ErrorStateKey } from "./error";

const CallbackNames = {
  /** 에러 */
  Error: 'error',
  /** 호출 */
  Call: 'call',
  /** 보여짐 */
  Show: 'show',
  /** 가려짐 */
  Hide: 'hide',
} as const;
type CallbackNameKey = typeof CallbackNames[keyof typeof CallbackNames];

interface CallbackResult<E extends Element = Element> {
  /** 이벤트가 발생 한 요소 */
  element?: E;
  isIntersecting: boolean;
  intersectionRatio: number;
}

/** 
 * 요소가 화면에서 표시되었습니다.
 * 
 * @param result {@link CallbackResult}
 */
type ShowEvent<E extends Element = Element> = (result?: CallbackResult<E>) => void;

/** 
 * 요소가 화면에서 가려졌습니다.
 * 
 * @param result {@link CallbackResult}
 */
type HideEvent<E extends Element = Element> = (result?: CallbackResult<E>) => void;

/**
 * 요소에 대하여 이벤트가 발생하였습니다.
 * 
 * @param eventName {@link CallbackNames}
 * @param result {@link CallbackResult}
 */
type CallEvent<E extends Element = Element> = (eventName: CallbackNameKey, result?: CallbackResult<E>) => void;

/**
 * 요소에 대하여 에러가 발생하였습니다.
 * 
 * @param state {@link ErrorStateKey}
 * @param result {@link CallbackResult}
 * @param error 
 */
type ErrorEvent<E extends Element = Element> = (error?: unknown, result?: CallbackResult<E>) => void;

interface Callbacks <E extends Element = Element> {
  show?: ShowEvent<E>;
  hide?: HideEvent<E>;
  call?: CallEvent<E>;
  error?: ErrorEvent<E>;
}

/**
 * callback 결과물을 생성합니다.
 *
 * @param element
 * @param entry
 */
const makeResult = (element: Element, entry?: IntersectionObserverEntry) => {
  return {
    element,
    isIntersecting: entry ? entry.isIntersecting : false,
    intersectionRatio: entry ? entry.intersectionRatio : -1,
  };
};

export {
  CallbackNames,
  makeResult,
};

export type {
  CallbackNameKey,
  Callbacks,
  CallbackResult
};