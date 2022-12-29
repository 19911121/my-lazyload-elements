# my-lazyload-elements

## 설치
`
npm i my-lazyload-elements
`

## Attributes
- data-my-lazy-class
  - 요소가 화면에 표시되거나 가려질 시 toggle 할 클래스명
- data-my-lazy-style
  - 요소가 화면에 표시되거나 가려질 시 toggle 할 클래스명 스타일
- data-my-lazy-src
  - 요소가 화면에 표시되면 적용 할 src
- data-my-lazy-*
  - 요소가 보여지고 가려질 때 마다 *에 해당하는 속성 토글
  - ex) data-my-lazy-test="123" -> 요소 노출 시 <div test="123"></div>

**image 전용**
- data-my-lazy-loading 
  - source 이미지가 불러와질 동안 표시 할 이미지

## Attributes Options
- data-my-lazy-once
  - 최초 한 번만 이벤트를 발생 시킵니다. (화면에 한 번 표시되면 더 이상 동작하지 않습니다.)

## 사용
``` html
  <!-- my-lazy-group -->
  <!-- 여러 요소가 묶여 있는 경우 -->
  <figure 
    class="example__image__box"
    my-lazy-group  
  >
    <picture>
      <source
        media="(min-width: 360px)"
        data-my-lazy-srcset="/samples/1@1x.png"
      >
      <source
        media="(min-width: 480px)"
        data-my-lazy-srcset="/samples/1@2x.png"
      >
      <source
        media="(min-width: 800px)"
        data-my-lazy-srcset="/samples/1@3x.png"
      >
      <img
        class="example__image"
        alt="1 번째 OOO 이미지"
        data-my-lazy-loading="/samples/1-blur.png"
        data-my-lazy-src="/samples/1.png"
        data-my-lazy-style="border: 1px solid green"
        data-my-lazy-class="example__image--show"
      >
    </picture>
    <figcaption>보여주기 위한 샘플 이미지 입니다.</figcaption>
  </figure>

  <!-- my-lazy -->
  <!-- 단일 요소로 있는 경우 -->
  <figure class="example__image__box">
    <img
      class="example__image"
      alt="1 번째 OOO 이미지"
      data-my-lazy-loading="/samples/1-blur.png"
      data-my-lazy-src="/samples/1.png"
      data-my-lazy-style="border: 1px solid green"
      data-my-lazy-class="example__image--show"
      my-lazy
    >
    <figcaption>보여주기 위한 샘플 이미지 입니다.</figcaption>
  </figure>
```

``` typescript
const container: Element = document.body;
const myLazyLoadElements = new MyLazyLoadElements(container, {}, {
  error: (error, result) => {
    if (result?.element instanceof HTMLImageElement) result.element.src = './assets/logo.png';
  },
  ...
});
```

## Examples
  - [vue3](https://github.com/19911121/my-lazyload-elements/tree/main/examples/vite-vue3)