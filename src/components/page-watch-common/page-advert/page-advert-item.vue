<template>
  <div class="c-page-advert-item-container">
    <div
      v-if="advert"
      class="c-page-advert__item"
      :class="{
        'c-page-advert__item--link': !!advert.href,
      }"
    >
      <div
        class="c-page-advert__item__click-wrapper"
        @click="handleAdvertClick"
      >
        <template v-if="advert.advertType === PageAdvertType.Text">
          {{ advert.content }}
        </template>
        <template v-else>
          <div
            class="c-page-advert__item__image"
            :style="{
              backgroundImage: `url(${advert.content})`,
            }"
          ></div>
        </template>
      </div>
      <!-- 微信原生按钮 -->
      <div
        v-if="isMobile && shouldShowWeixinBtn"
        ref="weixinBtnRef"
        key="weixin-btn"
        class="c-page-advert__item__weixin-btn"
      ></div>
    </div>

    <mobile-iframe-popup
      v-if="isMobile"
      v-model="iframeVisible"
      :src="iframeUrl"
      :height="460"
    />

    <pc-iframe-popup
      v-if="!isMobile"
      v-model="iframeVisible"
      :src="iframeUrl"
      :height="720"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { PageAdvertType, PageAdvertItem } from '@polyv/live-watch-sdk';
import { PropUtils } from '@polyv/vue-components';
import MobileIframePopup from '@/components/common-base/iframe-popup/mobile-iframe-popup.vue';
import PcIframePopup from '@/components/common-base/iframe-popup/pc-iframe-popup.vue';
import { useAdvert } from '@/hooks/business/use-advert';
import { isMobile } from '@/assets/utils/browser';

const props = defineProps({
  advert: PropUtils.object<PageAdvertItem>(),
});

const shouldShowWeixinBtn = ref(false);

const { weixinBtnRef, iframeVisible, iframeUrl, isWeixinButton, handleAdvertClick } = useAdvert({
  getLinkData: () => {
    if (!props.advert) return null;
    return {
      linkType: Number(props.advert.linkType || 10),
      jumpWay: props.advert.jumpWay,
      link: props.advert.link || '',
      pcLink: props.advert.pcLink || '',
      mobileLink: props.advert.mobileLink || '',
      androidLink: '',
      iosLink: '',
      otherLink: '',
      mobileAppLink: props.advert.mobileAppLink || '',
      wxMiniprogramAppId: props.advert.wxMiniprogramAppId || '',
      wxMiniprogramOriginalId: props.advert.wxMiniprogramOriginalId || '',
      wxMiniprogramLink: props.advert.wxMiniprogramLink || '',
    };
  },
});

onMounted(async () => {
  if (isMobile) {
    shouldShowWeixinBtn.value = await isWeixinButton();
  }
});
</script>

<style lang="scss">
.c-page-advert-item-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
}

.c-page-advert__item {
  position: relative;
  width: 100%;
  height: 100%;
  font-size: 16px;
  text-decoration: none;
  user-select: none;
}

.c-page-advert__item--link {
  cursor: pointer;
}

.c-page-advert__item__click-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.c-page-advert__item__image {
  display: block;
  width: 100%;
  height: 100%;
  background-size: 100% 100%;
}

.c-page-advert__item__weixin-btn {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
}

@media (max-width: 1280px) {
  .c-page-advert__item {
    font-size: 14px;
  }
}
</style>
