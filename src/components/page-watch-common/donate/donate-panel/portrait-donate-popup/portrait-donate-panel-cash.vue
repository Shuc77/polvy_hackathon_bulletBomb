<!-- @file 竖屏端打赏面板 - 现金打赏 -->
<template>
  <div class="c-portrait-donate-panel-cash">
    <div
      v-show="!customVisible"
      class="c-portrait-donate-panel-cash__options"
    >
      <div
        v-for="(item, index) in donateCashQuickOptions"
        :key="index"
        class="c-portrait-donate-panel-cash__options__item"
        :class="{
          'is-active': item === Number(cashAmount),
        }"
        @click="onClickAmount(item)"
      >
        ￥{{ item }}
      </div>
    </div>

    <div
      v-show="!customVisible"
      class="c-portrait-donate-panel-cash__custom-btn"
      @click="onClickCustom"
    >
      {{ $lang('donate.custom2') }} >
    </div>

    <div
      v-show="customVisible"
      class="c-portrait-donate-panel-cash__custom"
    >
      <mobile-form-wrap>
        <mobile-form-item>
          <mobile-form-input
            v-model="cashAmount"
            class="c-portrait-donate-panel-cash__custom__input"
            :placeholder="$lang('donate.placeholder')"
            :input-title="$lang('donate.custom2')"
            :size="FormSize.Medium"
          >
            <template #suffix>
              <div
                class="c-portrait-donate-panel-cash__custom__random"
                @click="onClickRandom"
              >
                {{ $lang('donate.random') }}
              </div>
            </template>
          </mobile-form-input>
        </mobile-form-item>
      </mobile-form-wrap>

      <div class="c-portrait-donate-panel-cash__custom__button-wrap">
        <normal-button
          class="c-portrait-donate-panel-cash__custom__button"
          :text="$lang('donate.confirm')"
          block
          :size="ButtonSize.Medium"
          @click="donateCash"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ButtonSize } from '@/components/common-base/normal-button/types';
import { useDonateCash } from '../hooks/use-donate-cash';
import MobileFormWrap from '@/components/common-base/form/form-wrap.vue';
import MobileFormItem from '@/components/common-base/form/form-item.vue';
import MobileFormInput from '@/components/common-base/form/form-input/mobile-form-input.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ref } from 'vue';
import { FormSize } from '@/components/common-base/form/types/enums';

import { useDonateStore } from '@/store/use-donate-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { emitFunc } from '@/assets/utils/vue-utils/emit-utils';

const emit = defineEmits({
  /** 返回 */
  back: emitFunc<void>(),
  /** 打赏成功 */
  'donate-success': emitFunc<void>(),
});

const { donateCashQuickOptions } = storeDefinitionToRefs(useDonateStore);

const { cashAmount, onClickRandom, onClickQuickOptions, donateCash } = useDonateCash({
  donateSuccess: () => emit('donate-success'),
});

/** 处理点击快捷数量 */
function onClickAmount(amount: number) {
  onClickQuickOptions(amount);
  donateCash();
}

/** 自定义金额是否显示 */
const customVisible = ref(false);

function onClickCustom() {
  cashAmount.value = '';
  customVisible.value = true;
}
</script>

<style lang="scss">
.c-portrait-donate-panel-cash__options {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 16px 24px 12px;
}

.c-portrait-donate-panel-cash__options__item {
  width: 30%;
  margin-bottom: 8px;
  font-size: 16px;
  line-height: 40px;
  color: #adadc0;
  text-align: center;
  background-color: #1a1b1f;
  border: 1px solid transparent;
  border-radius: 20px;

  &.is-active {
    color: $--color-white;
    background-color: #3e3e4e;
    border-color: #adadc0;
  }
}

.c-portrait-donate-panel-cash__custom-btn {
  padding-bottom: 20px;
  font-size: 16px;
  color: #adadc0;
  text-align: center;
}

.c-portrait-donate-panel-cash__custom {
  padding: 16px 24px;
}

.c-portrait-donate-panel-cash__custom__random {
  flex-shrink: 0;
  padding-right: 16px;
}

.c-portrait-donate-panel-cash__custom__button-wrap {
  box-sizing: border-box;
  width: 100%;
  padding: 20px 24px;
}

.c-portrait-donate-panel-cash__custom__button {
  color: $--color-white;
  background-color: #ff5353;
}
</style>
