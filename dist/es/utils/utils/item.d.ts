interface Item<E extends Element = Element> {
    el: E;
    key: string;
    value: string;
    entry?: IntersectionObserverEntry;
    observer?: IntersectionObserver;
}
declare const isImageItem: (item: Item) => item is Item<HTMLImageElement>;
export { isImageItem };
export type { Item };
