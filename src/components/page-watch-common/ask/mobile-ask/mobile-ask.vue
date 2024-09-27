<!-- @file PC 端提问 -->
<template>
  <div class="c-mobile-ask">
    <!-- 消息列表 -->
    <div class="c-mobile-ask__msg-list">
      <mobile-ask-msg-list
        ref="askMsgListRef"
        :ask-msg-list="askMsgRenderList"
        @near-top="getAskMsgList"
        @near-bottom="hideMoreMsg"
        @scroll-to-new="scrollToNew"
      />
    </div>

    <!-- 输入框 -->
    <div class="c-mobile-ask__input">
      <mobile-msg-input-wrap
        ref="msgInputWrapRef"
        :face-emotion-enabled="chatSetting.faceEmotionEnabled"
        :image-emotion-enabled="false"
        :placeholder="askInputPlaceholder"
        :disabled-input="inputDisabled"
        :disabled-emotion-picker="needRealNameAuth"
        :disabled-send-image="needRealNameAuth"
        @submit="onSubmitMessage"
        @click-send-image="onClickSendImage"
        @system-msg="onSendSystemMsg"
        @click-image-emotion-enter="checkNeedRealNameAuth"
        @click-send-image-enter="checkNeedRealNameAuth"
        @click-input-wrap="checkNeedRealNameAuth"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import MobileAskMsgList from '../ask-msg-list/mobile-ask-msg-list.vue';
import MobileMsgInputWrap from '@/components/page-watch-common/msg-input-wrap/mobile-msg-input-wrap/mobile-msg-input-wrap.vue';
import { useAsk } from '../hooks/use-ask';
import { useAskSend } from '../hooks/use-ask-send';
import { ref } from 'vue';
import { AskMsgListInstance } from '../ask-msg-list/use-ask-msg-list';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useViewerStore } from '@/store/use-viewer-store';
import { useChatStore } from '@/store/use-chat-store';

const askMsgListRef = ref<AskMsgListInstance>();

const { needRealNameAuth } = storeDefinitionToRefs(useViewerStore);
const { checkNeedRealNameAuth } = useViewerStore();

const { chatSetting } = storeDefinitionToRefs(useChatStore);

const {
  askMsgRenderList,
  getAskMsgList,

  inputDisabled,
  askInputPlaceholder,

  scrollToNew,
  hideMoreMsg,
} = useAsk({
  askMsgListRef,
});

const { msgInputWrapRef, onSubmitMessage, onClickSendImage, onSendSystemMsg } = useAskSend({
  scrollToNew,
  hideMoreMsg,
});
</script>

<style lang="scss">
.c-mobile-ask {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.c-mobile-ask__msg-list {
  flex: 1;
  overflow: hidden;
}
</style>
