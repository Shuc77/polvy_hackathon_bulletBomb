<!-- @file PC 端常规发言 -->
<template>
  <pc-msg-container
    class="c-pc-speak-msg"
    :class="{
      'c-pc-speak-msg--over-style': chatMsg.isOverLength,
    }"
    :render-other-content="!!translatedContent"
  >
    <!-- 消息引用 -->
    <pc-msg-quote-content
      v-if="msgQuote"
      :msg-quote="msgQuote"
    />

    <!-- 消息内容 -->
    <div
      class="c-pc-speak-msg__content"
      v-html="speakHtmlContent"
    ></div>

    <!-- 字数过长下底部按钮 -->
    <div
      v-if="chatMsg.isOverLength"
      class="c-pc-speak-msg__control pws-chat-speak-msg-control"
    >
      <!-- 复制 -->
      <span
        class="c-pc-speak-msg__control__item pws-chat-speak-msg-control-item"
        @click="copyMsg"
      >
        {{ $lang('base.copy') }}
      </span>
      <!-- 更多 -->
      <span
        class="c-pc-speak-msg__control__item pws-chat-speak-msg-control-item"
        @click="showCompleteMsg"
      >
        {{ $lang('base.more') }}
      </span>
    </div>

    <!-- 右侧按钮 -->
    <template #suffix>
      <!-- 引用回复 -->
      <div
        v-if="canQuoteReply"
        class="c-pc-msg-container__content__suffix c-pc-msg-container__content__suffix--reply pws-chat-msg-quote-button"
        @click="onClickQuote"
      >
        {{ $lang('chat.reply') }}
      </div>

      <!-- 翻译 -->
      <div
        v-if="canTranslate"
        class="c-pc-msg-container__content__suffix c-pc-msg-container__content__suffix--translate pws-chat-msg-translate-button"
        @click="translateCurrentMsg"
      >
        <pc-icon-translate class="c-pc-speak-msg__translate-icon" />
      </div>
    </template>

    <!-- 翻译后的内容 -->
    <template #other-content>
      <span
        class="c-pc-speak-msg__content"
        v-html="translatedContent"
      ></span>
      <div class="c-pc-speak-msg__translate-finish pws-chat-msg-translate-finish">
        <pc-icon-check-round-fill class="c-pc-speak-msg__translate-finish__icon" />
        <span>{{ $lang('base.translateFinish') }}</span>
      </div>
    </template>
  </pc-msg-container>
</template>

<script setup lang="ts">
import PcMsgQuoteContent from '../_msg-quote-content/pc-msg-quote-content.vue';
import { PcIconCheckRoundFill, PcIconTranslate } from '@/components/component-icons/pc/map';
import PcMsgContainer from '../_msg-container/pc-msg-container.vue';
import { useSpeakMsg, useSpeakMsgTranslate } from './use-speak-msg';
import { useChatMsgQuote } from '../_hooks/chat-msg-quote-hook';

const { speakHtmlContent, chatMsg, msgQuote, copyMsg, showCompleteMsg } = useSpeakMsg();

const { translatedContent, canTranslate, translateCurrentMsg } = useSpeakMsgTranslate(chatMsg);

const { canQuoteReply, onClickQuote } = useChatMsgQuote(chatMsg);
</script>

<style lang="scss">
.c-pc-speak-msg__content {
  white-space: pre-wrap;

  a {
    color: inherit;
  }

  .plv-emotion-img {
    width: 24px !important;
    height: 24px !important;
    margin-top: -1px;
  }
}

.c-pc-msg-container--special {
  .c-pc-speak-msg__content a {
    color: inherit;
  }
}

.c-pc-speak-msg--over-style {
  .c-pc-msg-container__content__bubble {
    padding-bottom: 0;
  }
  .c-pc-speak-msg__content {
    padding: 0 4px;
    @include multiline-text(12);
    -webkit-mask-image: -webkit-gradient(
      linear,
      center bottom,
      center top,
      color-stop(0, transparent),
      color-stop(0.1, #000)
    );
  }
}

.c-pc-speak-msg__control {
  display: flex;
}
.c-pc-speak-msg__control__item {
  position: relative;
  flex: 1;
  font-size: 14px;
  line-height: 32px;
  text-align: center;
  cursor: pointer;
  &::before {
    position: absolute;
    top: 9px;
    right: 0;
    width: 0;
    height: 15px;
    content: '';
    border-left-style: solid;
    border-left-width: 1px;
  }
}
.c-pc-speak-msg__control__item:last-child {
  &::before {
    display: none;
  }
}

.c-pc-speak-msg__translate-icon {
  display: flex;
  font-size: 20px !important;
  cursor: pointer;
}
.c-pc-speak-msg__translate-finish {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #adadc0;
  white-space: nowrap;
}
.c-pc-speak-msg__translate-finish__icon {
  display: inline-flex;
  margin-right: 4px;
  font-size: 12px !important;
}

.c-pc-msg-container__content__suffix--reply {
  margin-bottom: 11px;
  cursor: pointer;
}
.c-pc-msg-container__content__suffix--translate {
  margin-top: -4px;
}
</style>
