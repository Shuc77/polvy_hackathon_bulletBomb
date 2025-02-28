<!-- @file 特效消息 -->
<template>
  <portrait-msg-container
    class="c-portrait-effect-msg"
    hide-user-info
  >
    <div
      class="c-portrait-effect-msg__inner"
      :class="[`c-portrait-effect-msg__inner--${effectData.effectType}`]"
      @click="onClickMsg"
    >
      <span
        :class="['c-portrait-effect-msg__item', `c-portrait-effect-msg__item--${item.textType}`]"
        v-for="(item, index) in getEffectText(effectData)"
        :key="index"
      >
        <span class="c-portrait-effect-msg__item__text">
          {{ item.text }}
        </span>

        <span
          v-if="item.textType === 'nickname' && item.count && item.count > 1"
          class="c-portrait-effect-msg__item__nickname-count"
        >
          {{ getNicknameCountText(item.count) }}
        </span>
      </span>

      <mobile-icon-arrow-right class="c-portrait-effect-msg__icon" />
    </div>
  </portrait-msg-container>
</template>

<script setup lang="ts">
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';
import { useEffectMsg } from './use-effect-msg';
import { useEffectText } from '@/components/page-watch-common/message-effect/hooks/use-effect-text';
import { MobileIconArrowRight } from '@/components/component-icons/mobile/map';

const { effectData, onClickMsg } = useEffectMsg();

const { getEffectText, getNicknameCountText } = useEffectText();
</script>

<style lang="scss">
@import '../_styles/vars.scss';

.c-portrait-effect-msg__inner {
  font-size: 14px;
  color: #fff;

  &.c-portrait-effect-msg__inner--ProductClick,
  &.c-portrait-effect-msg__inner--ProductBuy {
    .c-portrait-effect-msg__icon {
      display: inline-flex !important;
    }
  }
}

.c-portrait-effect-msg__item {
  line-height: 20px;
  vertical-align: middle;

  &:first-of-type {
    .c-portrait-effect-msg__item__text {
      margin-left: 0 !important;
    }
  }
}

.c-portrait-effect-msg__item--nickname,
.c-portrait-effect-msg__item--productName {
  .c-portrait-effect-msg__item__text {
    // margin-right: 4px;
    // margin-left: 4px;
    color: rgba(255, 255, 255, 0.6);
  }
}

.c-portrait-effect-msg__icon {
  display: none;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-top: -2px;
  overflow: hidden;
  font-size: 18px;
  vertical-align: middle;
}
</style>
