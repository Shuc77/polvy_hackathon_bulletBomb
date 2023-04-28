<!-- @file 移动端表情消息 -->
<template>
  <mobile-msg-container
    class="c-mobile-emotion-msg"
    :bubble-model="false"
  >
    <div
      v-if="!isLoaded"
      class="c-mobile-emotion-msg__placeholder g-img-cover"
    ></div>
    <img
      v-show="isLoaded"
      class="c-mobile-emotion-msg__img"
      :src="emotionUrl"
      @load="onImgLoad"
      @click="onClickEmotion"
    />
  </mobile-msg-container>
</template>

<script setup lang="ts">
import MobileMsgContainer from '../_msg-container/mobile-msg-container.vue';
import { useEmotionMsg } from './use-emotion-msg';

const { emotionUrl, isLoaded, onImgLoad, onClickEmotion } = useEmotionMsg();
</script>

<style lang="scss">
$--emotion-size: 80px;

.c-mobile-emotion-msg__placeholder {
  width: $--emotion-size;
  height: $--emotion-size;
  background-image: url(../_imgs/img-msg-placeholder.png);
}

.c-mobile-emotion-msg__img {
  width: $--emotion-size;
  height: $--emotion-size;
  object-fit: contain;
  cursor: zoom-in;
}
</style>
