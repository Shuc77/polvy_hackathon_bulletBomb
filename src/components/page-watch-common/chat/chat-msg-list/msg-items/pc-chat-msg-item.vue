<!-- @file PC 端聊天室消息渲染节点 -->
<template>
  <div
    v-show="msgVisible"
    class="c-pc-chat-msg-item"
  >
    <div
      v-if="showMsgTime"
      class="c-pc-chat-msg-item__time pws-chat-msg-time"
    >
      {{ msgTimeText }}
    </div>
    <div class="c-pc-chat-msg-item__content">
      <template v-if="iarSdkLoaded">
        <!-- 红包消息 -->
        <pc-redpaper-msg v-if="chatMsg.msgSource === ChatMsgSource.Redpaper" />
        <!-- 红包领取消息 -->
        <pc-redpaper-receive-msg v-else-if="chatMsg.msgSource === ChatMsgSource.RedpaperReceive" />
      </template>
      <!-- 发言消息 -->
      <pc-speak-msg v-if="chatMsg.msgSource === ChatMsgSource.Speak" />
      <!-- 自定义消息(服务端) -->
      <pc-customer-msg v-else-if="chatMsg.msgSource === ChatMsgSource.CustomerMessage" />
      <!-- 自定义消息(客户端) -->
      <pc-custom-msg v-else-if="chatMsg.msgSource === ChatMsgSource.CustomMessage" />
      <!-- 文件分享消息 -->
      <pc-file-msg v-else-if="chatMsg.msgSource === ChatMsgSource.File" />
      <!-- 系统消息 -->
      <pc-system-msg v-else-if="chatMsg.msgSource === ChatMsgSource.System" />
      <!-- 打赏消息 -->
      <pc-reward-msg v-else-if="chatMsg.msgSource === ChatMsgSource.Reward" />
      <!-- 表情消息 -->
      <pc-emotion-msg v-else-if="chatMsg.msgSource === ChatMsgSource.Emotion" />
      <!-- 图片消息 -->
      <pc-image-msg v-else-if="chatMsg.msgSource === ChatMsgSource.Image" />
      <!-- 课堂激励点赞消息 -->
      <pc-motivation-like-msg v-else-if="chatMsg.msgSource === ChatMsgSource.MotivationLike" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatMsgSource } from '@polyv/live-watch-sdk';
import PcCustomerMsg from './customer-msg/pc-customer-msg.vue';
import PcCustomMsg from './custom-msg/pc-custom-msg.vue';
import PcEmotionMsg from './emotion-msg/pc-emotion-msg.vue';
import PcFileMsg from './file-msg/pc-file-msg.vue';
import PcImageMsg from './image-msg/pc-image-msg.vue';
import PcRedpaperMsg from './redpaper-msg/pc-redpaper-msg.vue';
import PcRedpaperReceiveMsg from './redpaper-receive-msg/pc-redpaper-receive-msg.vue';
import PcRewardMsg from './reward-msg/pc-reward-msg.vue';
import PcSpeakMsg from './speak-msg/pc-speak-msg.vue';
import PcSystemMsg from './system-msg/pc-system-msg.vue';
import PcMotivationLikeMsg from './motivation-like-msg/pc-motivation-like-msg.vue';
import { chatMsgItemProps, useChatMsgItem } from './use-chat-msg-item';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const props = defineProps(chatMsgItemProps());

const { showMsgTime, chatMsg, msgTimeText, msgVisible } = useChatMsgItem({
  props,
});

const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);
</script>

<style lang="scss">
.c-pc-chat-msg-item__time {
  margin: 16px 0;
  font-size: 12px;
  text-align: center;
}
.c-pc-chat-msg-item__content {
  margin: 16px 0;
}
</style>
