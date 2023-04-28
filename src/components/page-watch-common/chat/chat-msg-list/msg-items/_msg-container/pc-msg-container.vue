<!-- @file PC 端聊天消息容器 -->
<template>
  <div
    class="c-pc-msg-container"
    :class="{
      'c-pc-msg-container--special pws-chat-msg-container-special': isSpecialUser,
    }"
  >
    <pc-msg-user-info />

    <div class="c-pc-msg-container__content">
      <div class="c-pc-msg-container__content__inner">
        <div
          v-if="bubbleModel"
          class="c-pc-msg-container__content__bubble pws-chat-msg-bubble"
          :style="bubbleStyle"
        >
          <slot></slot>
        </div>
        <slot v-else></slot>
      </div>

      <!-- 气泡后缀内容 -->
      <div class="c-pc-msg-container__content__suffix">
        <slot name="suffix"></slot>
      </div>
    </div>

    <div
      v-if="renderOtherContent"
      class="c-pc-msg-container__content"
    >
      <div class="c-pc-msg-container__content__inner">
        <div
          v-if="bubbleModel"
          class="c-pc-msg-container__content__bubble pws-chat-msg-bubble"
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
import PcMsgUserInfo from '../_msg-user-info/pc-msg-user-info.vue';
import { msgContainerProps, useMsgContainer } from './use-msg-container';
import { useChatMsgUserInject } from '../_hooks/chat-msg-user-hook';
import { useProps } from '@/assets/utils/vue-utils/props-utils';

const props = defineProps(msgContainerProps());

const { bubbleModel } = useProps(props);

const { isSpecialUser } = useChatMsgUserInject();

const { bubbleStyle } = useMsgContainer({
  props,
});
</script>

<style lang="scss">
@import '../_styles/vars.scss';

.c-pc-msg-container__content {
  display: flex;
  align-items: flex-end;
  padding: 4px $--msg-container-padding-size 0 $--msg-user-avatar-padding;
  margin: 0 $--margin-horizontal-margin;
}

.c-pc-msg-container__content__inner {
  max-width: 100%;
}

.c-pc-msg-container__content__bubble {
  padding: 8px;
  font-size: 14px;
  line-height: 21px;
  word-break: break-word;
  border-radius: 0 6px 6px 6px;
}

.c-pc-msg-container__content__suffix {
  flex-shrink: 0;
  margin-left: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;

  &:empty {
    display: none;
  }
}

.c-pc-msg-container__content:hover {
  .c-pc-msg-container__content__suffix {
    opacity: 1;
  }
}
</style>
