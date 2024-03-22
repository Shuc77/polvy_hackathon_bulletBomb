<!-- @file PC 端表情消息 -->
<template>
  <pc-msg-container
    class="c-pc-emotion-msg"
    :bubble-model="false"
    :suffix-mode="'align-center'"
  >
    <div
      v-if="!isLoaded"
      class="c-pc-emotion-msg__placeholder g-img-cover"
    ></div>
    <img
      v-show="isLoaded"
      class="c-pc-emotion-msg__img"
      :src="emotionUrl"
      @load="onImgLoad"
      @click="onClickEmotion"
    />
    <template #suffix>
      <msg-status-suffix></msg-status-suffix>
    </template>
  </pc-msg-container>
</template>

<script setup lang="ts">
import PcMsgContainer from '../_msg-container/pc-msg-container.vue';
import { useEmotionMsg } from './use-emotion-msg';
import MsgStatusSuffix from '../msg-status-suffix/msg-status-suffix.vue';

const { emotionUrl, isLoaded, onImgLoad, onClickEmotion } = useEmotionMsg();
</script>

<style lang="scss">
$--emotion-size: 80px;

.c-pc-emotion-msg__placeholder {
  width: $--emotion-size;
  height: $--emotion-size;
  background-image: url(../_imgs/img-msg-placeholder.png);
}

.c-pc-emotion-msg__img {
  width: $--emotion-size;
  height: $--emotion-size;
  object-fit: contain;
  cursor: zoom-in;
}
</style>
