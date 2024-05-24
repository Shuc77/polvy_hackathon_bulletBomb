<!-- @file 移动端常规发言 -->
<template>
  <mobile-msg-container
    class="c-mobile-speak-msg"
    :class="{
      'c-mobile-speak-msg--over-style': chatMsg.isOverLength,
    }"
    :render-other-content="!!translatedContent"
    :suffix-mode="'align-center'"
    @click-msg-to-tips="onBubbleChatMsgTips"
  >
    <!-- 消息引用 -->
    <mobile-msg-quote-content
      v-if="msgQuote"
      :msg-quote="msgQuote"
    />

    <!-- 消息内容 -->
    <div
      class="c-mobile-speak-msg__content"
      v-html="speakHtmlContent"
    ></div>

    <!-- 字数过长下底部按钮 -->
    <div
      v-if="chatMsg.isOverLength"
      class="c-mobile-speak-msg__control pws-chat-speak-msg-control"
    >
      <span
        class="c-mobile-speak-msg__control__item pws-chat-speak-msg-control-item"
        @click="copyMsg"
      >
        {{ $lang('base.copy') }}
      </span>
      <span
        class="c-mobile-speak-msg__control__item pws-chat-speak-msg-control-item"
        @click="showCompleteMsg"
      >
        {{ $lang('base.more') }}
      </span>
    </div>

    <!-- 翻译后的内容 -->
    <template #other-content>
      <span
        class="c-mobile-speak-msg__content"
        v-html="translatedContent"
      ></span>
      <div class="c-mobile-speak-msg__translate-finish pws-chat-msg-translate-finish">
        <mobile-icon-check-round-fill class="c-mobile-speak-msg__translate-finish__icon" />
        <span>{{ $lang('base.translateFinish') }}</span>
      </div>
    </template>

    <template #suffix>
      <msg-status-suffix></msg-status-suffix>
    </template>
  </mobile-msg-container>
</template>

<script setup lang="ts">
import MobileMsgQuoteContent from '../_msg-quote-content/mobile-msg-quote-content.vue';
import { MobileIconCheckRoundFill } from '@/components/component-icons/mobile/map';
import MobileMsgContainer from '../_msg-container/mobile-msg-container.vue';
import { useSpeakMsg, useSpeakMsgTranslate } from './use-speak-msg';
import { useChatMsgQuote } from '../_hooks/chat-msg-quote-hook';
import MsgStatusSuffix from '../msg-status-suffix/msg-status-suffix.vue';
import { translate } from '@/assets/lang';
import { useSingleChatMsgTips } from '@/hooks/components/use-single-chat-msg-tips/_hooks/use-single-chat-msg-tips';
import { SingleChatMsgTipsOriginOptions } from '@/hooks/components/use-single-chat-msg-tips/_types';

const { speakHtmlContent, chatMsg, msgQuote, copyMsg, showCompleteMsg } = useSpeakMsg();

const { translatedContent, canTranslate, translateCurrentMsg } = useSpeakMsgTranslate(chatMsg);

const { canQuoteReply, onClickQuote } = useChatMsgQuote(chatMsg);

const { createChatMsgTips } = useSingleChatMsgTips();

function onBubbleChatMsgTips(options: SingleChatMsgTipsOriginOptions) {
  if (!canQuoteReply.value && !canTranslate.value) {
    return;
  }

  const { target, mountEl } = options;
  if (!target || !mountEl) return;

  createChatMsgTips({
    target,
    mountEl,
    itemData: [
      {
        hidden: !canQuoteReply.value,
        content: translate('chat.reply'),
        onClick: onClickQuote,
      },
      {
        content: translate('base.copy'),
        onClick: copyMsg,
      },
      {
        hidden: !canTranslate.value,
        content: translate('base.translate'),
        onClick: translateCurrentMsg,
      },
    ],
  });
}
</script>

<style lang="scss">
.c-mobile-speak-msg__content {
  white-space: pre-wrap;

  a {
    color: inherit;
  }
}

.c-mobile-msg-container--special {
  .c-mobile-speak-msg__content a {
    color: inherit;
  }
}

.c-mobile-speak-msg--over-style {
  .c-mobile-msg-container__content__bubble {
    padding-bottom: 0;
  }
  .c-mobile-speak-msg__content {
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

.c-mobile-speak-msg__tips {
  display: flex;
  align-items: center;
}
.c-mobile-speak-msg__tips-btn + .c-mobile-speak-msg__tips-btn {
  padding-left: 10px;
  margin-left: 10px;
  line-height: 17px;
  border-left: 1px solid rgba($--color-white, 0.3);
}

.c-mobile-speak-msg__control {
  display: flex;
  color: rgba($--color-white, 0.8);
}
.c-mobile-speak-msg__control__item {
  position: relative;
  flex: 1;
  font-size: 14px;
  line-height: 40px;
  text-align: center;
  &::before {
    position: absolute;
    top: 14px;
    right: 0;
    width: 0;
    height: 15px;
    content: '';
    border-left: 1px solid rgba(#ffffff, 0.3);
  }
}
.c-mobile-speak-msg__control__item:last-child {
  &::before {
    display: none;
  }
}

.c-mobile-speak-msg__translate-icon {
  display: flex;
  font-size: 24px !important;
  transform: translateY(-4px);
}
.c-mobile-speak-msg__translate-finish {
  display: flex;
  align-items: center;
  font-size: 12px;
  white-space: nowrap;
}
.c-mobile-speak-msg__translate-finish__icon {
  display: inline-flex;
  margin-right: 4px;
  font-size: 12px !important;
  color: #62c352;
}
.c-mobile-msg-container--special {
  .c-mobile-speak-msg__translate-finish {
    color: $--color-white;
    opacity: 0.6;
  }
}
</style>
