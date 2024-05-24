<!-- @file PC 端观看页侧边菜单栏 -->
<template>
  <div class="c-pc-watch-aside-menu">
    <pc-aside-tabs
      v-model="pcAsideTabCurrentName"
      @input="trackWatchTabChange"
      @is-empty-callback="onIsEmptyCallback"
    >
      <!-- ========= 弹层类型组件 Start ========= -->

      <!-- 商品库推送气泡 -->
      <pc-product-bubble v-if="iarSdkLoaded" />

      <!-- 课堂激励特效，跟随"屏蔽特效"开关 -->
      <motivation-like-animation
        v-if="donateAnimationVisible"
        v-show="pcAsideTabCurrentName !== TAB_NAME_MICRO_ACTIVITY"
        class="c-pc-watch-aside-menu__motivation-like-animation"
        :enable-types="[MotivationLikeType.Speak]"
      />

      <!-- ========= 弹层类型组件 End ========= -->

      <!-- PC 端观看页侧边菜单栏顶部固定区域 -->
      <div class="c-pc-watch-aside-menu__topic">
        <!-- 聊天室连接异常提示 -->
        <pc-chat-connect-error-tips class="c-pc-watch-aside-menu__topic-item" />
      </div>

      <!-- 连麦 tab -->
      <pc-aside-tab-pane
        v-if="connectMicPendantRenderEnabled"
        :label="$lang('call.connect')"
        :name="TAB_NAME_CONNECT_MIC"
      >
        <pc-connect-mic />
      </pc-aside-tab-pane>

      <template v-for="(menu, index) in channelMenus">
        <!-- 微活动 tab -->
        <pc-aside-tab-pane
          v-if="menu.menuType === ChannelMenuType.MicroActivity"
          :key="`micro-activity-${index}`"
          :label="menu.name"
          :name="TAB_NAME_MICRO_ACTIVITY"
        >
          <pc-micro-activity :is-active="pcAsideTabCurrentName === TAB_NAME_MICRO_ACTIVITY" />
        </pc-aside-tab-pane>

        <!-- 聊天室 tab -->
        <pc-aside-tab-pane
          v-if="menu.menuType === ChannelMenuType.Chat"
          :key="`chat-${index}`"
          :label="menu.name"
          :sub-label="chatSubLabel"
          :show-reminder="chatReminderVisible"
          :name="TAB_NAME_CHAT"
        >
          <template v-if="chatRoomVisible">
            <pc-chat-room />
          </template>
          <template v-else>
            <pc-chat-close-tips />
          </template>
        </pc-aside-tab-pane>

        <!-- 投票活动 tab -->
        <pc-aside-tab-pane
          v-if="menu.menuType === ChannelMenuType.Vote"
          :key="`vote-${index}`"
          :label="menu.name"
          :name="TAB_NAME_VOTE"
        >
          <pc-vote-panel v-if="iarSdkLoaded" />
        </pc-aside-tab-pane>

        <!-- 成员列表 tab -->
        <pc-aside-tab-pane
          v-if="menu.menuType === ChannelMenuType.Members"
          :key="`member-${index}`"
          :label="menu.name"
          :name="TAB_NAME_MEMBERS"
          lazy-load
        >
          <pc-member-list />
        </pc-aside-tab-pane>

        <!-- 提问 tab -->
        <pc-aside-tab-pane
          v-if="menu.menuType === ChannelMenuType.Quiz"
          :key="`quiz-${index}`"
          :label="menu.name"
          :name="TAB_NAME_ASK"
          :show-reminder="askReminderVisible"
          lazy-load
        >
          <pc-ask />
        </pc-aside-tab-pane>

        <!-- 问答 tab -->
        <pc-aside-tab-pane
          v-if="menu.menuType === ChannelMenuType.QA"
          :key="`qa-${index}`"
          :label="menu.name"
          :name="TAB_NAME_QA"
          :show-reminder="qaReminderVisible"
        >
          <pc-question-answer v-if="iarSdkLoaded" />
        </pc-aside-tab-pane>

        <!-- 商品库 tab -->
        <pc-aside-tab-pane
          v-if="menu.menuType === ChannelMenuType.Buy"
          :key="`buy-${index}`"
          :label="menu.name"
          :name="TAB_NAME_PRODUCT"
          switch-to-refresh
        >
          <pc-product-list v-if="iarSdkLoaded" />
        </pc-aside-tab-pane>

        <!-- 实时字幕 tab -->
        <pc-aside-tab-pane
          v-if="menu.menuType === ChannelMenuType.Subtitle"
          :key="`subtitle-${index}`"
          :label="menu.name"
          :name="TAB_NAME_SUBTITLE"
        >
          <pc-subtitle v-if="subtitleModuleSetuped" />
        </pc-aside-tab-pane>

        <!-- AI助手答疑 -->
        <pc-aside-tab-pane
          v-if="menu.menuType === ChannelMenuType.AIAssistant"
          :key="`AIAssistant-${index}`"
          :label="menu.name"
          :name="TAB_NAME_AI_ASSISTANT"
          lazy-load
        >
          <pc-ai-assistant-chat />
        </pc-aside-tab-pane>
      </template>

      <!-- 章节 tab -->
      <pc-aside-tab-pane
        v-if="chapterVisible"
        :label="$lang('menu.tabName.chapter')"
        :name="TAB_NAME_CHAPTER"
      >
        <pc-chapter />
      </pc-aside-tab-pane>
    </pc-aside-tabs>
  </div>
</template>

<script setup lang="ts">
import PcAsideTabPane from '@/components/common-base/tabs/pc-aside-tabs/pc-aside-tab-pane.vue';
import PcAsideTabs from '@/components/common-base/tabs/pc-aside-tabs/pc-aside-tabs.vue';
import PcChatConnectErrorTips from '@/components/page-watch-common/chat/chat-connect-error/chat-connect-error-tips/pc-chat-connect-error-tips.vue';
import PcChatCloseTips from '@/components/page-watch-common/chat/chat-close-tips/chat-close-tips.vue';
import PcChatRoom from '@/components/page-watch-common/chat/chat-room/pc-chat-room.vue';
import PcMicroActivity from '@/components/page-watch-common/micro-activity/pc-micro-activity/pc-micro-activity.vue';
import PcConnectMic from '@/components/page-watch-common/connect-mic/pc-connect-mic/pc-connect-mic.vue';
import PcProductList from '@/components/page-watch-common/interactive-receive/product/pc-product-list.vue';
import PcVotePanel from '@/components/page-watch-common/interactive-receive/vote/pc-vote-panel.vue';
import PcMemberList from '@/components/page-watch-common/member-list/member-list.vue';
import PcQuestionAnswer from '@/components/page-watch-common/interactive-receive/question-answer/pc-question-answer.vue';
import PcProductBubble from '@/components/page-watch-common/interactive-receive/product/pc-product-bubble.vue';
import PcAsk from '@/components/page-watch-common/ask/pc-ask/pc-ask.vue';
import PcChapter from '@/components/page-watch-common/chapter/pc-chapter.vue';
import PcSubtitle from '@/components/page-watch-common/subtitle/pc-subtitle.vue';
import PcAiAssistantChat from '@/components/page-watch-common/polyv-ai/ai-assistant-chat/pc-ai-assistant-chat.vue';
import MotivationLikeAnimation from '@/components/page-watch-common/motivation/motivation-like-animation/motivation-like-animation.vue';

import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import {
  TAB_NAME_CHAT,
  TAB_NAME_QA,
  TAB_NAME_ASK,
  TAB_NAME_CONNECT_MIC,
  TAB_NAME_VOTE,
  TAB_NAME_MEMBERS,
  TAB_NAME_PRODUCT,
  TAB_NAME_CHAPTER,
  TAB_NAME_MICRO_ACTIVITY,
  TAB_NAME_SUBTITLE,
  TAB_NAME_AI_ASSISTANT,
} from '@/assets/constants/tab-name';
import { useLayoutStore } from '@/store/use-layout-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useDonateStore } from '@/store/use-donate-store';

import { ChannelMenuType, MotivationLikeType } from '@polyv/live-watch-sdk';

import { useWatchTabHook } from '@/pages/watch/_hooks/use-watch-tab';
import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';
import { useSubtitleStore } from '@/store/use-subtitle-store';

const { pcAsideTabCurrentName } = storeDefinitionToRefs(useLayoutStore);

const { connectMicPendantRenderEnabled } = storeDefinitionToRefs(useConnectMicStore);

const { chatRoomVisible } = storeDefinitionToRefs(useChatStore);

const { channelMenus } = storeDefinitionToRefs(useChannelMenuStore);

const { qaReminderVisible } = storeDefinitionToRefs(useInteractReceiveStore);

const { chapterVisible } = storeDefinitionToRefs(usePlaybackStore);

const { donateAnimationVisible } = storeDefinitionToRefs(useDonateStore);

const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);

const { subtitleModuleSetuped } = storeDefinitionToRefs(useSubtitleStore);

const { chatSubLabel, chatReminderVisible, askReminderVisible } = useWatchTabHook({
  curActiveTabName: pcAsideTabCurrentName,
});

const { trackWatchTabChange } = useWatchEventTrack();

function onIsEmptyCallback(isEmpty: boolean) {
  const layoutStore = useLayoutStore();
  layoutStore.$patch({
    pcAsideTabIsEmpty: isEmpty,
  });
}
</script>

<style lang="scss">
.c-pc-watch-aside-menu {
  height: 100%;
}

.c-pc-watch-aside-menu__topic {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 50;
  width: 100%;
}
.c-pc-watch-aside-menu__topic-item {
  margin: 8px 8px 0;
}

.c-pc-watch-aside-menu__motivation-like-animation {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 50;
  width: 100%;
  height: 100%;
  padding-bottom: 20%;
}
</style>
