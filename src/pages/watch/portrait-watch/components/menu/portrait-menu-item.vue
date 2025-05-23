<!-- @file 移动端更多面板节点 -->
<template>
  <li
    class="c-portrait-more-item"
    :class="{
      'c-portrait-more-item--dotted': dotted,
    }"
    @click="emit('click')"
  >
    <div
      class="c-portrait-more-item__icon"
      :class="{
        [`c-portrait-more-item__icon--${icon}`]: true,
      }"
    ></div>

    <div class="c-portrait-more-item__text">{{ text }}</div>
  </li>
</template>

<script setup lang="ts">
import { emitFunc } from '@/assets/utils/vue-utils/emit-utils';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';

defineProps({
  /** 图片 */
  icon: PropUtils.string.isRequired,
  /** 文字 */
  text: PropUtils.string.isRequired,
  /** 是否显示红点，默认：false */
  dotted: PropUtils.bool.def(false),
});

const emit = defineEmits({
  click: emitFunc<void>(),
});
</script>

<style lang="scss">
.c-portrait-more-item {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 20%;
  padding-top: 10px;
}

.c-portrait-more-item__icon {
  position: relative;
  width: 32px;
  height: 32px;
  margin-bottom: 10px;
  background-repeat: no-repeat;
  background-size: 100%;
}
.c-portrait-more-item__icon--profile {
  background-image: url(./images/icon-profile.png);
}
.c-portrait-more-item__icon--only-special {
  background-image: url(./images/icon-only-host.png);
}
.c-portrait-more-item__icon--look-all {
  background-image: url(./images/icon-show-all.png);
}
.c-portrait-more-item__icon--feedback {
  background-image: url(./images/icon-feedback.png);
}
.c-portrait-more-item__icon--score {
  background-image: url(./images/icon-score-withdraw.png);
}
.c-portrait-more-item__icon--hide-donate {
  background-image: url(./images/icon-donate-hide.png);
}
.c-portrait-more-item__icon--show-donate {
  background-image: url(./images/icon-donate-show.png);
}
.c-portrait-more-item__icon--question-answer {
  background-image: url(./images/icon-qa.png);
}
.c-portrait-more-item__icon--withdraw {
  background-image: url(./images/icon-withdraw.png);
}
.c-portrait-more-item__icon--line-setting {
  background-image: url(./images/icon-set-line.png);
}
.c-portrait-more-item__icon--quality-setting {
  background-image: url(./images/icon-set-level.png);
}
.c-portrait-more-item__icon--rate-setting {
  background-image: url(./images/icon-rate.png);
}
.c-portrait-more-item__icon--latency-setting {
  background-image: url(./images/icon-set-latency.png);
}
.c-portrait-more-item__icon--audio {
  background-image: url(./images/icon-audio.png);
}
.c-portrait-more-item__icon--video {
  background-image: url(./images/icon-video.png);
}
.c-portrait-more-item__icon--stream-track {
  background-image: url(./images/icon-track.png);
}
.c-portrait-more-item__icon--stream-track-normal {
  background-image: url(./images/icon-track-normal.svg);
}

.c-portrait-more-item__icon--language {
  background-image: url(./images/icon-language.svg);
}
.c-portrait-more-item__icon--set-nick {
  background-image: url(./images/icon-set-nick.png);
}
.c-portrait-more-item__icon--my-reward {
  background-image: url(./images/icon-my-reward.svg);
}
.c-portrait-more-item__icon--bind-mobile {
  background-image: url(./images/icon-bind-mobile.svg);
}
.c-portrait-more-item__icon--send-image {
  background-image: url(./images/icon-send-image.png);
}
.c-portrait-more-item__icon--send-redpack {
  // background-image: url(../images/icon-menu-redenvelope-mob.png);
  background: red;
}

.c-portrait-more-item__icon--pip {
  background-image: url(./images/icon-pip.png);
}

.c-portrait-more-item__icon--playback-setting {
  background-image: url(./images/icon-playback-setting.png);
}

.c-portrait-more-item__icon--coupon {
  background-image: url(./images/icon-menu-coupon.png);
}

.c-portrait-more-item__text {
  width: 100%;
  font-size: 12px;
  line-height: 18px;
  color: $--color-white;
  text-align: center;
  opacity: 0.6;
  @include singleline-text;
}

.c-portrait-more-item--dotted .c-portrait-more-item__icon::after {
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 6px;
  content: '';
  background: #ff3d00;
  border-radius: 50%;
}
</style>
