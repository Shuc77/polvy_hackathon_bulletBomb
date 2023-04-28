<!-- @file 移动端+竖屏端反馈弹窗 -->
<template>
  <mobile-popup
    class="c-mobile-feed-back-popup"
    :title="feedBackTitle"
    :visible.sync="feedBackVisible"
    fill-body-section
  >
    <iar-mobile-feed-back
      :feed-back-sdk="feedBackSdk"
      :is-show-feed-back="feedBackVisible"
      @to-show="setFeedBackVisible(true)"
      @to-hide="setFeedBackVisible(false)"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useFeedBack } from './hooks/use-feed-back';

const IarMobileFeedBack = getIarComponent('MobileFeedBack');

const { feedBackSdk, feedBackTitle, feedBackVisible, setFeedBackVisible } = useFeedBack();
</script>
