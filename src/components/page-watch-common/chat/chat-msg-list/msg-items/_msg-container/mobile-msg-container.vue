<!-- @file 移动端聊天消息容器 -->
<template>
  <div
    class="c-mobile-msg-container"
    :class="{
      'c-mobile-msg-container--special pws-chat-msg-container-special': isSpecialUser,
      'c-mobile-msg-container--suffix-align-center': suffixMode === 'align-center',
    }"
  >
    <mobile-msg-user-info />

    <div class="c-mobile-msg-container__content">
      <div
        ref="referenceRef"
        class="c-mobile-msg-container__content__inner"
        @click="onClickReferenceRef"
      >
        <div
          v-if="bubbleModel"
          class="c-mobile-msg-container__content__bubble pws-chat-msg-bubble"
          :style="bubbleStyle"
        >
          <slot></slot>
        </div>
        <slot v-else></slot>
      </div>

      <!-- 气泡后缀内容 -->
      <div class="c-mobile-msg-container__content__suffix">
        <slot name="suffix"></slot>
      </div>
    </div>

    <div
      v-if="renderOtherContent"
      class="c-mobile-msg-container__content"
    >
      <div class="c-mobile-msg-container__content__inner">
        <div
          v-if="bubbleModel"
          class="c-mobile-msg-container__content__bubble pws-chat-msg-bubble"
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
import MobileMsgUserInfo from '../_msg-user-info/mobile-msg-user-info.vue';
import { msgContainerProps, useMsgContainer } from './use-msg-container';
import { msgTipsControlProps } from './use-msg-tips-control';
import { useChatMsgUserInject } from '../_hooks/chat-msg-user-hook';
import { useProps } from '@/assets/utils/vue-utils/props-utils';
import { emitFunc } from '@/assets/utils/vue-utils/emit-utils';
import { ref } from 'vue';

const props = defineProps({
  ...msgContainerProps(),
  ...msgTipsControlProps(),
});

const { bubbleModel, suffixMode } = useProps(props);

const { isSpecialUser } = useChatMsgUserInject();

const { bubbleStyle } = useMsgContainer({ props });

const emit = defineEmits({
  'click-msg-to-tips': emitFunc<{
    target: HTMLDivElement;
    mountEl: string;
  }>(),
});

const referenceRef = ref(null);

function onClickReferenceRef() {
  if (!referenceRef.value) return;
  emit('click-msg-to-tips', {
    target: referenceRef.value,
    mountEl: 'c-mobile-chat-msg-list__container',
  });
}
</script>

<style lang="scss">
@import '../_styles/vars.scss';

.c-mobile-msg-container__content {
  display: flex;
  align-items: flex-end;
  padding: 3px $--msg-container-padding-size 0 $--msg-user-avatar-padding-mobile;
  margin: 0 $--margin-horizontal-margin;
}

.c-mobile-msg-container__content__inner {
  position: relative;
  max-width: 100%;
}

.c-mobile-msg-container__tips-bubble {
  padding: 10px 15px;
  font-size: 14px;
  color: rgba($--color-white, 0.8);
  white-space: nowrap;
  background-color: rgba(66, 68, 83, 0.95);
  border-radius: 4px;
}

.c-mobile-msg-container__content__bubble {
  padding: 8px 12px;
  font-size: 16px;
  line-height: 22px;
  color: #e4e4e4;
  word-break: break-word;
  background-color: #2b2c35;
  border-radius: 0 6px 6px 6px;
}

.c-mobile-msg-container--special {
  .c-mobile-msg-container__content__bubble {
    color: $--color-white;
    background-color: #5394f6;
  }
}

.c-mobile-msg-container--suffix-align-center {
  .c-mobile-msg-container__content__suffix {
    align-self: center;
  }
}

.c-mobile-msg-container__content__suffix {
  flex-shrink: 0;
  margin-left: 10px;
  font-size: 12px;
  white-space: nowrap;

  &:empty {
    display: none;
  }
}
</style>
