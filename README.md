# my-lazyload-elements

## 설치
`
npm i my-lazyload-elements
`

## Attrs
- data-my-lazyload-class
  - 요소가 화면에 표시되거나 가려질 시 toggle 할 클래스명
- data-my-lazyload-style
  - 요소가 화면에 표시되거나 가려질 시 toggle 할 클래스명 스타일
- data-my-lazyload-src
  - 요소가 화면에 표시되면 적용 할 src

## Attr Options
- data-my-lazyload-once
  - 최초 한 번만 이벤트를 발생 시킵니다. (화면에 한 번 표시되면 더 이상 동작하지 않습니다.)

## 사용
``` typescript
const container: Element = document.body;
const myLazyLoadElements = new MyLazyLoadElements(container, {}, {
  error: (state, result?, error?) => {
    if (result?.element instanceof HTMLImageElement) result.element.src = './assets/logo.png';
  },
  ...
});
```

## Examples
  - [vue3](https://github.com/19911121/my-lazyload-elements/tree/main/examples/vite-vue3)