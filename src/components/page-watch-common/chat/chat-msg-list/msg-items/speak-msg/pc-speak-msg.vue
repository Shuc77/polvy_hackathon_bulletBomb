<!-- @file PC 端常规发言 -->
<template>
  <pc-msg-container
    class="c-pc-speak-msg"
    :class="{
      'c-pc-speak-msg--over-style': chatMsg.isOverLength,
    }"
    :render-other-content="!!translatedContent"
    @bubble-contextmenu="onBubbleContextmenu"
    :suffix-mode="'align-center'"
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

    <template #suffix>
      <msg-status-suffix></msg-status-suffix>
    </template>
  </pc-msg-container>
</template>

<script setup lang="ts">
import PcMsgQuoteContent from '../_msg-quote-content/pc-msg-quote-content.vue';
import {
  PcIconCheckRoundFill,
  PcIconCopy,
  PcIconReply,
  PcIconTranslate,
} from '@/components/component-icons/pc/map';
import PcMsgContainer from '../_msg-container/pc-msg-container.vue';
import { useSpeakMsg, useSpeakMsgTranslate } from './use-speak-msg';
import { useChatMsgQuote } from '../_hooks/chat-msg-quote-hook';
import { useContextMenu } from '@/hooks/components/use-context-menu';
import { translate } from '@/assets/lang';
import MsgStatusSuffix from '../msg-status-suffix/msg-status-suffix.vue';

const { speakHtmlContent, chatMsg, msgQuote, copyMsg, showCompleteMsg } = useSpeakMsg();

const { translatedContent, canTranslate, translateCurrentMsg } = useSpeakMsgTranslate(chatMsg);

const { canQuoteReply, onClickQuote } = useChatMsgQuote(chatMsg);

const { createContextMenu } = useContextMenu();

function onBubbleContextmenu(evt: MouseEvent) {
  evt.preventDefault();
  createContextMenu(
    {
      x: evt.pageX,
      y: evt.pageY,
      offsetX: 10,
      offsetY: -10,
    },
    [
      {
        hidden: !canQuoteReply.value,
        getIcon: () => PcIconReply,
        content: translate('chat.reply'),
        onClick: onClickQuote,
      },
      {
        getIcon: () => PcIconCopy,
        content: translate('base.copy'),
        onClick: copyMsg,
      },
      {
        hidden: !canTranslate.value,
        getIcon: () => PcIconTranslate,
        content: translate('base.translate'),
        onClick: translateCurrentMsg,
      },
    ],
  );
}
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
</style>
