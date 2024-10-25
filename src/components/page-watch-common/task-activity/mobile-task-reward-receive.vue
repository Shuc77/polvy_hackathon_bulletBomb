<template>
  <mobile-popup
    class="c-mobile-task-reward-receive"
    :visible.sync="visible"
    fill-body-section
    :title="$lang('taskActivity.rewardReceive.title')"
  >
    <div
      v-if="acceptType === RewardAcceptType.Form"
      class="c-mobile-task-reward-receive__body"
      :class="{
        'c-mobile-task-reward-receive__body--readonly': isReadonly,
      }"
    >
      <div class="c-mobile-task-reward-receive__content">
        <template v-for="(item, index) in formList">
          <div
            v-if="isSimpleFormType(item.type)"
            :key="`normal-${index}`"
            class="c-mobile-task-reward-receive__form-item"
            :class="{
              'c-mobile-task-reward-receive__form-item--required': item.required && !isReadonly,
            }"
          >
            <div class="c-mobile-task-reward-receive__form-item__label">
              {{ getItemText(item).label }}
            </div>
            <div class="c-mobile-task-reward-receive__form-item__content">
              <input
                v-if="!isReadonly"
                class="c-mobile-task-reward-receive__form-item__input"
                v-model="formList[index].value"
                :readonly="isReadonly"
                :placeholder="getItemText(item).placeholder"
              />
              <div v-else>{{ formList[index].value }}</div>
            </div>
          </div>

          <div
            :key="`address-picker-${index}`"
            v-if="item.type === RewardAcceptFormType.Address && !isReadonly"
            class="c-mobile-task-reward-receive__form-item"
            :class="{
              'c-mobile-task-reward-receive__form-item--required': item.required,
            }"
          >
            <div class="c-mobile-task-reward-receive__form-item__label">
              {{ getItemText(item).label }}
            </div>
            <div class="c-mobile-task-reward-receive__form-item__content">
              <mobile-form-area-picker
                v-model="areaPickerValue"
                :placeholder="$lang('taskActivity.rewardReceive.addressPlaceholder')"
              />
            </div>
          </div>

          <div
            :key="`address-detail-${index}`"
            v-if="item.type === RewardAcceptFormType.Address"
            class="c-mobile-task-reward-receive__form-item"
            :class="{
              'c-mobile-task-reward-receive__form-item--required': item.required && !isReadonly,
            }"
          >
            <div class="c-mobile-task-reward-receive__form-item__label">
              {{
                isReadonly
                  ? $lang('taskActivity.rewardReceive.addressDetail2')
                  : $lang('taskActivity.rewardReceive.addressDetail')
              }}
            </div>
            <div class="c-mobile-task-reward-receive__form-item__content">
              <textarea
                v-if="!isReadonly"
                class="c-mobile-task-reward-receive__form-item__textarea"
                v-model="formList[index].value"
                :placeholder="getItemText(item).placeholder"
                :readonly="isReadonly"
                rows="4"
              ></textarea>
              <div v-else>
                {{ formList[index].value }}
              </div>
            </div>
          </div>
        </template>
      </div>

      <div
        v-if="!isReadonly"
        class="c-mobile-task-reward-receive__submit"
      >
        <normal-button
          block
          @click="submitForm"
          >{{ $lang('base.submit') }}</normal-button
        >
      </div>
    </div>

    <!-- 二维码 -->
    <div
      v-if="acceptType === RewardAcceptType.QrCode"
      class="c-mobile-task-reward-receive__qrcode"
    >
      <img :src="qrCode" />

      <div class="c-mobile-task-reward-receive__qrcode__tips">{{ qrCodeTips }}</div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import MobileFormAreaPicker from '@/components/common-base/form/form-area-picker/mobile-form-area-picker.vue';
import { useTaskRewardReceive } from './hooks/use-task-reward-receive';
import { RewardAcceptFormType, RewardAcceptType } from '@polyv/live-watch-sdk';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';

const {
  visible,
  isReadonly,
  acceptType,
  qrCode,
  qrCodeTips,
  areaPickerValue,
  formList,
  isSimpleFormType,
  submitForm,
  getItemText,
} = useTaskRewardReceive();
</script>

<style lang="scss">
.c-mobile-task-reward-receive__body {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 12px;
}
.c-mobile-task-reward-receive__content {
  flex: 1;
  overflow: auto;
}

.c-mobile-task-reward-receive__form-item {
  display: flex;
  align-items: flex-start;
}
.c-mobile-task-reward-receive__form-item__label {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 94px;
  min-height: 50px;
  padding: 0 12px;
}

.c-mobile-task-reward-receive__form-item--required {
  .c-mobile-task-reward-receive__form-item__label::before {
    color: red;
    content: '*';
  }
}

.c-mobile-task-reward-receive__form-item__content {
  flex: 1;
  border-bottom: 1px solid #ddd;

  .c-mobile-form-area-picker__body {
    background: none;
    border: none;
  }
  .c-mobile-form-area-picker__body__input {
    padding-left: 0 !important;
    font-size: 14px;
  }
}

.c-mobile-task-reward-receive__form-item__input {
  display: flex;
  width: 100%;
  height: 50px;
  border: none;
  outline: none;
}
.c-mobile-task-reward-receive__form-item__textarea {
  display: flex;
  width: 100%;
  padding-top: 15px;
  border: none;
  outline: none;
}

.c-mobile-task-reward-receive__submit {
  padding: 24px;
}

.c-mobile-task-reward-receive__qrcode {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;

  img {
    width: 200px;
    height: 200px;
  }
}
.c-mobile-task-reward-receive__qrcode__tips {
  padding: 0 12px;
  margin-top: 12px;
  font-size: 16px;
}

.c-mobile-task-reward-receive__body--readonly {
  .c-mobile-task-reward-receive__form-item__label {
    align-items: flex-start;
  }
  .c-mobile-task-reward-receive__form-item__label,
  .c-mobile-task-reward-receive__form-item__content {
    box-sizing: border-box;
    min-height: 50px;
    padding-top: 14px;
    padding-bottom: 14px;
    line-height: 22px;
  }
}
</style>
