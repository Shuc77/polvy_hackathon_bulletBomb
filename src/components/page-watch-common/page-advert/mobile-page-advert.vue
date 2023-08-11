<!-- @file 移动端页面广告 -->
<template>
  <div
    v-if="advertVisible && pageAdvertEnabled && pageAdvertList.length"
    class="c-mobile-page-advert pws-page-advert"
  >
    <div class="c-mobile-page-advert__content">
      <plv-carousel
        autoplay
        loop
      >
        <plv-carousel-item
          v-for="(item, index) in pageAdvertList"
          :key="index"
        >
          <div
            :href="item.href"
            class="c-mobile-page-advert__item"
            :class="{
              'c-mobile-page-advert__item--link': !!item.href,
            }"
            @click="openLink(item.href)"
          >
            <template v-if="item.advertType === PageAdvertType.Text">
              {{ item.content }}
            </template>
            <template v-else>
              <div
                class="c-mobile-page-advert__item__image"
                :style="{
                  backgroundImage: `url(${item.content})`,
                }"
              ></div>
            </template>
          </div>
        </plv-carousel-item>

        <template #prevArrow>
          <div class="c-mobile-page-advert__prev pws-page-advert-arrow">
            <mobile-icon-arrow-left class="c-mobile-page-advert__next__icon" />
          </div>
        </template>

        <template #nextArrow>
          <div class="c-mobile-page-advert__next pws-page-advert-arrow">
            <mobile-icon-arrow-right class="c-mobile-page-advert__next__icon" />
          </div>
        </template>
      </plv-carousel>

      <mobile-icon-close-round
        v-if="closeVisible"
        class="c-mobile-page-advert__content__close"
        @click="closeAdvert"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PageAdvertType } from '@polyv/live-watch-sdk';
import {
  MobileIconCloseRound,
  MobileIconArrowLeft,
  MobileIconArrowRight,
} from '@/components/component-icons/mobile/map';
import { PlvCarousel, PlvCarouselItem } from '@/plugins/polyv-ui/mobile-import';
import { usePageAdvertStore } from '@/store/use-page-advert-store';
import { storeToRefs } from 'pinia';

const pageAdvertStore = usePageAdvertStore();
const { closeAdvert, openLink } = pageAdvertStore;
const { advertVisible, pageAdvertEnabled, pageAdvertList, closeVisible } =
  storeToRefs(pageAdvertStore);
</script>

<style lang="scss">
.c-mobile-page-advert {
  position: relative;
  z-index: 140;
  flex-shrink: 0;
  width: 100%;
  height: 0;
  padding-bottom: 16%;
}

.c-mobile-page-advert__content {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
}

.c-mobile-page-advert__prev,
.c-mobile-page-advert__next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
.c-mobile-page-advert__prev {
  left: 0;
}
.c-mobile-page-advert__next {
  right: 0;
}

.c-mobile-page-advert__prev__icon,
.c-mobile-page-advert__next__icon {
  display: flex;
  font-size: 30px !important;
}

.c-mobile-page-advert__content__close {
  position: absolute;
  top: -20px;
  right: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px !important;
  color: $--color-white;
  cursor: pointer;
}

.c-mobile-page-advert__item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: 16px;
  text-decoration: none;
  user-select: none;
}

.c-mobile-page-advert__item--link {
  cursor: pointer;
}

.c-mobile-page-advert__item__image {
  display: block;
  width: 100%;
  height: 100%;
  background-size: 100% 100%;
}
</style>
