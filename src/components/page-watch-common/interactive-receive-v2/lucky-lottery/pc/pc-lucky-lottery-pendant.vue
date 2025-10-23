<!-- PC 平台抽奖入口挂件 -->
<template>
  <div class="c-pc-lucky-lottery-pendant">
    <iar-pc-lucky-lottery-pendant
      v-if="targetInited"
      :lucky-lottery-target="getIarTarget()"
      :before-click-interrupt="beforeClickInterrupt"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useLotteryTarget } from '../use-lucky-lottery';
import { useIarUILoader } from '../../_load-iar-ui-v2';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

const { loadIarUI } = useIarUILoader('iar-lucky-lottery-ui');

const IarPcLuckyLotteryPendant = defineAsyncComponent(() => loadIarUI('lucky-lottery-pendant'));
const { targetInited, getIarTarget } = useLotteryTarget();

const { toInterruptUserClick } = useInterruptUserClick();

function beforeClickInterrupt() {
  return toInterruptUserClick({ triggerSource: 'lucky-lottery-pendant', ignoreSetNick: true });
}
</script>

<style lang="scss">
.c-pc-lucky-lottery-pendant {
  .plv-iar-lucky-lottery-pendant {
    cursor: pointer;
  }
}
@media screen and (min-aspect-ratio: 4 / 3) {
  .c-pc-lucky-lottery-pendant {
    .plv-iar-lucky-lottery-pendant {
      display: block;
    }
  }
}
</style>
