<!-- @file 竖屏端图片消息 -->
<template>
  <portrait-msg-container class="c-portrait-image-msg">
    <div
      v-if="chatMsg.isIllegal"
      class="c-portrait-image-msg__illegal"
    >
      <mobile-icon-forbid class="c-portrait-image-msg__illegal__icon" />
      <span>{{ $lang('chat.illegalImage') }}</span>
    </div>
    <template v-else>
      <template v-if="!isLoaded">
        <!-- 默认占位图 -->
        <div
          v-if="!localImagePlaceholder"
          class="c-portrait-image-msg__placeholder g-img-cover"
        ></div>
        <!-- 本地上传图片后，消息替换时用的占位图 -->
        <img
          v-else
          class="c-portrait-image-msg__img"
          :src="imageUrl"
          @click="onClickImage"
        />
      </template>

      <!-- 本地上传缓存图片 / 服务端图片 -->
      <img
        v-show="isLoaded"
        ref="imageRef"
        class="c-portrait-image-msg__img"
        :src="imageUrl"
        @load="onImageLoad"
        @click="onClickImage"
      />
    </template>
  </portrait-msg-container>
</template>

<script setup lang="ts">
import { MobileIconForbid } from '@/components/component-icons/mobile/map';
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';
import { useImageMsg } from './use-image-msg';

const {
  chatMsg,
  imageUrl,
  localImagePlaceholder,
  isLoaded,
  imageRef,

  onImageLoad,
  onClickImage,
} = useImageMsg();
</script>

<style lang="scss">
$--image-size: 80px;

.c-portrait-image-msg__illegal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: $--image-size;
  height: $--image-size;
  margin-top: 4px;
  font-size: 12px;
  color: $--color-white;
  background: $--color-black;
}
.c-portrait-image-msg__illegal__icon {
  display: flex;
  flex-shrink: 0;
  font-size: 30px !important;
  color: red;
}

.c-portrait-image-msg__placeholder {
  width: $--image-size;
  height: $--image-size;
  margin: 4px 0;
  background-image: url(../_imgs/img-msg-placeholder.png);
  border-radius: 4px;
}

.c-portrait-image-msg__img {
  display: block;
  max-width: $--image-size;
  max-height: $--image-size;
  margin: 4px 0;
  object-fit: contain;
  border-radius: 4px;
}
</style>
