<template>
  <main>
    <section
      class="example__conatiner"
      aria-labelledby="example__heading"
    >
      <h2 
        id="example__heading"
        class="example__heading"
      >
        lazyload Test
      </h2>
      <ul>
        <li
          v-for="n in 7"
          :key="n"
          v-my-lazy
        >
          <figure class="example__image__box">
            <picture
              my-lazy-group
            >
              <!-- <source
                media="(min-width: 360px)"
                :data-my-lazy-srcset="`/samples/${n}@1x.png`"
              >
              <source
                media="(min-width: 480px)"
                :data-my-lazy-srcset="`/samples/${n}@2x.png`"
              >
              <source
                media="(min-width: 800px)"
                :data-my-lazy-srcset="`/samples/${n}@3x.png`"
              > -->
              <img
                class="example__image"
                :alt="`${n} 번째 OOO 이미지`"
                :data-my-lazy-loading="`/samples/${n}-blur.png`"
                :data-my-lazy-src="`/samples/${n}.png`"
                data-my-lazy-style="border: 1px solid green"
                data-my-lazy-class="example__image--show"
              >
            </picture>
            <figcaption>{{ n }} 번째 OOO 이미지</figcaption>
          </figure>
        </li>
      </ul>
    </section>
  </main>
</template>
<script setup lang="ts">

</script>

<style lang="scss" scoped>
  .example {
    &__image {
      width: 100%;
      height: 100%;

      &__box {
        width: 300px;
        aspect-ratio: 1 / 1;
      }

      &--show {
        border-radius: 10px;
      }
    }
  }

  .img {
    height: 50px;
  }
</style>