<!-- @file PC 端观看条件：白名单观看 -->
<template>
  <pc-dialog
    class="c-pc-auth-phone"
    :visible.sync="dialogVisible"
    :title="dialogTitle"
  >
    <div class="c-pc-auth-phone__main">
      <form-wrap
        :form-data="formData"
        :form-rules="formRules"
        :content-width="320"
        :submit-action="submitAuth"
      >
        <form-item
          ref="formItemRef"
          form-field="phone"
        >
          <pc-form-input
            v-model.trim="formData.phone"
            :placeholder="inputPlaceholder"
          />
        </form-item>
        <form-item
          v-if="protocolContent"
          form-field="checkProtocol"
        >
          <pc-form-protocol
            v-model="formData.checkProtocol"
            :content="protocolContent"
          />
        </form-item>

        <div class="c-pc-auth-phone__main__submit">
          <form-submit-button
            :size="ButtonSize.Small"
            :text="$lang('auth.enter')"
          />
          <normal-button
            :size="ButtonSize.Small"
            :type="ButtonType.Info"
            :text="$lang('base.cancel')"
            @click="onClickCancel"
          />
        </div>
      </form-wrap>
    </div>
  </pc-dialog>
</template>

<script setup lang="ts">
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import PcFormInput from '@/components/common-base/form/form-input/pc-form-input.vue';
import PcFormProtocol from '@/components/common-base/form/form-protocol/pc-form-protocol.vue';

import { useAuthPhone } from './use-auth-phone';

const {
  dialogVisible,
  dialogTitle,
  protocolContent,
  formData,
  inputPlaceholder,
  formRules,
  onClickCancel,
  submitAuth,
  formItemRef,
} = useAuthPhone();
</script>

<style lang="scss">
.c-pc-auth-phone__main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
}

.c-pc-auth-phone__main__submit {
  display: flex;
  justify-content: center;

  .c-normal-button {
    margin: 0 8px;
  }
}
</style>
