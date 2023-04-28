<!-- @file PC 端提问 -->
<template>
  <div class="c-mobile-ask">
    <!-- 消息列表 -->
    <div class="c-mobile-ask__msg-list">
      <mobile-ask-msg-list
        ref="askMsgListRef"
        :ask-msg-list="askMsgRenderList"
        @near-top="getAskMsgList"
      />
    </div>

    <!-- 输入框 -->
    <div class="c-mobile-ask__input">
      <mobile-msg-input-wrap
        ref="msgInputWrapRef"
        :image-emotion-enabled="false"
        :placeholder="askInputPlaceholder"
        @submit="onSubmitMessage"
        @click-send-image="onClickSendImage"
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

const askMsgListRef = ref<AskMsgListInstance>();

const { askInputPlaceholder, askMsgRenderList, getAskMsgList } = useAsk({ askMsgListRef });

const { msgInputWrapRef, onSubmitMessage, onClickSendImage } = useAskSend();
</script>

<style lang="scss">
.c-mobile-ask {
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
