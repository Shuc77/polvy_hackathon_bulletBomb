<!-- @file 竖屏端打赏面板 - 道具打赏 -->
<template>
  <div class="c-portrait-donate-panel-good">
    <div
      v-if="donatePointEnabled"
      class="c-portrait-donate-panel-good__point"
    >
      <span>{{ $lang('donate.point.myPoint') }}</span>
      <span class="c-portrait-donate-panel-good__point__count">
        {{ surplusPoint }}
      </span>
    </div>

    <div
      v-if="donateContentPages.length"
      class="c-portrait-donate-panel-good__carousel"
    >
      <plv-carousel>
        <plv-carousel-item
          v-for="(items, pageIndex) in donateContentPages"
          :key="`carousel-item-${pageIndex}`"
          class="c-portrait-donate-panel-good__carousel__item"
        >
          <ul class="c-portrait-donate-panel-good__goods">
            <template v-for="(good, index) in items">
              <!-- 现金 -->
              <li
                v-if="good.donateType === DonateType.Cash"
                :key="`good-${pageIndex}-${index}`"
                class="c-portrait-donate-panel-good__goods__item"
                @click="onClickCash"
              >
                <img
                  class="c-portrait-donate-panel-good__goods__item__img"
                  src="../imgs/redpack-cash.png"
                />
                <p class="c-portrait-donate-panel-good__goods__item__name">
                  {{ $lang('donate.title') }}
                </p>
                <p class="c-portrait-donate-panel-good__goods__item__price">
                  {{ $lang('donate.cash') }}
                </p>
              </li>
              <!-- 道具 -->
              <li
                v-if="good.donateType === DonateType.Good"
                :key="`good-${pageIndex}-${index}`"
                class="c-portrait-donate-panel-good__goods__item"
                :class="{
                  'is-active': selectedGood && good.goodId === selectedGood.goodId,
                }"
                @click="onClickItem(good)"
              >
                <img
                  class="c-portrait-donate-panel-good__goods__item__img"
                  :src="good.goodImage"
                />
                <p class="c-portrait-donate-panel-good__goods__item__name">
                  {{ good.goodTranslateName }}
                </p>
                <p class="c-portrait-donate-panel-good__goods__item__price">
                  {{ good.goodPriceText }}
                </p>
              </li>
            </template>
          </ul>
        </plv-carousel-item>

        <template v-slot:indicator="{ count, slideIndex }">
          <div class="c-portrait-donate-panel-good__carousel__indicator">
            <div
              v-for="num in count"
              :key="`indicator-${num}`"
              class="c-portrait-donate-panel-good__carousel__indicator__item"
              :class="{
                'is-active': num - 1 === slideIndex,
              }"
            ></div>
          </div>
        </template>
      </plv-carousel>
    </div>

    <!-- 数量选择 -->
    <div
      v-if="donatePointEnabled"
      class="c-portrait-donate-panel-good__count-choice"
    >
      <div
        v-for="(item, index) in quickCounts"
        :key="`count-${index}`"
        class="c-portrait-donate-panel-good__count-choice__item"
        :class="{
          'is-active': item === donateCount,
        }"
        @click="donateCount = item"
      >
        {{ item }}
      </div>

      <div
        class="c-portrait-donate-panel-good__count-choice__button"
        @click="donateGood"
      >
        {{ $lang('donate.button') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlvCarousel, PlvCarouselItem } from '@/plugins/polyv-ui/mobile-import';

import { useDonateGood } from '../hooks/use-donate-good';
import { unref } from 'vue';
import { DonateType } from '@polyv/live-watch-sdk';

import { DonateGoodInfo, useDonateStore } from '@/store/use-donate-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { emitFunc } from '@/assets/utils/vue-utils/emit-utils';

const emit = defineEmits({
  /** 打开现金打赏 */
  'open-cash': emitFunc<void>(),
  /** 打赏成功 */
  'donate-success': emitFunc<void>(),
});

const { donatePointEnabled, donateGoodEnabled, donateContentPages } =
  storeDefinitionToRefs(useDonateStore);

const { surplusPoint, selectedGood, setSelectedGood, quickCounts, donateCount, donateGood } =
  useDonateGood({
    donateSuccess: () => emit('donate-success'),
  });

/** 处理点击 */
function onClickItem(good: DonateGoodInfo) {
  setSelectedGood(good);

  // 现金礼物打赏下直接打赏
  if (unref(donateGoodEnabled)) {
    donateGood();
  }
}

function onClickCash() {
  emit('open-cash');
}
</script>

<style lang="scss">
.c-portrait-donate-panel-good {
  box-sizing: border-box;
  padding: 6px 8px 0;
}

.c-portrait-donate-panel-good__point {
  margin: 8px 8px 4px 0;
  font-size: 12px;
  color: #e4e4e4;
  text-align: right;
}
.c-portrait-donate-panel-good__point__count {
  color: #ff5353;
}

.c-portrait-donate-panel-good__carousel__item {
  height: 100% !important;
}

$--carousel-indicator-size: 4px;

.c-portrait-donate-panel-good__carousel__indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  margin-top: 3px;
}
.c-portrait-donate-panel-good__carousel__indicator__item {
  width: $--carousel-indicator-size;
  height: $--carousel-indicator-size;
  margin: 0 4px;
  background-color: rgba($--color-white, 0.2);
  border-radius: 50%;

  &.is-active {
    background-color: $--color-white;
  }
}

.c-portrait-donate-panel-good__goods {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.c-portrait-donate-panel-good__goods__item {
  box-sizing: border-box;
  flex-shrink: 0;
  width: 20%;
  height: 95px;
  text-align: center;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: all 0.1s ease-in-out;

  &.is-active {
    background: rgba($--color-white, 0.1);
    border-color: rgba($--color-white, 0.3);
  }
}

.c-portrait-donate-panel-good__goods__item__img {
  width: 48px;
  height: 48px;
  margin: 6px auto;
}
.c-portrait-donate-panel-good__goods__item__name {
  margin: 2px 0 4px;
  font-size: 13px;
  color: $--color-white;
}
.c-portrait-donate-panel-good__goods__item__price {
  max-width: 100%;
  overflow: hidden;
  font-size: 12px;
  color: rgba($--color-white, 0.5);
  text-overflow: ellipsis;
  white-space: nowrap;
  transform: scale(0.83);
}

.c-portrait-donate-panel-good__count-choice {
  display: flex;
  align-items: center;
  padding: 0 8px 8px;
}

.c-portrait-donate-panel-good__count-choice__item {
  box-sizing: border-box;
  width: 36px;
  margin-right: 4px;
  font-size: 12px;
  line-height: 24px;
  color: #adadc0;
  text-align: center;
  background-color: #1a1b1f;
  border: 1px solid transparent;
  border-radius: 12px;

  &.is-active {
    color: $--color-white;
    background-color: #3e3e4e;
    border-color: #adadc0;
  }
}

.c-portrait-donate-panel-good__count-choice__button {
  width: 54px;
  margin-left: auto;
  font-size: 14px;
  line-height: 32px;
  color: $--color-white;
  text-align: center;
  background-color: #ff5353;
  border-radius: 16px;
}
</style>
