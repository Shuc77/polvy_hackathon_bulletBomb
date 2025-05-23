<!-- @file 移动端更多面板节点 -->
<template>
  <li
    class="c-mobile-more-item"
    :class="{
      'c-mobile-more-item--dotted': dotted,
    }"
    @click="emit('click')"
  >
    <div
      class="c-mobile-more-item__icon"
      :class="{
        [`c-mobile-more-item__icon--${icon}`]: true,
      }"
    ></div>

    <div class="c-mobile-more-item__text pws-more-panel-text">{{ text }}</div>
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
.c-mobile-more-item {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 25%;
  margin-top: 24px;
}

.c-mobile-more-item__icon {
  position: relative;
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
  background-repeat: no-repeat;
  background-size: 100%;
}
.c-mobile-more-item__icon--profile {
  background-image: url(./imgs/icon-menu-profile.png);
}
.c-mobile-more-item__icon--only-special {
  background-image: url(./imgs/icon-menu-only-sp-mob.png);
}
.c-mobile-more-item__icon--look-all {
  background-image: url(./imgs/icon-menu-show-all-mob.png);
}
.c-mobile-more-item__icon--send-image {
  background-image: url(./imgs/icon-menu-img-mob.png);
}
.c-mobile-more-item__icon--announcement {
  background-image: url(./imgs/icon-menu-announcement-mob.png);
}
.c-mobile-more-item__icon--feedback {
  background-image: url(./imgs/icon-menu-feedback.png);
}
.c-mobile-more-item__icon--score {
  background-image: url(./imgs/icon-menu-score-redpack.png);
}
.c-mobile-more-item__icon--hide-donate {
  background-image: url(./imgs/icon-menu-animation-hide-mob.png);
}
.c-mobile-more-item__icon--show-donate {
  background-image: url(./imgs/icon-menu-animation-show-mob.png);
}
.c-mobile-more-item__icon--set-nick {
  background-image: url(./imgs/icon-menu-set-nick.png);
}
.c-mobile-more-item__icon--language {
  background-image: url(./imgs/icon-menu-lang-mob.png);
}
.c-mobile-more-item__icon--send-redpack {
  background-image: url(./imgs/icon-menu-redenvelope-mob.png);
}
.c-mobile-more-item__icon--withdraw {
  background-image: url(./imgs/icon-menu-withdraw-mob.png);
}
.c-mobile-more-item__icon--message {
  background-image: url(./imgs/icon-menu-msg.png);
}
.c-mobile-more-item__icon--bind-mobile {
  background-image: url(./imgs/icon-menu-bind-mobile.png);
}
.c-mobile-more-item__icon--my-reward {
  background-image: url(./imgs/icon-menu-my-reward-mob.png);
}

.c-mobile-more-item__icon--pip {
  background-image: url(./imgs/icon-pip.png);
}

.c-mobile-more-item__icon--playback-setting {
  background-image: url(./imgs/icon-playback-setting.png);
}

.c-mobile-more-item__icon--coupon {
  background-image: url(./imgs/icon-menu-coupon.png);
}

.c-mobile-more-item__text {
  width: 100%;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  @include singleline-text;
}

.c-mobile-more-item--dotted .c-mobile-more-item__icon::after {
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
