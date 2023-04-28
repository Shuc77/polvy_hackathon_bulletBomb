<!-- @file PC 端反馈弹窗 -->
<template>
  <pc-dialog
    class="c-pc-feed-back-dialog"
    draggable
    :mask="false"
    :title="feedBackTitle"
    :visible.sync="feedBackVisible"
  >
    <iar-pc-feed-back
      :feed-back-sdk="feedBackSdk"
      :is-show-feed-back="feedBackVisible"
      @to-show="setFeedBackVisible(true)"
      @to-hide="setFeedBackVisible(false)"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useFeedBack } from './hooks/use-feed-back';

const IarPcFeedBack = getIarComponent('PcFeedBack');

const { feedBackSdk, feedBackTitle, feedBackVisible, setFeedBackVisible } = useFeedBack();
</script>
