<!-- @file 移动端聊天室底部输入框区域 -->
<template>
  <div class="c-mobile-chat-input-controller">
    <mobile-msg-input-wrap
      ref="msgInputWrapRef"
      :placeholder="chatInputPlaceholder"
      :disabled-input="chatInputDisabled"
      :disabled-emotion-picker="chatInputDisabled"
      :disabled-send-image="chatInputDisabled"
      :face-emotion-enabled="chatSetting.faceEmotionEnabled"
      :image-emotion-enabled="chatSetting.imageEmotionEnabled"
      :is-alway-active="isAlwayActive"
      render-suffix-slot
      @system-msg="onSendSystemMsg"
      @submit="onSubmitMessage"
      @click-input-wrap="checkNeedRealNameAuth"
    >
      <template
        v-if="!isPureness"
        #main-prefix
      >
        <mobile-chat-msg-quote />
      </template>

      <template
        v-if="!isPureness"
        #suffix
      >
        <!-- 更多 -->
        <div
          class="c-mobile-chat-input-controller__btn c-mobile-chat-input-controller__btn--more pws-mobile-more-button"
          @click="showMore"
        ></div>

        <!-- 打赏 -->
        <div
          v-if="showDonateFunction"
          class="c-mobile-chat-input-controller__btn c-mobile-chat-input-controller__btn--donate pws-mobile-donate-button"
          @click="showDonate"
        ></div>
        <!-- 点赞 -->
        <mobile-chat-like
          v-if="likeFeatureEnabled"
          class="c-mobile-chat-input-controller__btn"
        />
      </template>
    </mobile-msg-input-wrap>
  </div>
</template>

<script setup lang="ts">
import MobileChatMsgQuote from '@/components/page-watch-common/chat/chat-msg-quote/mobile-chat-msg-quote.vue';
import MobileMsgInputWrap from '@/components/page-watch-common/msg-input-wrap/mobile-msg-input-wrap/mobile-msg-input-wrap.vue';
import MobileChatLike from '@/components/page-watch-common/chat/chat-like/mobile-chat-like.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useDonateStore } from '@/store/use-donate-store';

import { appEvents, eventBus, useEventBusListener } from '@/app/app-events';
import { useChatStore } from '@/store/use-chat-store';
import { useChatInputController } from '../hooks/use-chat-input-controller';
import { useViewerStore } from '@/store/use-viewer-store';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';

const props = defineProps({
  /** 是否为纯净模式 */
  isPureness: PropUtils.bool.def(false),
  /** 是否处于激活状态 */
  isAlwayActive: PropUtils.bool.def(false),
});

const viewerStore = useViewerStore();
const checkNeedRealNameAuth = viewerStore.checkNeedRealNameAuth;

const {
  onSubmitMessage,
  onSendSystemMsg,

  msgInputWrapRef,
  focusMsgInput,
  chatInputInstance,
} = useChatInputController({
  autoListen: !props.isPureness,
});

if (!props.isPureness) {
  useEventBusListener(appEvents.chat.FocusToChatInput, () => {
    focusMsgInput();
  });
}

const { chatInputPlaceholder, chatInputDisabled, chatSetting, likeFeatureEnabled } =
  storeDefinitionToRefs(useChatStore);

const { showDonateFunction } = storeDefinitionToRefs(useDonateStore);

function showMore() {
  eventBus.$emit(appEvents.global.OpenMobileMorePopup, true);
}

function showDonate() {
  eventBus.$emit(appEvents.donate.OpenDonatePopup, true);
}

defineExpose(chatInputInstance);
</script>

<style lang="scss">
.c-mobile-chat-input-controller__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  min-width: 36px;
  height: 36px;
  border-radius: 50%;

  &::after {
    width: 20px;
    height: 20px;
    content: '';
    background-size: 100% 100%;
  }

  & + & {
    margin-left: 12px;
  }
}

.c-mobile-chat-input-controller__btn--donate::after {
  background-image: url(../imgs/icon-gift.png);
}
</style>
