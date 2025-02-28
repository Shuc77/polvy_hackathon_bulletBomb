<!-- @file pc端图标广告 -->
<template>
  <div
    class="c-pc-img-advert"
    v-if="imgAdvertEnabled && imgAdvertVisible && imgAdvertList.length"
  >
    <div class="c-pc-icon-advert__content__image">
      <img
        draggable="false"
        onselectstart="return false"
        :src="iconAdvert.advertImage"
        @click="openLink(iconAdvert.pcLink || iconAdvert.advertHref)"
      />
    </div>
    <div
      class="c-pc-icon-advert__content__close__box"
      v-if="imgCloseVisible"
    >
      <mobile-icon-close
        class="c-pc-icon-advert__content__close"
        @click="closeImgAdvert"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAdvertStore } from '@/store/use-advert-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { MobileIconClose } from '@/components/component-icons/mobile/map';
import { openLink } from '@/assets/utils/url';

const advertStore = useAdvertStore();
const { closeImgAdvert } = advertStore;

const { imgAdvertEnabled, imgAdvertVisible, imgAdvertList, imgCloseVisible } =
  storeToRefs(advertStore);

const iconAdvert = computed(() => imgAdvertList.value[0]);
</script>
-
<style lang="scss">
.c-pc-img-advert {
  position: relative;
  z-index: 200;
  flex-shrink: 0;
  .c-pc-icon-advert__content__image {
    cursor: pointer;
    background-color: #d8d8d8;
    border-radius: 4px;
    img {
      width: 36px;
      height: 36px;
    }
  }
  .c-pc-icon-advert__content__close__box {
    position: absolute;
    top: -10px;
    right: -3px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    cursor: pointer;
    background-color: #98989888;
    border-radius: 50%;
    backdrop-filter: saturate(180%) blur(20px);

    .c-pc-icon-advert__content__close {
      margin-top: 1px;
      font-size: 12px !important;
      color: $--color-white;
    }
  }
}
</style>
