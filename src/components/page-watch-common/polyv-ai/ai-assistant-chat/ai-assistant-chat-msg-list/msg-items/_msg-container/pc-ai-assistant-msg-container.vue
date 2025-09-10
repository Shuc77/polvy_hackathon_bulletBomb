<!-- @file PC 端聊天消息容器 -->
<template>
  <div
    class="c-pc-ai-assistant-msg-container"
    :class="{
      'c-pc-ai-assistant-msg-container--special': isAIUser,
      'c-pc-ai-assistant-msg-container__align-right': msgPosition === 'right',
    }"
  >
    <pc-ai-assistant-msg-user />

    <div class="c-pc-ai-assistant-msg-container__content">
      <div class="c-pc-ai-assistant-msg-container__content__inner">
        <div
          v-if="bubbleModel"
          class="c-pc-ai-assistant-msg-container__content__bubble"
          :class="{
            'c-pc-ai-assistant-msg-container__content__bubble__align-right':
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
      </div>

      <!-- 气泡后缀内容 -->
      <div class="c-pc-ai-assistant-msg-container__content__suffix">
        <slot name="suffix"></slot>
      </div>
    </div>

    <div
      v-if="renderOtherContent"
      class="c-pc-ai-assistant-msg-container__content"
    >
      <div class="c-pc-ai-assistant-msg-container__content__inner">
        <div
          v-if="bubbleModel"
          class="c-pc-ai-assistant-msg-container__content__bubble"
          :class="{
            'c-pc-ai-assistant-msg-container__content__bubble__align-right':
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
import PcAiAssistantMsgUser from '../_msg-user-info/pc-ai-assistant-msg-user.vue';
import { msgContainerProps, useMsgContainer } from './use-ai-assistant-msg-container';
import { useProps } from '@polyv/vue-components';
import { useAIAssistantMsgInjectInfo } from '../_hooks/use-ai-assistant-msg-inject-info';

const props = defineProps(msgContainerProps());

const { isAIUser, msgPosition } = useAIAssistantMsgInjectInfo();

const { bubbleModel } = useProps(props);

const { bubbleStyle } = useMsgContainer({
  props,
});
</script>

<style lang="scss">
@import '../_styles/vars.scss';

.c-pc-ai-assistant-msg-container {
  display: flex;
  flex-direction: column;
  &__align-right {
    align-items: flex-end;
  }
}

.c-pc-ai-assistant-msg-container__content {
  display: flex;
  align-items: flex-end;
  padding: 4px $--msg-container-padding-size 0 $--msg-user-avatar-padding;
  margin: 0 $--margin-horizontal-margin;
}

.c-pc-ai-assistant-msg-container__content__inner {
  max-width: 100%;
}

.c-pc-ai-assistant-msg-container__content__bubble {
  padding: 8px;
  font-size: 14px;
  line-height: 21px;
  word-break: break-word;
  border-radius: 0 6px 6px 6px;
  &__align-right {
    border-radius: 6px 0 6px 6px;
  }
}

.c-pc-ai-assistant-msg-container__content__suffix {
  flex-shrink: 0;
  margin-left: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;

  &:empty {
    display: none;
  }
}

.c-pc-ai-assistant-msg-container__content:hover {
  .c-pc-ai-assistant-msg-container__content__suffix {
    opacity: 1;
  }
}
</style>
