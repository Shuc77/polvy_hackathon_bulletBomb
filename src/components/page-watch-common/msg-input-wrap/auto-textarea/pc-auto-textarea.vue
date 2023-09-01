<!-- @file PC 端消息 textarea 输入框 -->
<template>
  <div
    class="c-pc-auto-textarea pws-pc-chat-msg-input"
    :class="{
      'is-disabled': disabled,
    }"
  >
    <textarea
      ref="textareaRef"
      class="c-pc-auto-textarea__inner pws-pc-chat-msg-input-textarea"
      enterkeyhint="send"
      rows="1"
      :value="realValue"
      :maxlength="maxlength"
      :placeholder="textareaPlaceholder"
      :disabled="disabled"
      :style="{
        maxHeight: `${textareaMaxHeight}px`,
        fontSize: `${fontSize}px`,
        lineHeight: `${lineHeight}`,
      }"
      @blur="onBlur"
      @focus="onFocus"
      @input="onInput"
      @keypress.enter.exact.prevent="onSubmit"
      @keypress.shift.enter="onEnter"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { useProps } from '@/assets/utils/vue-utils/props-utils';
import { autoTextareaProps, autoTextareaEmits, useAutoTextarea } from './use-auto-textarea';

const props = defineProps(autoTextareaProps());

const emit = defineEmits(autoTextareaEmits());

const { maxlength, disabled, lineHeight, fontSize } = useProps(props);

const {
  textareaRef,
  textareaPlaceholder,
  textareaMaxHeight,
  realValue,
  textareaInstance,
  onBlur,
  onFocus,
  onInput,
  onEnter,
  onSubmit,
} = useAutoTextarea({
  props,
  emit,
});

defineExpose(textareaInstance);
</script>

<style lang="scss">
$--textarea-min-height: 32px;

.c-pc-auto-textarea {
  width: 100%;
  min-height: $--textarea-min-height;
  background-color: #1a1b1f;
}

.c-pc-auto-textarea__inner {
  box-sizing: border-box;
  width: 100%;
  min-height: 17px;
  padding: 0 8px;
  margin: 5px 0;
  overflow-x: hidden;
  overflow-y: auto;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6; // (14 + 8)/14
  color: inherit;
  vertical-align: top;
  resize: none;
  background: transparent;
  border: none;
  @include scrollbar;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::placeholder {
    color: #adadc0;
  }

  &:disabled,
  &:disabled::placeholder {
    color: rgba(#adadc0, 0.5);
  }
}
</style>
