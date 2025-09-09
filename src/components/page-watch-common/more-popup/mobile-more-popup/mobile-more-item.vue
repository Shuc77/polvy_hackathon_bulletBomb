<!-- @file 移动端更多面板节点 -->
<template>
  <div
    class="c-mobile-more-item"
    @click="emit('click')"
  >
    <component
      v-if="iconComp"
      class="c-mobile-more-item__icon-comp"
      :is="iconComp"
    />

    <div class="c-mobile-more-item__text">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
import { PropUtils, emitFunc } from '@polyv/vue-components';

defineProps({
  /** 图片 */
  iconComp: PropUtils.icon(),
  /** 文字 */
  text: PropUtils.string.isRequired,
});

const emit = defineEmits({
  click: emitFunc<void>(),
});
</script>

<style lang="scss">
.c-mobile-more-item {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 25%;
  height: 76px;
}

.c-mobile-more-item__icon-comp {
  display: flex;
  margin-bottom: 5px;
  font-size: 30px;
  color: rgba(#000, 0.8);
}

.c-mobile-more-item__text {
  width: 100%;
  font-size: 12px;
  line-height: 18px;
  color: rgba(#000, 0.6);
  text-align: center;
  @include singleline-text;
}
</style>
