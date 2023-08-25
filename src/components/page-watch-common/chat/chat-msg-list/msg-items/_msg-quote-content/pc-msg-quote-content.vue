<!-- @file PC 端消息引用内容 -->
<template>
  <div class="c-pc-msg-quote-content pws-chat-msg-quote-content">
    <!-- 昵称 -->
    <div class="c-pc-msg-quote-content__nick g-singleline">{{ quoteNick }}：</div>
    <!-- 内容 -->
    <div class="c-pc-msg-quote-content__main">
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
          class="c-pc-msg-quote-content__main__img"
          :src="fitProtocol(msgQuote.imageUrl)"
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
import { fitProtocol } from '@/assets/utils/url';
import { clickImgToPreview } from '@/hooks/components/use-image-preview';
import { ChatMsgSource } from '@polyv/live-watch-sdk';
import { msgQuoteContentProps, useMsgQuoteContent } from './use-msg-quote-content';
import { parseQuoteSpeakContent } from '../speak-msg/use-speak-msg';

const props = defineProps(msgQuoteContentProps());

const { quoteNick } = useMsgQuoteContent({ props });
</script>

<style lang="scss">
.c-pc-msg-quote-content {
  padding-bottom: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  line-height: 17px;
  border-bottom-style: solid;
  border-bottom-width: 1px;
}

.c-pc-msg-quote-content__nick {
  margin-bottom: 2px;
}

.c-pc-msg-quote-content__main {
  .plv-emotion-img {
    width: 24px !important;
    height: 24px !important;
    margin-top: -4px;
  }
}

.c-pc-msg-quote-content__main__img {
  max-width: 60px;
  max-height: 45px;
  margin-top: 4px;
  cursor: zoom-in;
}
</style>
