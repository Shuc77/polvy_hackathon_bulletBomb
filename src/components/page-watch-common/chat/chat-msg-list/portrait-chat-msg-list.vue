<!-- @file 竖屏端聊天消息列表 -->
<template>
  <div class="c-portrait-chat-msg-list">
    <plv-carousel
      ref="carouselRef"
      class="c-portrait-chat-msg-list__carousel"
      :slide-index.sync="carouseActiveIndex"
    >
      <!-- 聊天区 -->
      <plv-carousel-item class="c-portrait-chat-msg-list__carousel__chat">
        <div
          ref="containerRef"
          class="c-portrait-chat-msg-list__container"
        ></div>

        <div
          v-if="moreMsgVisible"
          class="c-portrait-chat-msg-list__more-msg"
          @click="scrollToNew"
        >
          {{ $lang('chat.moreMsg2') }}
        </div>
      </plv-carousel-item>
      <!-- 提问区 -->
      <plv-carousel-item v-if="askMenuData.visible && askSdk">
        <ask-comp-portrait
          :slogan="quizWelcomeText"
          :ask-sdk="askSdk"
        />
      </plv-carousel-item>
    </plv-carousel>
    <!-- 分页符 -->
    <div
      class="c-portrait-chat-msg-list-content"
      v-if="askMenuData.visible && askSdk"
    >
      <div class="c-portrait-chat-msg-list__line c-portrait-chat-msg-list__line--left">
        <div
          class="c-portrait-chat-msg-list__line__process"
          :class="{ 'c-portrait-chat-msg-list__line__process--transition': isShowTransition }"
          :style="{ width: `${leftPageWidth}px` }"
        ></div>
      </div>
      <div class="c-portrait-chat-msg-list__line">
        <div
          class="c-portrait-chat-msg-list__line__process"
          :class="{ 'c-portrait-chat-msg-list__line__process--transition': isShowTransition }"
          :style="{ width: `${rightPageWidth}px` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import AskCompPortrait from '@polyv/chat-sdk-ui-ask-question/lib/MobileAskPortrait';
import { PlvCarousel, PlvCarouselItem } from '@/plugins/polyv-ui/mobile-import';
import { ChatMsgItemComponentOptions } from './hooks/msg-render-hook';
import PortraitChatMsgItem from './msg-items/portrait-chat-msg-item.vue';
import { useChatMsgList } from './use-chat-msg-list';
import './styles/index.scss';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { useChatMsgReplayTips } from '@/components/page-watch-common/chat/chat-msg-replay-tips/use-chat-msg-replay-tips';
import { toast } from '@/hooks/components/use-toast';
import { usePlaybackStore } from '@/store/use-playback-store';
import { usePortraitChatTab } from './hooks/portrait-chat-tab';
import { usePortraitLayoutStore, PortraitChatTabType } from '@/store/use-portrait-layout-store';

const { moreMsgVisible } = storeDefinitionToRefs(useChatMsgStore);
const portraitLayoutStore = usePortraitLayoutStore();
const { portraitChatTab } = storeDefinitionToRefs(usePortraitLayoutStore);

const { containerRef, scrollToNew } = useChatMsgList({
  ChatMsgItemComponent: PortraitChatMsgItem as ChatMsgItemComponentOptions,
});

const {
  askSdk,
  askMenuData,
  leftPageWidth,
  rightPageWidth,
  carouselRef,
  isShowTransition,
  carouseActiveIndex,
  quizWelcomeText,
} = usePortraitChatTab({
  onAskMsg: () => {
    portraitLayoutStore.updatePortraitHasAskNews(true);
  },
});

watch(
  () => portraitChatTab.value,
  chatType => {
    carouseActiveIndex.value = chatType === PortraitChatTabType.Chat ? 0 : 1;
    if (chatType === PortraitChatTabType.Ask) {
      portraitLayoutStore.updatePortraitHasAskNews(false);
    }
  },
);

watch(
  () => carouseActiveIndex.value,
  activeIndex => {
    portraitLayoutStore.updatePortraitChatTabType(
      activeIndex ? PortraitChatTabType.Ask : PortraitChatTabType.Chat,
    );
  },
);

const playbackStore = usePlaybackStore();

if (playbackStore.chatReplayEnabled) {
  const { content: chatMsgReplayTips } = useChatMsgReplayTips();
  watch(
    () => chatMsgReplayTips.value,
    value => {
      setTimeout(() => {
        toast.info(value);
      }, 1000);
    },
    {
      immediate: true,
    },
  );
}
</script>

<style lang="scss">
.c-portrait-chat-msg-list {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 248px;
  height: 208px;
  pointer-events: initial;
  -webkit-mask-image: -webkit-gradient(
    linear,
    center top,
    center bottom,
    color-stop(0, transparent),
    color-stop(0.2, #000)
  );
  mask-image: none;
}

.c-portrait-chat-msg-list__container {
  width: 100%;
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain; // 阻止滚动传播
  @include hidden-scrollbar;
}

.c-portrait-chat-msg-list__more-msg {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 24px;
  padding: 0 8px;
  font-size: 14px;
  line-height: 24px;
  color: #ffa611;
  background-color: #ffffff;
  border-radius: 12px;
}

.c-portrait-chat-msg-list-content {
  bottom: -8px;
  left: 0;
  display: flex;
  margin-top: 7px;
}
.c-portrait-chat-msg-list__line {
  width: 38px;
  height: 3px;
  overflow: hidden;
  background-color: rgba(#ffffff, 0.5);
  border-radius: 10px;
  &:last-child {
    margin-left: 4px;
  }
}
.c-portrait-chat-msg-list__line--left {
  transform: rotate(180deg);
  transform-origin: center center;
}
.c-portrait-chat-msg-list__line__process {
  width: 0;
  height: inherit;
  background-color: #ffffff;
  border-radius: 10px;
}
.c-portrait-chat-msg-list__line__process--transition {
  transition: all 0.2s;
}
/** 提问UI样式 */
.c-portrait-chat-msg-list__carousel {
  .plv-chatroom-aq {
    background-color: transparent;
  }
  .plv-chatroom-aq__bottom {
    display: none;
  }
  .plv-chatroom-aq__new-message {
    left: 0;
  }
  .plv-chatroom-aq__list__main {
    padding: 0;
  }
}
.c-portrait-chat-msg-list__carousel__chat {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
</style>
