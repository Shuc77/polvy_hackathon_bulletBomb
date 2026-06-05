<!-- 福袋中奖记录 -->
<template>
  <div
    class="c-lucky-bag-win-record"
    :class="[skinColorIgnoreClass]"
  >
    <div class="c-lucky-bag-win-record__inner">
      <lucky-bag-provider v-if="luckyBagUILoaded">
        <lucky-bag-win-record-ui />
      </lucky-bag-provider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue';
import type { PolyvLuckyBagUIPkg } from '../_load-iar-ui-v2/pkg';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { LuckyBagProvider } from './lucky-bag-provider';
import { useSkinColorIgnore } from '@polyv/vue-components';

const { loadIarUIEntrance } = useIarUILoader('lucky-bag-ui-receive');

const LuckyBagWinRecordUi = defineAsyncComponent(async () => {
  const Pkg = await loadIarUIEntrance<typeof PolyvLuckyBagUIPkg>();
  return Pkg.LuckyBagWinRecord;
}) as unknown;

const luckyBagUILoaded = ref(false);

const { skinColorIgnoreClass } = useSkinColorIgnore();

onMounted(async () => {
  await loadIarUIEntrance<typeof PolyvLuckyBagUIPkg>();
  luckyBagUILoaded.value = true;
});
</script>

<style lang="scss">
.c-lucky-bag-win-record {
  box-sizing: border-box;
  height: 100%;
  padding: 0 12px 12px;
}

.c-lucky-bag-win-record__inner {
  height: 100%;
  overflow: hidden;
  background: #fff;
  border-radius: 12px;
}
</style>
