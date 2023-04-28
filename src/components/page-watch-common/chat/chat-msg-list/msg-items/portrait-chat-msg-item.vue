<!-- @file 竖屏端聊天室消息渲染节点 -->
<template>
  <div
    v-show="msgVisible"
    class="c-portrait-chat-msg-item"
  >
    <div class="c-portrait-chat-msg-item__content">
      <!-- 发言消息 -->
      <portrait-speak-msg v-if="chatMsg.msgSource === ChatMsgSource.Speak" />
      <!-- 红包消息 -->
      <portrait-redpaper-msg v-else-if="chatMsg.msgSource === ChatMsgSource.Redpaper" />
      <!-- 红包领取消息 -->
      <portrait-redpaper-receive-msg
        v-else-if="chatMsg.msgSource === ChatMsgSource.RedpaperReceive"
      />
      <!-- 自定义消息 -->
      <portrait-customer-msg v-else-if="chatMsg.msgSource === ChatMsgSource.CustomerMessage" />
      <!-- 文件分享消息 -->
      <portrait-file-msg v-else-if="chatMsg.msgSource === ChatMsgSource.File" />
      <!-- 系统消息 -->
      <portrait-system-msg v-else-if="chatMsg.msgSource === ChatMsgSource.System" />
      <!-- 打赏消息 -->
      <portrait-reward-msg v-else-if="chatMsg.msgSource === ChatMsgSource.Reward" />
      <!-- 表情消息 -->
      <portrait-emotion-msg v-else-if="chatMsg.msgSource === ChatMsgSource.Emotion" />
      <!-- 图片消息 -->
      <portrait-image-msg v-else-if="chatMsg.msgSource === ChatMsgSource.Image" />
    </div>
  </div>
</template>

<script setup lang="ts">
import PortraitSpeakMsg from './speak-msg/portrait-speak-msg.vue';
import PortraitRedpaperMsg from './redpaper-msg/portrait-redpaper-msg.vue';
import PortraitRedpaperReceiveMsg from './redpaper-receive-msg/portrait-redpaper-receive-msg.vue';
import PortraitCustomerMsg from './customer-msg/portrait-customer-msg.vue';
import PortraitFileMsg from './file-msg/portrait-file-msg.vue';
import PortraitSystemMsg from './system-msg/portrait-system-msg.vue';
import PortraitRewardMsg from './reward-msg/portrait-reward-msg.vue';
import PortraitEmotionMsg from './emotion-msg/portrait-emotion-msg.vue';
import PortraitImageMsg from './image-msg/portrait-image-msg.vue';
import { chatMsgItemProps, useChatMsgItem } from './use-chat-msg-item';
import { ChatMsgSource } from '@polyv/live-watch-sdk';

const props = defineProps(chatMsgItemProps());

const { chatMsg, msgVisible } = useChatMsgItem({
  props,
});
</script>

<style lang="scss">
.c-portrait-chat-msg-item__content {
  margin: 4px 0;
}
</style>
