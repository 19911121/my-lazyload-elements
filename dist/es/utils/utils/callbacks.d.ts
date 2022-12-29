declare const CallbackNames: {
    readonly Error: "error";
    readonly Call: "call";
    readonly Show: "show";
    readonly Hide: "hide";
};
declare type CallbackNameKey = typeof CallbackNames[keyof typeof CallbackNames];
interface CallbackResult<E extends Element = Element> {
    element?: E;
    isIntersecting: boolean;
    intersectionRatio: number;
}
declare type ShowEvent<E extends Element = Element> = (result?: CallbackResult<E>) => void;
declare type HideEvent<E extends Element = Element> = (result?: CallbackResult<E>) => void;
declare type CallEvent<E extends Element = Element> = (eventName: CallbackNameKey, result?: CallbackResult<E>) => void;
declare type ErrorEvent<E extends Element = Element> = (error?: unknown, result?: CallbackResult<E>) => void;
interface Callbacks<E extends Element = Element> {
    show?: ShowEvent<E>;
    hide?: HideEvent<E>;
    call?: CallEvent<E>;
    error?: ErrorEvent<E>;
}
declare const makeResult: (element: Element, entry?: IntersectionObserverEntry) => {
    element: Element;
    isIntersecting: boolean;
    intersectionRatio: number;
};
export { CallbackNames, makeResult, };
export type { CallbackNameKey, Callbacks, CallbackResult };
