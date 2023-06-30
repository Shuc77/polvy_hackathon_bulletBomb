<!-- @file PC 端多语言选择 -->
<template>
  <div
    ref="langRef"
    class="c-pc-lang-switch"
    :class="{
      'c-pc-lang-switch--dark': theme === 'dark',
      'c-pc-lang-switch--open': visible,
    }"
  >
    <div
      class="c-pc-lang-switch__content"
      @click="togglePopper"
    >
      <pc-icon-lang class="c-pc-lang-switch__content__prefix-icon" />
      <span>{{ currentLangText }}</span>
      <div class="c-pc-lang-switch__content__icon">
        <pc-icon-arrow-down class="c-pc-lang-switch__content__icon__arrow" />
      </div>
    </div>

    <transition name="fade">
      <div
        v-show="visible"
        class="c-pc-lang-switch__popper"
      >
        <div
          v-for="(item, index) in langSwitchList"
          :key="index"
          class="c-pc-lang-switch__popper__item"
          :class="{
            'c-pc-lang-switch__popper__item--active': item.lang === currentLang,
          }"
          @click="onClickLangItem(item)"
        >
          {{ item.text }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PcIconLang, PcIconArrowDown } from '@/components/component-icons/pc/map';

import { LangSwitchItem, useLangStore } from '@/store/use-lang-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { PropUtils, useProps } from '@/assets/utils/vue-utils/props-utils';
import { useClickOutside } from '@/hooks/behaviors/use-click-outside';

const props = defineProps({
  /** 主题 */
  theme: PropUtils.string.def(''),
});

const { theme } = useProps(props);

const langStore = useLangStore();
const { currentLang, currentLangText, langSwitchList } = storeDefinitionToRefs(useLangStore);

const visible = ref(false);

function togglePopper() {
  visible.value = !visible.value;
}

function onClickLangItem(item: LangSwitchItem) {
  langStore.switchLang(item.lang);
  visible.value = false;
}

const langRef = ref();
useClickOutside([langRef], () => {
  visible.value = false;
});
</script>

<style lang="scss">
$--lang-width: 120px !default;
$--light-bg-color: #ededef !default;
$--light-bg-active-color: #d6dff1 !default;
$--light-font-color: $--font-color-primary !default;
$--light-font-active-color: #3082fe !default;

.c-pc-lang-switch {
  position: relative;
  z-index: 21; // 不被底部面板遮挡
  font-size: 14px;
  color: $--light-font-color;
}

.c-pc-lang-switch__content {
  position: relative;
  box-sizing: border-box;
  display: block;
  width: $--lang-width;
  padding: 0 30px 0 8px;
  line-height: 20px;
  cursor: pointer;
  user-select: none;
}

.c-pc-lang-switch__content__prefix-icon {
  position: absolute;
  top: 50%;
  left: -18px;
  display: flex;
  font-size: 16px !important;
  transform: translateY(-50%);
}

.c-pc-lang-switch__content__icon {
  position: absolute;
  top: 50%;
  right: 5px;
  height: 16px;
  color: #adadc0;
  transform: translateY(-50%);

  .c-pc-lang-switch__content__icon__arrow {
    display: flex;
    font-size: 16px !important;
    transition: 0.3s;
  }
}

.c-pc-lang-switch--open {
  .c-pc-lang-switch__content__icon__arrow {
    transform: rotateZ(180deg);
  }
}

.c-pc-lang-switch__popper {
  position: absolute;
  top: 100%;
  left: 0;
  width: $--lang-width;
  margin-top: 10px;
  background: $--light-bg-color;
}

.c-pc-lang-switch__popper__item {
  padding: 0 8px;
  line-height: 32px;
  cursor: pointer;
  user-select: none;
  transition: 0.3s;

  &.c-pc-lang-switch__popper__item--active {
    color: $--light-font-active-color;
    background: $--light-bg-active-color;
  }

  &:hover {
    background: $--light-bg-active-color;
  }
}

.c-pc-lang-switch--dark {
  color: $--color-white;

  .c-pc-lang-switch__content__icon {
    color: $--color-white;
  }
  .c-pc-lang-switch__popper {
    background: #2b2c35;
  }

  .c-pc-lang-switch__popper__item {
    color: #adadc0;
    &.c-pc-lang-switch__popper__item--active {
      color: $--color-white;
      background: #3e3e4e;
    }

    &:hover {
      background: #3e3e4e;
    }
  }
}
</style>
