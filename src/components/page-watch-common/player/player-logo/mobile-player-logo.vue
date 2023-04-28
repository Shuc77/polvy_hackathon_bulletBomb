<!-- @file 移动端播放器 logo -->
<template>
  <div
    class="c-mobile-player-logo"
    :class="{
      [`c-mobile-player-logo--${logoPosition}`]: true,
    }"
    :style="{
      opacity: logoOpacity,
    }"
  >
    <img
      class="c-mobile-player-logo__img"
      :src="logoImage"
    />

    <a
      v-if="logoHref"
      :href="logoHref"
      class="c-mobile-player-logo__href"
      target="_blank"
    ></a>
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { logoImage, logoHref, logoOpacity, logoPosition } = storeDefinitionToRefs(usePlayerStore);
</script>

<style lang="scss">
.c-mobile-player-logo {
  position: absolute;
  z-index: 305;
  min-width: 15%;
  max-width: 25%;
}
.c-mobile-player-logo__img {
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: 100%;
}
.c-mobile-player-logo--tl {
  top: 20px;
  left: 20px;
}
.c-mobile-player-logo--tr {
  top: 15px;
  right: 15px;
}
.c-mobile-player-logo--bl {
  bottom: 15px;
  left: 15px;
}
.c-mobile-player-logo--br {
  right: 15px;
  bottom: 15px;
}
.c-mobile-player-logo__href {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
