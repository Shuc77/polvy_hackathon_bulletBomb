<template>
  <mobile-popup
    :theme="PopupTheme.Portrait"
    class="c-portrait-withdraw-apply--popup"
    :title="$lang('withdraw.apply.popup.title')"
    :visible.sync="popupVisible"
    fill-body-section
    append-to-body
    backable
    @click-back="handleWithdrawApplyPopupBackClick"
  >
    <form-wrap
      :theme="FormTheme.Dark"
      class="c-portrait-withdraw-apply"
      :form-data="formData"
      :form-rules="formRules"
      :submit-action="handleSubmitForm"
    >
      <form-item form-field="amount">
        <mobile-form-number-input
          v-model="formData.amount"
          :input-title="$lang('withdraw.apply.amount')"
          :input-title-width="100"
          :placeholder="amountInputPlaceHolder"
          :clearabled="false"
        >
          <div
            slot="suffix"
            class="c-portrait-withdraw-apply__all pws-mobile-withdraw-highlight"
            @click="setMaxAmount"
          >
            {{ $lang('withdraw.apply.amount.all') }}
          </div>
        </mobile-form-number-input>
      </form-item>

      <form-item>
        <mobile-form-input
          disabled
          :input-title="$lang('withdraw.apply.username')"
          :input-title-width="100"
          :value="nickname"
        />
      </form-item>

      <p
        class="c-portrait-withdraw-apply__tips"
        v-html="withdrawApplyTips"
      ></p>

      <div class="c-portrait-withdraw-apply__submit">
        <form-submit-button
          :size="ButtonSize.Medium"
          block
          :text="$lang('withdraw.apply.btn.text')"
        >
        </form-submit-button>
      </div>
    </form-wrap>
  </mobile-popup>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

import { PopupTheme } from '@/components/common-base/popup/types';
import { FormTheme } from '@/components/common-base/form/types/enums';
import { ButtonSize } from '@/components/common-base/normal-button/types';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import MobileFormInput from '@/components/common-base/form/form-input/mobile-form-input.vue';
import MobileFormNumberInput from '@/components/common-base/form/form-number-input/mobile-form-number-input.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useViewerStore } from '@/store/use-viewer-store';

import { appEvents, eventBus } from '@/app/app-events';
import { useWithdrawApplyHook } from '../_hooks/use-withdraw-apply';
import { toast } from '@/hooks/components/use-toast';

const { nickname } = storeDefinitionToRefs(useViewerStore);
const {
  formData,
  formRules,
  amountInputPlaceHolder,
  withdrawApplyTips,

  initWithdrawApply,
  resetWithdrawApply,
  setMaxAmount,
  submitForm,
} = useWithdrawApplyHook();

const popupVisible = ref(false);

onMounted(() => {
  eventBus.$on(appEvents.withdraw.OpenWithdrawApply, handleWithdrawApplyPopupVisible);
});

onBeforeUnmount(() => {
  eventBus.$off(appEvents.withdraw.OpenWithdrawApply, handleWithdrawApplyPopupVisible);
});

/** "申请提现"  OpenWithdrawApply 钩子 */
function handleWithdrawApplyPopupVisible(visible: boolean) {
  if (visible) {
    initWithdrawApply();
  } else {
    resetWithdrawApply();
  }
  popupVisible.value = visible;
}

/** "申请提现" 弹出层返回按钮点击钩子 */
function handleWithdrawApplyPopupBackClick() {
  handleWithdrawApplyPopupVisible(false);
}

/** "提现申请"钩子 */
async function handleSubmitForm() {
  try {
    await submitForm();
    // 需要先隐藏"提现详情"
    eventBus.$emit(appEvents.withdraw.OpenWithdrawDetail, false);
    handleWithdrawApplyPopupVisible(false);
  } catch (error) {
    toast.error((error as Error).message);
  }
}
</script>

<style lang="scss">
.c-portrait-withdraw-apply {
  position: relative;
  box-sizing: border-box;
  height: 100%;
  padding: 20px 24px 0;
  @include iphone-x-pb(24px);

  .c-portrait-withdraw-apply__all {
    width: 48px;
    font-size: 14px;
    color: #ffa611;
  }

  .c-portrait-withdraw-apply__tips {
    font-size: 12px;
    line-height: 17px;
    color: #cdcdcd;
    span {
      color: #ffd16b;
    }
  }

  .c-portrait-withdraw-apply__submit {
    position: absolute;
    right: 24px;
    bottom: 24px;
    left: 24px;
  }
}
</style>
