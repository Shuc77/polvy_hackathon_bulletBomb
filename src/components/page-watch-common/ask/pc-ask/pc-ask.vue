<!-- @file PC 端提问 -->
<template>
  <div class="c-pc-ask">
    <!-- 消息列表 -->
    <div class="c-pc-ask__msg-list">
      <pc-ask-msg-list
        ref="askMsgListRef"
        :ask-msg-list="askMsgRenderList"
        @near-top="getAskMsgList"
      />
    </div>

    <!-- 输入框 -->
    <div class="c-pc-ask__input">
      <pc-msg-input-wrap
        ref="msgInputWrapRef"
        :image-emotion-enabled="false"
        :send-image-enabled="questionImageEnabled"
        :image-paste-input-enabled="imagePasteInputEnabled"
        :placeholder="askInputPlaceholder"
        @submit="onSubmitMessage"
        @click-send-image="onClickSendImage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { isLowerIE } from '@/assets/utils/browser';

import PcAskMsgList from '../ask-msg-list/pc-ask-msg-list.vue';
import PcMsgInputWrap from '@/components/page-watch-common/msg-input-wrap/pc-msg-input-wrap/pc-msg-input-wrap.vue';
import { useAsk } from '../hooks/use-ask';
import { useAskSend } from '../hooks/use-ask-send';
import { AskMsgListInstance } from '../ask-msg-list/use-ask-msg-list';

const askMsgListRef = ref<AskMsgListInstance>();

const { askInputPlaceholder, askMsgRenderList, questionImageEnabled, getAskMsgList } = useAsk({
  askMsgListRef,
});

/** 是否使用图片粘贴输入框 */
const imagePasteInputEnabled = computed(() => {
  if (isLowerIE) return false;
  return questionImageEnabled.value;
});

const { msgInputWrapRef, onSubmitMessage, onClickSendImage } = useAskSend();
</script>

<style lang="scss">
.c-pc-ask {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.c-pc-ask__msg-list {
  flex: 1;
  overflow: hidden;
}
</style>
