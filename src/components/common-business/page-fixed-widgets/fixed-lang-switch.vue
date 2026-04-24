<!-- @file PC 端底部多语言切换按钮 -->
<template>
  <transition name="fade">
    <pwc-tooltip
      effect="dark"
      placement="left-start"
      ref="tooltipRef"
    >
      <div slot="content">
        <div
          v-for="(item, index) in langSwitchList"
          :key="index"
          class="c-fixed-lang-switch__popper__item"
          :class="{
            'c-fixed-lang-switch__popper__item--active': item.lang === currentLang,
            'pws-next-primary-color': item.lang === currentLang,
          }"
          @click="onClickLangItem(item)"
        >
          {{ item.text }}
        </div>
      </div>
      <div class="c-fixed-widget-button">
        <pc-icon-lang />
      </div>
    </pwc-tooltip>
  </transition>
</template>

<script setup lang="ts">
import { PwcTooltip } from '@polyv/vue-components';
import { PcIconLang } from '@/components/component-icons/pc/map';

import { LangSwitchItem, useLangStore } from '@/store/use-lang-store';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

const tooltipRef = ref<{ hidePopper?: () => void }>();
const langStore = useLangStore();

const { currentLang, langSwitchList } = storeToRefs(langStore);

async function onClickLangItem(item: LangSwitchItem) {
  const success = await langStore.switchLang(item.lang);
  if (success) {
    tooltipRef.value?.hidePopper?.();
  }
}
</script>

<style lang="scss">
.c-fixed-lang-switch__popper__item {
  padding: 0 8px;
  line-height: 32px;
  color: #fff;
  cursor: pointer;
  user-select: none;
  transition: 0.3s;

  &.c-fixed-lang-switch__popper__item--active {
    color: #3f76fc;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}
</style>
