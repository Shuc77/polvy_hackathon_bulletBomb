<!-- @file PC 端投票面板 -->
<template>
  <div class="c-pc-vote-panel">
    <iar-vote-list
      v-if="targetInited"
      :vote-target="getIarTarget()"
      :max-vote="maxVote"
      :layout="layout"
      :show-rule="!!voteRule"
      :result-show-type="resultShowType"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useIarUILoader } from '../../_load-iar-ui-v2';
import { useVote } from '../hooks/use-vote';

const { loadIarUI } = useIarUILoader('iar-vote-ui');

const { targetInited, getIarTarget, maxVote, layout, voteRule, resultShowType } = useVote();

const IarVoteList = defineAsyncComponent(() => loadIarUI('vote-list'));
</script>

<style lang="scss">
.c-pc-vote-panel {
  height: 100%;
  padding: 0 16px;
  overflow: hidden;
}
</style>
