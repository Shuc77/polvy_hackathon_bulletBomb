<!-- @file 移动端聊天消息容器 -->
<template>
  <div
    class="c-mobile-ai-assistant-msg-container"
    :class="{
      'c-mobile-ai-assistant-msg-container--special': isAIUser,
      'c-mobile-ai-assistant-msg-container__align-right': msgPosition === 'right',
    }"
  >
    <mobile-ai-assistant-msg-user />

    <div class="c-mobile-ai-assistant-msg-container__content">
      <div
        ref="referenceRef"
        class="c-mobile-ai-assistant-msg-container__content__inner"
        @click="onClickControl"
      >
        <div
          v-if="bubbleModel"
          class="c-mobile-ai-assistant-msg-container__content__bubble"
          :class="{
            'c-mobile-ai-assistant-msg-container__content__bubble__align-right':
              msgPosition === 'right',
            'pws-ai-msg-bubble-color': isAIUser,
            'pws-primary-text-color': !isAIUser,
            'pws-dark-basic-bg-20': !isAIUser,
            'pws-light-basic-bg-20': !isAIUser,
          }"
          :style="bubbleStyle"
        >
          <slot></slot>
        </div>
        <slot v-else></slot>

        <!-- 气泡提示 -->
        <transition
          v-if="!disabledTips"
          name="fade"
        >
          <div
            v-show="tipsVisible"
            class="c-mobile-ai-assistant-msg-container__tips-bubble"
            @click.stop="onClickTips"
          >
            <slot name="tips-content"></slot>
          </div>
        </transition>
      </div>

      <!-- 气泡后缀内容 -->
      <div class="c-mobile-ai-assistant-msg-container__content__suffix">
        <slot name="suffix"></slot>
      </div>
    </div>

    <div
      v-if="renderOtherContent"
      class="c-mobile-ai-assistant-msg-container__content"
    >
      <div class="c-mobile-ai-assistant-msg-container__content__inner">
        <div
          v-if="bubbleModel"
          class="c-mobile-ai-assistant-msg-container__content__bubble"
          :class="{
            'c-mobile-ai-assistant-msg-container__content__bubble__align-right':
              msgPosition === 'right',
            'pws-ai-msg-bubble-color': isAIUser,
            'pws-primary-text-color': !isAIUser,
            'pws-dark-basic-bg-20': !isAIUser,
            'pws-light-basic-bg-20': !isAIUser,
          }"
          :style="bubbleStyle"
        >
          <slot name="other-content"></slot>
        </div>
        <slot
          v-else
          name="other-content"
        ></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MobileAiAssistantMsgUser from '../_msg-user-info/mobile-ai-assistant-msg-user.vue';
import { msgContainerProps, useMsgContainer } from './use-ai-assistant-msg-container';
import { msgTipsControlProps, useMsgTipsControl } from './use-msg-tips-control';
import { useProps } from '@polyv/vue-components';
import { useAIAssistantMsgInjectInfo } from '../_hooks/use-ai-assistant-msg-inject-info';

const props = defineProps({
  ...msgContainerProps(),
  ...msgTipsControlProps(),
});

const { isAIUser, msgPosition } = useAIAssistantMsgInjectInfo();

const { bubbleModel } = useProps(props);

const { bubbleStyle } = useMsgContainer({ props });

const { referenceRef, tipsVisible, onClickControl, onClickTips } = useMsgTipsControl({ props });
</script>

<style lang="scss">
@import '../_styles/vars.scss';

.c-mobile-ai-assistant-msg-container {
  display: flex;
  flex-direction: column;
  &__align-right {
    align-items: flex-end;
  }
}

.c-mobile-ai-assistant-msg-container__content {
  display: flex;
  align-items: flex-end;
  padding: 3px $--msg-container-padding-size 0 $--msg-user-avatar-padding-mobile;
  margin: 0 $--margin-horizontal-margin;
}

.c-mobile-ai-assistant-msg-container__content__inner {
  position: relative;
  max-width: 100%;
}

.c-mobile-ai-assistant-msg-container__tips-bubble {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  padding: 10px 15px;
  font-size: 14px;
  color: rgba($--color-white, 0.8);
  white-space: nowrap;
  background-color: rgba(#424453, 0.95);
  border-radius: 4px;
  transform: translateX(-50%);

  &::after {
    position: absolute;
    top: 100%;
    left: 50%;
    height: 0;
    content: '';
    border-color: rgba(#424453, 0.95) transparent transparent transparent;
    border-style: solid;
    border-width: 5px;
    transform: translateX(-50%);
  }
}

.c-mobile-ai-assistant-msg-container__content__bubble {
  padding: 8px 12px;
  font-size: 16px;
  line-height: 22px;
  color: #e4e4e4;
  word-break: break-word;
  background-color: #2b2c35;
  border-radius: 0 6px 6px 6px;
  &__align-right {
    border-radius: 6px 0 6px 6px;
  }
}

// .c-mobile-ai-assistant-msg-container--special {
//   .c-mobile-ai-assistant-msg-container__content__bubble {
//     color: $--color-white;
//     background-color: #5394f6;
//   }
// }

.c-mobile-ai-assistant-msg-container__content__suffix {
  flex-shrink: 0;
  margin-left: 10px;
  font-size: 12px;
  white-space: nowrap;

  &:empty {
    display: none;
  }
}
</style>
