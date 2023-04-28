<!-- @file PC 端图片消息 -->
<template>
  <pc-msg-container
    class="c-pc-image-msg"
    bubble-padding="8px"
  >
    <div
      v-if="chatMsg.isIllegal"
      class="c-pc-image-msg__illegal"
    >
      <pc-icon-forbid class="c-pc-image-msg__illegal__icon" />
      <span>{{ $lang('chat.illegalImage') }}</span>
    </div>
    <div
      v-else
      class="c-pc-image-msg__content"
      :style="wrapStyle"
    >
      <div
        v-if="!isLoaded"
        class="c-pc-image-msg__content__placeholder g-img-cover"
      ></div>
      <img
        ref="imageRef"
        v-show="isLoaded"
        class="c-pc-image-msg__content__img"
        :src="imageUrl"
        :style="imageStyle"
        @load="onImageLoad"
        @click="onClickImage"
      />
    </div>
  </pc-msg-container>
</template>

<script setup lang="ts">
import { PcIconForbid } from '@/components/component-icons/pc/map';
import PcMsgContainer from '../_msg-container/pc-msg-container.vue';
import { useImageMsg } from './use-image-msg';

const { chatMsg, imageRef, imageUrl, wrapStyle, imageStyle, isLoaded, onImageLoad, onClickImage } =
  useImageMsg();
</script>

<style lang="scss">
.c-pc-image-msg__illegal {
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
.c-pc-image-msg__illegal__icon {
  display: flex;
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  font-size: 50px !important;
  line-height: 50px;
  color: red;
}
.c-pc-image-msg__content {
  max-width: 100%;
  overflow: hidden;
}
.c-pc-image-msg__content__placeholder {
  width: 128px;
  height: 72px;
  background-image: url(../_imgs/img-msg-placeholder.png);
}
.c-pc-image-msg__content__img {
  width: auto;
  height: auto;
  object-fit: cover;
  cursor: zoom-in;
}
</style>
