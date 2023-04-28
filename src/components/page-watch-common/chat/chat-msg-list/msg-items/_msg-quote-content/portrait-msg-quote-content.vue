<!-- @file 竖屏端消息引用内容 -->
<template>
  <div class="c-portrait-msg-quote-content g-singleline">
    <!-- 昵称 -->
    <span class="c-portrait-msg-quote-content__nick">{{ quoteNick }}：</span>
    <!-- 内容 -->
    <span class="c-portrait-msg-quote-content__main">
      <!-- 发言 -->
      <template v-if="msgQuote.msgSource === ChatMsgSource.Speak">
        <span v-html="parseQuoteSpeakContent(msgQuote.content)"></span>
      </template>

      <!-- 红包 -->
      <template v-if="msgQuote.msgSource === ChatMsgSource.Redpaper">
        <span>{{ msgQuote.content }}</span>
      </template>

      <!-- 图片 -->
      <template v-if="msgQuote.msgSource === ChatMsgSource.Image">
        <img
          class="c-portrait-msg-quote-content__main__img"
          :src="resetImageProtocol(msgQuote.imageUrl)"
          @click="clickImgToPreview"
        />
      </template>

      <!-- 自定义消息 -->
      <template v-if="msgQuote.msgSource === ChatMsgSource.CustomerMessage">
        <span>{{ msgQuote.content }}</span>
      </template>
    </span>
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
.c-portrait-msg-quote-content {
  padding-top: 8px;
  margin-top: 8px;
  font-size: 12px;
  line-height: 17px;
  color: rgba($--color-white, 0.8);
  border-top: 1px solid rgba(255, 254, 252, 0.3);
}

.c-portrait-msg-quote-content__main {
  .plv-emotion-img {
    width: 24px !important;
    height: 24px !important;
    margin-top: -2px;
  }
}

.c-portrait-msg-quote-content__main__img {
  max-width: 60px;
  max-height: 45px;
  vertical-align: text-top;
}
</style>
