<!-- @file 跑道消息 -->
<template>
  <div
    v-if="wrapVisible"
    class="c-runway-effect"
    :class="{
      'c-runway-effect--portrait': isPortraitWatchLayout,
    }"
  >
    <transition
      name="runway-effect"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="currentData"
        :key="currentData.id"
        :class="[
          'c-runway-effect__inner g-singleline',
          `c-runway-effect__inner--${currentData.effectType}`,
          {
            [`c-runway-effect__inner--product-${currentData.productType}`]:
              currentData.effectType === MessageEffectType.ProductClick,
          },
        ]"
        :style="{
          left: `${left}px`,
        }"
      >
        <span
          :class="['c-runway-effect__item', `c-runway-effect__item--${item.textType}`]"
          v-for="(item, index) in getEffectText(currentData)"
          :key="index"
        >
          <span class="c-runway-effect__item__text">
            {{ item.text }}
          </span>

          <span
            v-if="item.textType === 'nickname' && item.count && item.count > 1"
            class="c-runway-effect__item__nickname-count"
          >
            {{ getNicknameCountText(item.count) }}
          </span>
        </span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useRunwayEffect } from './hooks/use-runway-effect';
import { useEffectText } from './hooks/use-effect-text';
import { MessageEffectType } from './type';
import { PropUtils } from '@polyv/vue-components';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';

defineProps({
  left: PropUtils.number.def(12),
});

const { wrapVisible, currentData, onAfterLeave } = useRunwayEffect();

const { getEffectText, getNicknameCountText } = useEffectText();

const { isPortraitWatchLayout } = storeDefinitionToRefs(useLayoutStore);
</script>

<style lang="scss">
@import './animation.scss';
.c-runway-effect {
  position: relative;
  width: 100%;
  height: 20px;
  overflow: hidden;

  &.c-runway-effect--portrait {
    padding: 0 12px;
  }

  &:empty {
    display: none;
  }
}

.c-runway-effect__inner {
  position: absolute;
  top: 0;
  left: 12px;
  box-sizing: border-box;
  display: inline-block;
  max-width: calc(100% - 26px);
  height: 20px;
  padding: 0 8px;
  font-size: 12px;
  line-height: 20px;
  color: #fff;
  background: #ff5091;
  border-radius: 10px;

  &.c-runway-effect__inner--JoinVisit {
    background: rgba(#a683e2, 0.8);
  }
  &.c-runway-effect__inner--ProductClick {
    background: rgba(#f48fb5, 0.8);

    &.c-runway-effect__inner--product-normal {
      background: rgba(#f48fb5, 0.8);
    }
    &.c-runway-effect__inner--product-finance {
      background: rgba(#ffd45d, 0.8);
    }
    &.c-runway-effect__inner--product-position,
    &.c-runway-effect__inner--product-delivery {
      background: rgba(#4fd19f, 0.8);
    }
  }
  &.c-runway-effect__inner--ProductBuy {
    background: rgba(#ea9e8a, 0.8);
  }
  &.c-runway-effect__inner--CheckIn {
    background: rgba(#60b5e4, 0.8);
  }
}

.c-runway-effect__item {
  line-height: 16px;
  &:first-of-type {
    .c-runway-effect__item__text {
      margin-left: 0 !important;
    }
  }
}
.c-runway-effect__item--nickname,
.c-runway-effect__item--productName {
  .c-runway-effect__item__text {
    margin-right: 2px;
    margin-left: 2px;
  }
}
</style>
