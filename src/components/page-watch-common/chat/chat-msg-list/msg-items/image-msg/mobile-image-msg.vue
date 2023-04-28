<!-- @file 移动端图片消息 -->
<template>
  <mobile-msg-container
    class="c-mobile-image-msg"
    bubble-padding="8px"
  >
    <div
      v-if="chatMsg.isIllegal"
      class="c-mobile-image-msg__illegal"
    >
      <mobile-icon-forbid class="c-mobile-image-msg__illegal__icon" />
      <span>{{ $lang('chat.illegalImage') }}</span>
    </div>
    <div
      v-else
      class="c-mobile-image-msg__content"
      :style="wrapStyle"
    >
      <div
        v-if="!isLoaded"
        class="c-mobile-image-msg__content__placeholder g-img-cover"
      ></div>
      <img
        ref="imageRef"
        v-show="isLoaded"
        class="c-mobile-image-msg__content__img"
        :src="imageUrl"
        :style="imageStyle"
        @load="onImageLoad"
        @click="onClickImage"
      />
    </div>
  </mobile-msg-container>
</template>

<script setup lang="ts">
import { MobileIconForbid } from '@/components/component-icons/mobile/map';
import MobileMsgContainer from '../_msg-container/mobile-msg-container.vue';
import { useImageMsg } from './use-image-msg';

const { chatMsg, imageRef, imageUrl, wrapStyle, imageStyle, isLoaded, onImageLoad, onClickImage } =
  useImageMsg();
</script>

<style lang="scss">
.c-mobile-image-msg__illegal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 150px;
  max-width: 100%;
  height: 100px;
  color: $--color-white;
  background: $--color-black;
}
.c-mobile-image-msg__illegal__icon {
  display: flex;
  flex-shrink: 0;
  font-size: 50px !important;
  line-height: 50px;
  color: red;
}
.c-mobile-image-msg__content {
  max-width: 100%;
  overflow: hidden;
}
.c-mobile-image-msg__content__placeholder {
  width: 128px;
  height: 72px;
  background-image: url(../_imgs/img-msg-placeholder.png);
}
.c-mobile-image-msg__content__img {
  width: auto;
  height: auto;
  object-fit: cover;
}
</style>
