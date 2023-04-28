<!-- @file 竖屏端常规发言 -->
<template>
  <portrait-msg-container
    class="c-portrait-speak-msg"
    :class="{
      'c-portrait-speak-msg--over-style': chatMsg.isOverLength,
    }"
    :disabled-tips="!canQuoteReply"
  >
    <!-- 消息内容 -->
    <span
      class="c-portrait-speak-msg__content"
      v-html="speakHtmlContent"
    ></span>

    <!-- tips 中的按钮 -->
    <template #tips-content>
      <div class="c-portrait-speak-msg__tips">
        <!-- 回复 -->
        <div
          class="c-portrait-speak-msg__tips-btn"
          @click="onClickQuote"
        >
          {{ $lang('chat.reply') }}
        </div>
        <!-- 复制 -->
        <div
          class="c-portrait-speak-msg__tips-btn"
          @click="copyMsg"
        >
          {{ $lang('base.copy') }}
        </div>
      </div>
    </template>

    <template #msg-footer>
      <!-- 字数过长下底部按钮 -->
      <div
        v-if="chatMsg.isOverLength"
        class="c-portrait-speak-msg__control"
      >
        <span
          class="c-portrait-speak-msg__control__item"
          @click="copyMsg"
        >
          {{ $lang('base.copy') }}
        </span>
        <span
          class="c-portrait-speak-msg__control__item"
          @click="showCompleteMsg"
        >
          {{ $lang('base.more') }}
        </span>
      </div>

      <!-- 消息引用 -->
      <portrait-msg-quote-content
        v-if="msgQuote"
        :msg-quote="msgQuote"
      />
    </template>
  </portrait-msg-container>
</template>

<script setup lang="ts">
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';
import PortraitMsgQuoteContent from '../_msg-quote-content/portrait-msg-quote-content.vue';
import { useSpeakMsg } from './use-speak-msg';
import { useChatMsgQuote } from '../_hooks/chat-msg-quote-hook';

const { speakHtmlContent, chatMsg, msgQuote, copyMsg, showCompleteMsg } = useSpeakMsg();

const { canQuoteReply, onClickQuote } = useChatMsgQuote(chatMsg);
</script>

<style lang="scss">
.c-portrait-speak-msg--over-style {
  .c-portrait-msg-container__content__inner {
    @include multiline-text(4);
  }
}
.c-portrait-speak-msg__content {
  white-space: pre-wrap;

  a {
    color: #78a7ed;
  }

  .plv-emotion-img {
    width: 22px !important;
    height: 22px !important;
    margin-top: -1px;
  }
}

.c-portrait-speak-msg__tips {
  display: flex;
  align-items: center;
}
.c-portrait-speak-msg__tips-btn + .c-portrait-speak-msg__tips-btn {
  padding-left: 10px;
  margin-left: 10px;
  line-height: 17px;
  border-left: 1px solid rgba($--color-white, 0.3);
}

.c-portrait-speak-msg__control {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 8px;
  border-top: 1px solid rgba(#fffefc, 0.3);
}
.c-portrait-speak-msg__control__item {
  position: relative;
  flex: 1;
  padding-top: 5px;
  color: rgba($--color-white, 0.8);
  text-align: center;
}
.c-portrait-speak-msg__control__item + .c-portrait-speak-msg__control__item {
  &::before {
    position: absolute;
    top: 9px;
    left: 0;
    width: 0;
    height: 15px;
    content: '';
    border-left: 1px solid rgba(#fffefc, 0.3);
  }
}
</style>
