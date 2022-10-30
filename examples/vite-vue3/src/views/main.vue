<template>
  <main>
    <h1>
      LazyLoad Test
    </h1>
    <ul>
      <li
        v-for="n of 100"
        :key="n"
        v-mylazy
      >
        {{ n }}
        <img
          class="img"
          :alt="`${n} 번째 OOO 이미지`"
          my-lazyload
          data-my-lazyload-src="asdasdas"
          data-my-lazyload-style="border: 1px solid #000"
          data-my-lazyload-class="testtest"
        >
      </li>
    </ul>
  </main>
</template>
<script setup lang="ts">

</script>

<style lang="scss" scoped>
  .img {
    height: 50px;
  }
</style>