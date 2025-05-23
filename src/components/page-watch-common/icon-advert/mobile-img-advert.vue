<!-- @file 移动端图标广告 -->
<template>
  <div
    class="c-mobile-img-advert"
    v-if="imgAdvertEnabled && imgAdvertVisible && iconAdvert"
  >
    <div class="c-mobile-icon-advert__content__image">
      <img
        :src="iconAdvert.advertImage"
        @click="onClickIcon"
      />
      <div
        ref="wxBtn"
        class="c-mobile-icon-advert__content__wx-btn"
        :style="{ 'z-index': hasWxJumpDom ? '99' : '-1' }"
      ></div>
    </div>
    <div
      class="c-mobile-icon-advert__content__close__box"
      v-if="imgCloseVisible"
    >
      <mobile-icon-close
        class="c-mobile-icon-advert__content__close"
        @click="closeImgAdvert"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAdvertStore } from '@/store/use-advert-store';
import { storeToRefs } from 'pinia';
import { computed, ref, nextTick, watch } from 'vue';
import { AdvertHrefType } from '@polyv/live-watch-sdk';
import { useIconAdvert } from './hooks/use-icon-advert';
import { MobileIconClose } from '@/components/component-icons/mobile/map';
import { openLink } from '@/assets/utils/url';

const advertStore = useAdvertStore();
const { closeImgAdvert } = advertStore;

const { imgAdvertEnabled, imgAdvertVisible, imgAdvertList, imgCloseVisible } =
  storeToRefs(advertStore);

const iconAdvert = computed(() => (imgAdvertList.value.length > 0 ? imgAdvertList.value[0] : null));

const { openWxLink, init, isWxMiniProgramWebview, hasWxJumpDom } = useIconAdvert();
const wxBtn = ref<HTMLElement | null>(null);

watch(
  iconAdvert,
  () => {
    nextTick(() => {
      if (!iconAdvert.value) return;

      const { wxMiniprogramLink, wxMiniprogramOriginalId, wxMiniprogramAppId } = iconAdvert.value;
      const width = wxBtn.value?.clientWidth || 36;
      const height = wxBtn.value?.clientHeight || 36;
      init({
        wrapDom: wxBtn.value,
        wxMiniprogramAppId,
        wxMiniprogramLink,
        wxMiniprogramOriginalId,
        width,
        height,
      });
    });
  },
  { immediate: true },
);

// 移动端需要做普通链接、小程序链接、小程序原始id链接的处理
const onClickIcon = () => {
  if (!iconAdvert.value) return;

  const { hrefType, advertHref, mobileLink, wxMiniprogramLink } = iconAdvert.value;

  if (
    hrefType === AdvertHrefType.MULTI_PLATFORM &&
    wxMiniprogramLink &&
    isWxMiniProgramWebview.value
  ) {
    openWxLink(wxMiniprogramLink);
    return;
  }
  openLink(mobileLink || advertHref);
};
</script>
<style lang="scss">
.c-mobile-img-advert {
  position: relative;
  z-index: 200;
  flex-shrink: 0;
  .c-mobile-icon-advert__content__wx-btn {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .c-mobile-icon-advert__content__image {
    cursor: pointer;
    border-radius: 4px;
    img {
      width: 40px;
      height: 40px;
    }
  }
  .c-mobile-icon-advert__content__close__box {
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

    .c-mobile-icon-advert__content__close {
      margin-top: 1px;
      font-size: 12px !important;
      color: $--color-white;
    }
  }
}
</style>
