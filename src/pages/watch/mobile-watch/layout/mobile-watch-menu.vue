<!-- @file 移动端底部菜单栏 -->
<template>
  <div class="c-mobile-watch-mobile-menu">
    <mobile-menu-tabs v-model="mobileMenuCurrentName">
      <template #header-suffix>
        <mobile-follow-btn v-if="followEnabled" />
      </template>

      <!-- 商品库推送气泡 -->
      <mobile-product-bubble />

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

      <template v-for="(menu, index) in filterChannelMenus">
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
          <mobile-chat-room />
        </mobile-menu-tab-pane>

        <!-- 提问 -->
        <mobile-menu-tab-pane
          v-else-if="menu.menuType === ChannelMenuType.Quiz"
          :key="`quiz-${index}`"
          :label="menu.name"
          :name="TAB_NAME_ASK"
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
            menu.menuType === ChannelMenuType.Previous && liveStatus === LiveStatus.Playback
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
          <mobile-iframe-render :src="menu.content" />
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

      <!-- 章节 -->
      <template v-if="chapterEnabled">
        <mobile-menu-tab-pane
          :label="$lang('menu.tabName.chapter')"
          :name="TAB_NAME_CHAPTER"
          lazy-load
        >
          <mobile-chapter />
        </mobile-menu-tab-pane>
      </template>
    </mobile-menu-tabs>

    <!-- 关注弹层 -->
    <mobile-follow-layer v-if="followEnabled" />
  </div>
</template>

<script setup lang="ts">
import MobileFollowBtn from '@/components/page-watch-common/follow/follow-btn/mobile-follow-btn.vue';
import MobileFollowLayer from '@/components/page-watch-common/follow/follow-layer/mobile-follow-layer.vue';
import MobileIframeRender from '@/components/common-base/iframe-render/mobile-iframe-render.vue';
import MobileMenuTabPane from '@/components/common-base/tabs/mobile-menu-tabs/mobile-menu-tab-pane.vue';
import MobileMenuTabs from '@/components/common-base/tabs/mobile-menu-tabs/mobile-menu-tabs.vue';
import MobileBasicInfo from '@/components/common-business/basic-info/mobile-basic-info.vue';
import MobileChatRoom from '@/components/page-watch-common/chat/chat-room/mobile-chat-room.vue';
import MobileProductList from '@/components/page-watch-common/interactive-receive/product/mobile-product-list.vue';
import MobileTuwenLive from '@/components/page-watch-common/interactive-receive/tuwen-live/mobile-tuwen-live.vue';
import MobileVotePanel from '@/components/page-watch-common/interactive-receive/vote/mobile-vote-panel.vue';
import MobileInviteRank from '@/components/page-watch-common/invite/mobile-invite-rank/mobile-invite-rank.vue';
import MobileMemberList from '@/components/page-watch-common/member-list/member-list.vue';
import MobileQuestionAnswer from '@/components/page-watch-common/interactive-receive/question-answer/mobile-question-answer.vue';
import MobileProductBubble from '@/components/page-watch-common/interactive-receive/product/mobile-product-bubble.vue';
import MobilePlaybackList from '@/components/page-watch-common/playback-list/mobile-playback-list/mobile-playback-list.vue';
import MobileChapter from '@/components/page-watch-common/chapter/mobile-chapter.vue';
import MobileAsk from '@/components/page-watch-common/ask/mobile-ask/mobile-ask.vue';
import MobileMicroActivity from '@/components/page-watch-common/micro-activity/mobile-micro-activity/mobile-micro-activity.vue';
import MobileCustomTuwenTextMenu from '@/components/page-watch-common/custom-tuwen-text-menu/mobile-custom-tuwen-text-menu.vue';
import MobileDocSideSwitch from '@/components/page-watch-common/doc/doc-side-switch/mobile-doc-side-switch.vue';

import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useDocStore } from '@/store/use-doc-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { ChannelMenuType, LiveStatus, MainScreenContent } from '@polyv/live-watch-sdk';
import { computed, unref } from 'vue';
import { usePlaybackStore } from '@/store/use-playback-store';

import {
  TAB_NAME_DOC_OR_VIDEO,
  TAB_NAME_CHAT,
  TAB_NAME_QA,
  TAB_NAME_ASK,
  TAB_NAME_PLAYBACK,
  TAB_NAME_CHAPTER,
  TAB_NAME_PRODUCT,
  TAB_NAME_MEMBERS,
  TAB_NAME_VOTE,
  TAB_NAME_MICRO_ACTIVITY,
  TAB_NAME_TUWEN_LIVE,
  TAB_NAME_SEAT,
  TAB_NAME_INVITE_RANK,
} from '@/assets/constants/tab-name';
import { useFollowSetting } from '@/components/page-watch-common/follow/hooks/use-follow-setting';
import { translate } from '@/assets/lang';
import { useWatchTabHook } from '@/pages/watch/_hooks/use-watch-tab';

const { mobileMenuCurrentName, mainScreen } = storeDefinitionToRefs(useLayoutStore);

const { canRenderDoc } = storeDefinitionToRefs(useDocStore);

const { channelMenus } = storeDefinitionToRefs(useChannelMenuStore);

const { isSeminarChannel, liveStatus } = storeDefinitionToRefs(useChannelStore);

const { chapterEnabled } = storeDefinitionToRefs(usePlaybackStore);

const docOrCameraMenuName = computed(() => {
  if (unref(mainScreen) === MainScreenContent.Doc) {
    return translate('base.camera');
  }

  return translate('doc.name');
});

/** 二次过滤后的菜单列表 */
const filterChannelMenus = computed(() => {
  return unref(channelMenus).filter(menu => {
    // 研讨会下不显示提问
    if (unref(isSeminarChannel) && menu.menuType === ChannelMenuType.Quiz) {
      return false;
    }

    return true;
  });
});

const { followEnabled } = useFollowSetting();
const { chatMenuAdditionData } = useWatchTabHook({ mode: 'mobile' });
</script>

<style lang="scss">
.c-mobile-watch-mobile-menu {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
