<!-- @file 移动端-消息弹窗 -->

<template>
  <transition
    name="fade"
    @after-enter="onAfterEnter"
    @after-leave="onAfterLeave"
  >
    <div
      ref="messageBoxRef"
      v-show="innerVisible"
      class="c-mobile-message-box"
    >
      <div
        class="c-mobile-message-box__bg"
        @click="onCancel"
      ></div>
      <div
        class="c-mobile-message-box__main"
        :class="{ 'c-mobile-message-box__main--rotate': isRotate }"
      >
        <div class="c-mobile-message-box__header">
          <p class="c-mobile-message-box__title">{{ props.title }}</p>
        </div>
        <div class="c-mobile-message-box__body">
          <div
            v-if="props.content"
            v-html="props.content"
            ref="messageBoxContentRef"
            class="c-mobile-message-box__content"
          ></div>
        </div>
        <div class="c-mobile-message-box__footer">
          <button @click="onCancel">
            {{ props.cancelButtonText }}
          </button>
          <button @click="onConfirm">
            {{ props.confirmButtonText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { useAppendTo } from '@/hooks/behaviors/use-append-to';
import { messageBoxMobileProps, messageBoxEmits, useMessageBox } from './use-message-box';

const props = defineProps(messageBoxMobileProps());
const emit = defineEmits(messageBoxEmits());

const {
  messageBoxInstance,
  messageBoxRef,
  messageBoxContentRef,

  innerVisible,

  onAfterEnter,
  onAfterLeave,
  onCancel,
  onConfirm,
} = useMessageBox({ props, emit });

if (props.appendToBody) {
  useAppendTo(messageBoxRef);
}

defineExpose(messageBoxInstance);
</script>

<style lang="scss">
.c-mobile-message-box {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.c-mobile-message-box__bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
}
.c-mobile-message-box__main {
  z-index: 1;
  width: 300px;
  overflow: hidden;
  background: #fff;
  border-radius: 8px;
}
.c-mobile-message-box__main--rotate {
  transform: rotate(90deg);
}
.c-mobile-message-box__header {
  box-sizing: border-box;
  padding: 24px 0 16px;
  widows: 100%;
  .c-mobile-message-box__title {
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    color: #333333;
    text-align: center;
  }
}
.c-mobile-message-box__footer {
  box-sizing: border-box;
  border-top: 1px solid #ededef;
  button {
    box-sizing: border-box;
    display: inline-block;
    width: 50%;
    font-size: 16px;
    line-height: 48px;
    color: #3082fe;
    vertical-align: middle;
    background: #fff;
    &:first-child {
      border-right: 1px solid rgba(#000000, 0.1);
    }
  }
}
.c-mobile-message-box__body {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  font-size: 16px;
  line-height: 24px;
  color: #333;
}
.c-mobile-message-box__content {
  padding: 0 14px 20px;
  a {
    color: #3082fe;
    text-decoration: none;
  }
}

.c-mobile-message-box__main:not(.c-mobile-message-box__main--rotate) {
  display: flex;
  flex-direction: column;
  max-height: 95%;

  .c-mobile-message-box__body {
    flex: 1;
    overflow-y: auto;
  }
}
</style>
