import type { Item } from "./item";
declare const AttributePrefix = "data-my-lazy-";
declare const AttributeSuffixes: {
    readonly Source: "src";
    readonly Class: "class";
    readonly Once: "once";
    readonly Loading: "loading";
};
declare const Attributes: {
    readonly Active: "my-lazy";
    readonly ActiveGroup: "my-lazy-group";
    readonly Show: "my-lazy-show";
    readonly Hide: "my-lazy-hide";
};
declare const getSource: (el: Element) => string | null;
declare const hasOnce: (el: Element) => boolean;
declare const setAttributes: (el: Element) => void;
declare const setAttribute: (item: Item) => void;
declare const removeAttributes: (el: Element) => void;
declare const removeAttribute: (item: Item) => void;
export { getSource, hasOnce, setAttribute, setAttributes, removeAttribute, removeAttributes, };
export { AttributePrefix, AttributeSuffixes, Attributes, };
