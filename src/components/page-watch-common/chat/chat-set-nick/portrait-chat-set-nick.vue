<!-- @file 竖屏设置昵称 -->
<template>
  <mobile-popup
    class="c-portrait-chat-set-nick"
    :visible.sync="dialogVisible"
    :title="$lang('chat.setNick.title')"
    :theme="PopupTheme.Portrait"
  >
    <div class="c-portrait-chat-set-nick__content">
      <form-wrap
        :form-data="formData"
        :form-rules="formRules"
        :submit-action="submitSetNick"
      >
        <form-item
          form-field="nickname"
          :show-error-message="false"
        >
          <mobile-form-input
            v-model="formData.nickname"
            :placeholder="$lang('chat.setNick.placeholder')"
            :theme="FormTheme.Simplicity"
            :size="FormSize.Small"
          />
        </form-item>
        <div class="c-portrait-chat-set-nick__content__buttons">
          <form-submit-button
            :text="$lang('base.confirm')"
            :size="ButtonSize.Small"
            :type="ButtonType.Portrait"
          />
        </div>
      </form-wrap>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { FormTheme, FormSize } from '@/components/common-base/form/types/enums';
import { PopupTheme } from '@/components/common-base/popup/types';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import MobileFormInput from '@/components/common-base/form/form-input/mobile-form-input.vue';
import { useChatSetNick } from './use-chat-set-nick';

const { dialogVisible, formData, formRules, submitSetNick } = useChatSetNick();
</script>

<style lang="scss">
.c-portrait-chat-set-nick__content {
  padding: 20px 16px 24px;
}
.c-portrait-chat-set-nick__content__buttons {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
</style>
