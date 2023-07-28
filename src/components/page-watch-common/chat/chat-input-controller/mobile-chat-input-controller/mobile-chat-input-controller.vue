<!-- @file 移动端聊天室底部输入框区域 -->
<template>
  <div class="c-mobile-chat-input-controller">
    <mobile-msg-input-wrap
      ref="msgInputWrapRef"
      :placeholder="chatInputPlaceholder"
      :disabled-input="chatInputDisabled"
      :disabled-emotion-picker="chatInputDisabled"
      :disabled-send-image="chatInputDisabled"
      render-suffix-slot
      @system-msg="onSendSystemMsg"
      @submit="onSubmitMessage"
    >
      <template #main-prefix>
        <mobile-chat-msg-quote />
      </template>

      <template #suffix>
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
      </template>
    </mobile-msg-input-wrap>

    <!-- 更多弹层 -->
    <mobile-popup
      class="c-mobile-more-popup"
      :visible.sync="moreVisible"
      :show-header="false"
      content-background="none"
    >
      <mobile-more-panel @close="closeMore" />
    </mobile-popup>

    <!-- 打赏弹层 -->
    <mobile-popup
      class="c-mobile-donate-popup"
      :visible.sync="donateVisible"
      :show-header="false"
      content-background="none"
    >
      <mobile-donate-panel @donate-finish="closeDonate" />
    </mobile-popup>
  </div>
</template>

<script setup lang="ts">
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { useDonateStore } from '@/store/use-donate-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import MobileDonatePanel from '@/components/page-watch-common/donate/donate-panel/mobile-donate-panel/mobile-donate-panel.vue';
import MobileMorePanel from './mobile-more-panel.vue';
import MobileMsgInputWrap from '@/components/page-watch-common/msg-input-wrap/mobile-msg-input-wrap/mobile-msg-input-wrap.vue';
import MobileChatMsgQuote from '@/components/page-watch-common/chat/chat-msg-quote/mobile-chat-msg-quote.vue';

import { useChatInputController } from '../hooks/use-chat-input-controller';
import { useChatStore } from '@/store/use-chat-store';
import { useEventBusListener, appEvents } from '@/app/app-events';

const { onSubmitMessage, onSendSystemMsg, msgInputWrapRef, focusMsgInput } =
  useChatInputController();

useEventBusListener(appEvents.chat.FocusToChatInput, () => {
  focusMsgInput();
});

const { chatInputPlaceholder, chatInputDisabled } = storeDefinitionToRefs(useChatStore);

const { showDonateFunction } = storeDefinitionToRefs(useDonateStore);

const { visible: donateVisible, show: showDonate, close: closeDonate } = useSimpleVisible();

const { visible: moreVisible, show: showMore, close: closeMore } = useSimpleVisible();
</script>

<style lang="scss">
.c-mobile-chat-input-controller__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
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
