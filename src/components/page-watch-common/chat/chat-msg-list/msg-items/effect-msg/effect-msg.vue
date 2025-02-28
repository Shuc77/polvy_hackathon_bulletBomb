<!-- @file 特效消息 -->
<template>
  <div class="c-effect-msg">
    <div
      class="c-effect-msg__inner"
      :class="[`c-effect-msg__inner--${effectData.effectType}`]"
      @click="onClickMsg"
    >
      <span
        :class="['c-effect-msg__item', `c-effect-msg__item--${item.textType}`]"
        v-for="(item, index) in getEffectText(effectData)"
        :key="index"
      >
        <span class="c-effect-msg__item__text">
          {{ item.text }}
        </span>

        <span
          v-if="item.textType === 'nickname' && item.count && item.count > 1"
          class="c-effect-msg__item__nickname-count"
        >
          {{ getNicknameCountText(item.count) }}
        </span>
      </span>

      <mobile-icon-arrow-right class="c-effect-msg__icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEffectMsg } from './use-effect-msg';
import { useEffectText } from '@/components/page-watch-common/message-effect/hooks/use-effect-text';
import { MobileIconArrowRight } from '@/components/component-icons/mobile/map';

const { effectData, onClickMsg } = useEffectMsg();

const { getEffectText, getNicknameCountText } = useEffectText();
</script>

<style lang="scss">
@import '../_styles/vars.scss';

.c-effect-msg {
  display: flex;
  justify-content: center;
  // margin: 0 52px 0 $--margin-horizontal-margin;
  margin: 0 $--margin-horizontal-margin;
}

.c-effect-msg__inner {
  padding: 6px 8px;
  font-size: 14px;
  color: #fff;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 16px;

  &.c-effect-msg__inner--ProductClick,
  &.c-effect-msg__inner--ProductBuy {
    cursor: pointer;

    .c-effect-msg__icon {
      display: inline-flex !important;
    }
  }
}

.c-effect-msg__item {
  line-height: 20px;
  vertical-align: middle;

  &:first-of-type {
    .c-effect-msg__item__text {
      margin-left: 0 !important;
    }
  }
}

.c-effect-msg__item--nickname,
.c-effect-msg__item--productName {
  .c-effect-msg__item__text {
    // margin-right: 4px;
    // margin-left: 4px;
    color: rgba(255, 255, 255, 0.6);
  }
}

.c-effect-msg__icon {
  display: none;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  overflow: hidden;
  font-size: 18px;
  vertical-align: middle;
}
</style>
