<!-- @file 移动端聊天室消息渲染节点 -->
<template>
  <div
    v-show="msgVisible"
    class="c-mobile-chat-msg-item"
  >
    <div
      v-if="showMsgTime"
      class="c-mobile-chat-msg-item__time pws-chat-msg-time"
    >
      {{ msgTimeText }}
    </div>
    <div class="c-mobile-chat-msg-item__content">
      <template v-if="iarSdkLoaded">
        <!-- 红包消息 -->
        <mobile-redpaper-msg v-if="chatMsg.msgSource === ChatMsgSource.Redpaper" />
        <!-- 红包领取消息 -->
        <mobile-redpaper-receive-msg
          v-else-if="chatMsg.msgSource === ChatMsgSource.RedpaperReceive"
        />
      </template>
      <!-- 发言消息 -->
      <mobile-speak-msg v-if="chatMsg.msgSource === ChatMsgSource.Speak" />
      <!-- 自定义消息（服务端） -->
      <mobile-customer-msg v-else-if="chatMsg.msgSource === ChatMsgSource.CustomerMessage" />
      <!-- 自定义消息(客户端) -->
      <mobile-custom-msg v-else-if="chatMsg.msgSource === ChatMsgSource.CustomMessage" />
      <!-- 文件分享消息 -->
      <mobile-file-msg v-else-if="chatMsg.msgSource === ChatMsgSource.File" />
      <!-- 系统消息 -->
      <mobile-system-msg v-else-if="chatMsg.msgSource === ChatMsgSource.System" />
      <!-- 打赏消息 -->
      <mobile-reward-msg v-else-if="chatMsg.msgSource === ChatMsgSource.Reward" />
      <!-- 表情消息 -->
      <mobile-emotion-msg v-else-if="chatMsg.msgSource === ChatMsgSource.Emotion" />
      <!-- 图片消息 -->
      <mobile-image-msg v-else-if="chatMsg.msgSource === ChatMsgSource.Image" />
      <!-- 课堂激励点赞消息 -->
      <mobile-motivation-like-msg v-else-if="chatMsg.msgSource === ChatMsgSource.MotivationLike" />
      <!-- 特效消息 -->
      <mobile-effect-msg v-else-if="chatMsg.msgSource === ChatMsgSource.Effect" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MobileSpeakMsg from './speak-msg/mobile-speak-msg.vue';
import MobileRedpaperMsg from './redpaper-msg/mobile-redpaper-msg.vue';
import MobileRedpaperReceiveMsg from './redpaper-receive-msg/mobile-redpaper-receive-msg.vue';
import MobileCustomerMsg from './customer-msg/mobile-customer-msg.vue';
import MobileCustomMsg from './custom-msg/mobile-custom-msg.vue';
import MobileFileMsg from './file-msg/mobile-file-msg.vue';
import MobileSystemMsg from './system-msg/mobile-system-msg.vue';
import MobileRewardMsg from './reward-msg/mobile-reward-msg.vue';
import MobileEmotionMsg from './emotion-msg/mobile-emotion-msg.vue';
import MobileImageMsg from './image-msg/mobile-image-msg.vue';
import MobileMotivationLikeMsg from './motivation-like-msg/mobile-motivation-like-msg.vue';
import MobileEffectMsg from './effect-msg/effect-msg.vue';
import { chatMsgItemProps, useChatMsgItem } from './use-chat-msg-item';
import { ChatMsgSource } from '@polyv/live-watch-sdk';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const props = defineProps(chatMsgItemProps());

const { showMsgTime, chatMsg, msgTimeText, msgVisible } = useChatMsgItem({
  props,
});

const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);
</script>

<style lang="scss">
.c-mobile-chat-msg-item__time {
  margin: 16px 0;
  font-size: 12px;
  text-align: center;
}
.c-mobile-chat-msg-item__content {
  margin: 16px 0;
}
</style>
