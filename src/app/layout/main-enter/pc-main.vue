<!-- @file PC 端入口 -->
<template>
  <div class="c-pc-main">
    <pc-splash v-if="shouldShowSplash" />
    <pc-watch v-else-if="liveWatchInited" />

    <!-- 风险测评 -->
    <pc-risk-evaluation />
    <risk-evaluation-redirect-dialog />
    <!-- 风险确认函 -->
    <pc-risk-confirm-letter />
  </div>
</template>

<script setup lang="ts">
import '@/plugins/polyv-ui/pc-import';
import PcSplash from '@/pages/splash/pc-splash/pc-splash.vue';
import PcWatch from '@/pages/watch/pc-watch/pc-watch.vue';
import PcRiskEvaluation from '@/components/page-watch-common/interactive-receive/risk-evaluation/pc-risk-evaluation.vue';
import RiskEvaluationRedirectDialog from '@/components/page-watch-common/interactive-receive/risk-evaluation/common/risk-evaluation-redirect-dialog.vue';
import PcRiskConfirmLetter from '@/components/common-business/risk-confirm-letter/pc-risk-confirm-letter.vue';

import { useMainEnter } from './_hooks/use-main-enter';
import { usePageLayoutStyle } from './_hooks/use-page-layout-style';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

useMainEnter();
usePageLayoutStyle();

const { shouldShowSplash, liveWatchInited } = storeDefinitionToRefs(useWatchAppStore);
</script>

<style lang="scss" src="@/assets/styles/pc.scss"></style>
