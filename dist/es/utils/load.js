const AttributePrefix = 'data-my-lazy-';
const AttributeSuffixes = {
    Source: 'src',
    Class: 'class',
    Once: 'once',
    Loading: 'loading',
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

export { load, loading };
