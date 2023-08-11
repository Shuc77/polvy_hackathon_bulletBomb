<!-- @file 移动端底部菜单栏 -->
<template>
  <div class="c-mobile-watch-mobile-menu">
    <mobile-menu-tabs
      v-model="mobileMenuCurrentName"
      @input="trackWatchTabChange"
    >
      <template #header-suffix>
        <mobile-follow-btn v-if="followEnabled" />
      </template>

      <!-- 关注弹层 -->
      <mobile-follow-layer v-if="followEnabled" />

      <!-- 商品库推送气泡 -->
      <mobile-product-bubble />

      <!-- 移动端底部菜单栏顶部固定区域 -->
      <div class="c-mobile-watch-mobile-menu__topic">
        <!-- 聊天室连接异常提示 -->
        <mobile-chat-connect-error-tips class="c-mobile-watch-mobile-menu__topic-item" />
      </div>

      <!-- 文档位置切换按钮 -->
      <mobile-doc-side-switch />

      <!-- 文档 -->
      <template v-if="canRenderDoc">
        <mobile-menu-tab-pane
          :label="docOrCameraMenuName"
          :name="TAB_NAME_DOC_OR_VIDEO"
          lazy-load
        />
      </template>

      <!-- 根据后台配置渲染菜单 -->
      <template v-for="(menu, index) in channelMenus">
        <!-- 直播介绍 -->
        <mobile-menu-tab-pane
          v-if="menu.menuType === ChannelMenuType.Desc"
          :key="`desc-${index}`"
          :label="menu.name"
          :name="ChannelMenuType.Desc"
          lazy-load
        >
          <mobile-basic-info :show-like-count="false" />
        </mobile-menu-tab-pane>

        <!-- 聊天室 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Chat"
          :key="`chat-${index}`"
          :label="menu.name"
          :name="TAB_NAME_CHAT"
          :sub-label="chatMenuAdditionData.subLabel"
          :show-reminder="chatMenuAdditionData.showReminder"
        >
          <template v-if="chatSetting.watchChatEnabled">
            <mobile-chat-room />
          </template>
          <template v-else>
            <mobile-chat-close-tips />
          </template>
        </mobile-menu-tab-pane>

        <!-- 提问 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Quiz"
          :key="`quiz-${index}`"
          :label="menu.name"
          :name="TAB_NAME_ASK"
          :show-reminder="askMenuAdditionData.showReminder"
          lazy-load
        >
          <mobile-ask />
        </mobile-menu-tab-pane>

        <!-- 问答 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.QA"
          :key="`qa-${index}`"
          :label="menu.name"
          :name="TAB_NAME_QA"
          lazy-load
        >
          <mobile-question-answer />
        </mobile-menu-tab-pane>

        <!-- 回放 -->
        <mobile-menu-tab-pane
          v-else-if="
            menu.menuType === ChannelMenuType.Previous &&
            ![LiveStatus.Live, LiveStatus.Stop].includes(liveStatus)
          "
          :key="`playback-${index}`"
          :label="menu.name"
          :name="TAB_NAME_PLAYBACK"
          lazy-load
        >
          <mobile-playback-list />
        </mobile-menu-tab-pane>

        <!-- 商品库 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Buy"
          :key="`buy-${index}`"
          :label="menu.name"
          :name="TAB_NAME_PRODUCT"
          switch-to-refresh
        >
          <mobile-product-list />
        </mobile-menu-tab-pane>

        <!-- 图文直播 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Tuwen"
          :key="`tuwen-${index}`"
          :label="menu.name"
          :name="TAB_NAME_TUWEN_LIVE"
          lazy-load
        >
          <mobile-tuwen-live />
        </mobile-menu-tab-pane>

        <!-- 图文菜单 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Text"
          :key="`text-${index}`"
          :label="menu.name"
          :name="menu.menuId"
          lazy-load
        >
          <mobile-custom-tuwen-text-menu :html-content="menu.content" />
        </mobile-menu-tab-pane>

        <!-- 推广链接 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Iframe"
          :key="`iframe-${index}`"
          :label="menu.name"
          :name="menu.menuId"
          lazy-load
        >
          <mobile-promote-external-link
            :src="menu.content"
            :open-type="menu.iframeOpenType"
            :is-active="mobileMenuCurrentName === menu.menuId"
          />
        </mobile-menu-tab-pane>

        <!-- 投票 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Vote"
          :key="`vote-${index}`"
          :label="menu.name"
          :name="TAB_NAME_VOTE"
          lazy-load
        >
          <mobile-vote-panel />
        </mobile-menu-tab-pane>

        <!-- 云席 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Seat"
          :key="`seat-${index}`"
          :label="menu.name"
          :name="TAB_NAME_SEAT"
          lazy-load
        >
          云席
        </mobile-menu-tab-pane>

        <!-- 邀请榜 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Invite"
          :key="`invite-${index}`"
          :label="menu.name"
          :name="TAB_NAME_INVITE_RANK"
          lazy-load
        >
          <mobile-invite-rank />
        </mobile-menu-tab-pane>

        <!-- 成员列表 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Members"
          :key="`member-${index}`"
          :label="menu.name"
          :name="TAB_NAME_MEMBERS"
          lazy-load
        >
          <mobile-member-list />
        </mobile-menu-tab-pane>

        <!-- 微活动 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.MicroActivity"
          :key="`microActivity-${index}`"
          :label="menu.name"
          :name="TAB_NAME_MICRO_ACTIVITY"
        >
          <mobile-micro-activity :is-active="mobileMenuCurrentName === TAB_NAME_MICRO_ACTIVITY" />
        </mobile-menu-tab-pane>
      </template>

      <!-- 回放章节 -->
      <template v-if="chapterVisible">
        <mobile-menu-tab-pane
          :label="$lang('menu.tabName.chapter')"
          :name="TAB_NAME_CHAPTER"
          lazy-load
        >
          <mobile-chapter />
        </mobile-menu-tab-pane>
      </template>

      <!-- 分会场（竖向） -->
      <template v-if="multiMeetingMenuData.visible">
        <mobile-menu-tab-pane
          :label="multiMeetingMenuData.label"
          :name="TAB_NAME_MULTI_MEETING"
          lazy-load
        >
          <mobile-multi-meeting-portrait />
        </mobile-menu-tab-pane>
      </template>
    </mobile-menu-tabs>
  </div>
</template>

<script setup lang="ts">
import MobileMenuTabPane from '@/components/common-base/tabs/mobile-menu-tabs/mobile-menu-tab-pane.vue';
import MobileMenuTabs from '@/components/common-base/tabs/mobile-menu-tabs/mobile-menu-tabs.vue';
import MobileBasicInfo from '@/components/common-business/basic-info/mobile-basic-info.vue';
import MobileAsk from '@/components/page-watch-common/ask/mobile-ask/mobile-ask.vue';
import MobileChapter from '@/components/page-watch-common/chapter/mobile-chapter.vue';
import MobileChatConnectErrorTips from '@/components/page-watch-common/chat/chat-connect-error/chat-connect-error-tips/mobile-chat-connect-error-tips.vue';
import MobileChatRoom from '@/components/page-watch-common/chat/chat-room/mobile-chat-room.vue';
import MobileChatCloseTips from '@/components/page-watch-common/chat/chat-close-tips/chat-close-tips.vue';
import MobileCustomTuwenTextMenu from '@/components/page-watch-common/custom-tuwen-text-menu/mobile-custom-tuwen-text-menu.vue';
import MobileDocSideSwitch from '@/components/page-watch-common/doc/doc-side-switch/mobile-doc-side-switch.vue';
import MobileFollowBtn from '@/components/page-watch-common/follow/follow-btn/mobile-follow-btn.vue';
import MobileFollowLayer from '@/components/page-watch-common/follow/follow-layer/mobile-follow-layer.vue';
import MobileProductBubble from '@/components/page-watch-common/interactive-receive/product/mobile-product-bubble.vue';
import MobileProductList from '@/components/page-watch-common/interactive-receive/product/mobile-product-list.vue';
import MobileQuestionAnswer from '@/components/page-watch-common/interactive-receive/question-answer/mobile-question-answer.vue';
import MobileTuwenLive from '@/components/page-watch-common/interactive-receive/tuwen-live/mobile-tuwen-live.vue';
import MobilePromoteExternalLink from '@/components/page-watch-common/promote-external-link/mobile-promote-external-link.vue';
import MobileVotePanel from '@/components/page-watch-common/interactive-receive/vote/mobile-vote-panel.vue';
import MobileInviteRank from '@/components/page-watch-common/invite/mobile-invite-rank/mobile-invite-rank.vue';
import MobileMemberList from '@/components/page-watch-common/member-list/member-list.vue';
import MobileMicroActivity from '@/components/page-watch-common/micro-activity/mobile-micro-activity/mobile-micro-activity.vue';
import MobilePlaybackList from '@/components/page-watch-common/playback-list/mobile-playback-list/mobile-playback-list.vue';
import MobileMultiMeetingPortrait from '@/components/page-watch-common/multi-meeting/mobile-multi-meeting/mobile-multi-meeting-portrait.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useDocStore } from '@/store/use-doc-store';
import { useChatStore } from '@/store/use-chat-store';
import { useLayoutStore } from '@/store/use-layout-store';

import { usePlaybackStore } from '@/store/use-playback-store';
import { ChannelMenuType, LiveStatus, MainScreenContent } from '@polyv/live-watch-sdk';
import { computed, unref } from 'vue';

import {
  TAB_NAME_ASK,
  TAB_NAME_CHAPTER,
  TAB_NAME_CHAT,
  TAB_NAME_DOC_OR_VIDEO,
  TAB_NAME_INVITE_RANK,
  TAB_NAME_MEMBERS,
  TAB_NAME_MICRO_ACTIVITY,
  TAB_NAME_MULTI_MEETING,
  TAB_NAME_PLAYBACK,
  TAB_NAME_PRODUCT,
  TAB_NAME_QA,
  TAB_NAME_SEAT,
  TAB_NAME_TUWEN_LIVE,
  TAB_NAME_VOTE,
} from '@/assets/constants/tab-name';
import { translate } from '@/assets/lang';
import { useFollowSetting } from '@/components/page-watch-common/follow/hooks/use-follow-setting';
import { useWatchTabHook } from '@/pages/watch/_hooks/use-watch-tab';
import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';

const { mobileMenuCurrentName, mainScreen } = storeDefinitionToRefs(useLayoutStore);

const { canRenderDoc } = storeDefinitionToRefs(useDocStore);

const { channelMenus, multiMeetingMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const { liveStatus } = storeDefinitionToRefs(useChannelStore);

const { chatSetting } = storeDefinitionToRefs(useChatStore);

const { chapterVisible } = storeDefinitionToRefs(usePlaybackStore);

const docOrCameraMenuName = computed(() => {
  if (unref(mainScreen) === MainScreenContent.Doc) {
    return translate('base.camera');
  }

  return translate('doc.name');
});

const { followEnabled } = useFollowSetting();
const { chatMenuAdditionData, askMenuAdditionData } = useWatchTabHook({ mode: 'mobile' });

const { trackWatchTabChange } = useWatchEventTrack();
</script>

<style lang="scss">
.c-mobile-watch-mobile-menu {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.c-mobile-watch-mobile-menu__topic {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 20;
  width: 100%;
}

.c-mobile-watch-mobile-menu__topic-item {
  margin: 16px 8px 0;
}
</style>
