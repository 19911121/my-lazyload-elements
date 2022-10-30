declare const EventName: {
    readonly Error: "error";
    readonly Call: "call";
    readonly Show: "show";
    readonly Hide: "hide";
};
declare type EventNameKey = typeof EventName[keyof typeof EventName];
declare const ErrorState: {
    NotSupport: string;
    MissingContainer: string;
    InvalidContainerType: string;
    LoadFail: string;
};
declare type ErrorStateKey = typeof ErrorState[keyof typeof ErrorState];
interface Options {
    root?: Element;
    rootMargin?: string;
    threshold?: number[];
}
interface LazyLoadElementResult {
    element?: Element;
    isIntersecting: boolean;
    intersectionRatio: number;
}
interface Callbacks {
    show?(result?: LazyLoadElementResult): void;
    hide?(result?: LazyLoadElementResult): void;
    call?(eventName: EventNameKey, result?: LazyLoadElementResult): void;
    error?(state: ErrorStateKey, result?: LazyLoadElementResult, error?: unknown): void;
}
export default class LazyLoadElement {
    private readonly ActiveAttr;
    private readonly ShowAttr;
    private readonly HideAttr;
    private observer;
    private mutationObserver;
    private debug;
    private config;
    private callbacks;
    private appliedElements;
    constructor(container: Element, options?: Options, callbacks?: Callbacks);
    dispose(): void;
    private init;
    private getTargetElements;
    private makeResult;
    private show;
    private hide;
    addObserve(container: Element): number;
    private addMutationObserver;
    getAppliedElements(): Element[];
    getShowedElements(): Element[];
    private deleteAppliedElement;
    private disposeAppliedElements;
}
export { EventName as MyLazyLoadElementsEventName, ErrorState as MyLazyLoadElementsErrorState, };
export type { EventNameKey as MyLazyLoadElementsEventNameKey, ErrorStateKey as MyLazyLoadElementsErrorStateKey, Options as MyLazyLoadElementsOptions, LazyLoadElementResult as MyLazyLoadElementsLazyLoadElementResult, Callbacks as MyLazyLoadElementsCallbacks };
