<!-- @file 移动端消息引用内容 -->
<template>
  <div class="c-mobile-msg-quote-content pws-chat-msg-quote-content">
    <!-- 昵称 -->
    <div class="c-mobile-msg-quote-content__nick g-singleline">{{ quoteNick }}：</div>
    <!-- 内容 -->
    <div class="c-mobile-msg-quote-content__main">
      <!-- 发言 -->
      <template v-if="msgQuote.msgSource === ChatMsgSource.Speak">
        <p
          class="g-multiline"
          v-html="parseQuoteSpeakContent(msgQuote.content)"
        ></p>
      </template>

      <!-- 红包 -->
      <template v-if="msgQuote.msgSource === ChatMsgSource.Redpaper">
        <p class="g-multiline">{{ msgQuote.content }}</p>
      </template>

      <!-- 图片 -->
      <template v-if="msgQuote.msgSource === ChatMsgSource.Image">
        <img
          class="c-mobile-msg-quote-content__main__img"
          :src="resetImageProtocol(msgQuote.imageUrl)"
          @click="clickImgToPreview"
        />
      </template>

      <!-- 自定义消息 -->
      <template v-if="msgQuote.msgSource === ChatMsgSource.CustomerMessage">
        <p class="g-multiline">{{ msgQuote.content }}</p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { resetImageProtocol } from '@/assets/utils/image';
import { clickImgToPreview } from '@/hooks/components/use-image-preview';
import { ChatMsgSource } from '@polyv/live-watch-sdk';
import { msgQuoteContentProps, useMsgQuoteContent } from './use-msg-quote-content';
import { parseQuoteSpeakContent } from '../speak-msg/use-speak-msg';

const props = defineProps(msgQuoteContentProps());

const { quoteNick } = useMsgQuoteContent({ props });
</script>

<style lang="scss">
.c-mobile-msg-quote-content {
  padding-bottom: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  line-height: 17px;
  color: rgba($--color-white, 0.8);
  border-bottom: 1px solid rgba($--color-white, 0.1);
}

.c-mobile-msg-quote-content__nick {
  margin-bottom: 2px;
}

.c-mobile-msg-quote-content__main {
  .plv-emotion-img {
    width: 24px !important;
    height: 24px !important;
    margin-top: -2px;
  }
}

.c-mobile-msg-quote-content__main__img {
  max-width: 60px;
  max-height: 45px;
  margin-top: 4px;
}
</style>
