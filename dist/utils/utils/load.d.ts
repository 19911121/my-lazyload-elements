import type { Item } from './item';
interface Callbacks<E extends HTMLElement = HTMLElement> {
    error: (e: Event, item: Item<E>) => void;
    loaded: (e: Event, item: Item<E>) => void;
}
declare const loading: (item: Item) => void;
declare const load: (item: Item) => Promise<void>;
export { loading, load, };
export type { Callbacks };
