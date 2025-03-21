<!-- @file 打赏动画 -->
<template>
  <div
    v-if="trackList.length"
    class="c-donate-animation"
  >
    <div
      v-for="item in trackList"
      :key="item.animationId"
      class="c-donate-animation__item"
    >
      <donate-animation-item
        :animation-id="item.animationId"
        :nick="item.nick"
        :pic="item.pic"
        :gimg="item.gimg"
        :count="item.count"
        :reward-content="item.rewardContent"
        :donate-type="item.donateType"
        @after-leave="onItemLeaved(item.animationId)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DonateAnimationItem from './donate-animation-item.vue';
import { donateAnimationProps, useDonateAnimation } from './use-donate-animation';

const props = defineProps(donateAnimationProps());

const { trackList, onItemLeaved } = useDonateAnimation({ props });
</script>

<style lang="scss">
@import './styles/var.scss';

.c-donate-animation {
  position: relative;
  pointer-events: none;

  &:empty {
    display: none;
  }
}

.c-donate-animation__item:last-of-type {
  .c-donate-animation-item {
    margin-bottom: 0;
  }
}
</style>
