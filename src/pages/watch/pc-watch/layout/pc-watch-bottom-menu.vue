<!-- @file PC 端底部菜单栏 -->
<template>
  <div class="c-pc-watch-bottom-menu">
    <pc-normal-tabs v-model="pcBottomTabCurrentName">
      <template v-for="(menu, index) in bottomMenuList">
        <!-- 直播介绍 -->
        <pc-normal-tab-pane
          v-if="menu.menuType === ChannelMenuType.Desc"
          :key="`decs-${index}`"
          :label="menu.name"
          :name="ChannelMenuType.Desc"
          lazy-load
        >
          <pc-rich-text-render :html-content="channelDescription" />
        </pc-normal-tab-pane>

        <!-- 回放 -->
        <pc-normal-tab-pane
          v-if="
            menu.menuType === ChannelMenuType.Previous &&
            ![LiveStatus.Live, LiveStatus.Stop].includes(liveStatus)
          "
          :key="`playback-${index}`"
          :label="menu.name"
          :name="TAB_NAME_PLAYBACK"
          lazy-load
        >
          <pc-playback-list />
        </pc-normal-tab-pane>

        <!-- 自定义图文 -->
        <pc-normal-tab-pane
          v-if="menu.menuType === ChannelMenuType.Text"
          :key="`text-${index}`"
          :label="menu.name"
          :name="menu.menuId"
          lazy-load
        >
          <pc-rich-text-render :html-content="menu.content" />
        </pc-normal-tab-pane>

        <!-- 图文直播 -->
        <pc-normal-tab-pane
          v-if="menu.menuType === ChannelMenuType.Tuwen"
          :key="`tuwen-${index}`"
          :label="menu.name"
          :name="TAB_NAME_TUWEN_LIVE"
          lazy-load
        >
          <pc-tuwen-live />
        </pc-normal-tab-pane>

        <!-- 推广外链 -->
        <pc-normal-tab-pane
          v-if="menu.menuType === ChannelMenuType.Iframe"
          :key="`iframe-${index}`"
          :label="menu.name"
          :name="menu.menuId"
          lazy-load
        >
          <pc-promote-external-link
            :src="menu.content"
            :open-type="menu.iframeOpenType"
            :is-active="pcBottomTabCurrentName === menu.menuId"
          />
        </pc-normal-tab-pane>

        <!-- 分会场（竖向） -->
        <pc-normal-tab-pane
          v-if="menu.menuType === ChannelMenuType.MultiMeeting"
          :key="`multi-meeting-${index}`"
          :label="menu.name"
          :name="TAB_NAME_MULTI_MEETING"
          lazy-load
        >
          <pc-multi-meeting-portrait />
        </pc-normal-tab-pane>
      </template>
    </pc-normal-tabs>
  </div>
</template>

<script setup lang="ts">
import {
  TAB_NAME_PLAYBACK,
  TAB_NAME_TUWEN_LIVE,
  TAB_NAME_MULTI_MEETING,
} from '@/assets/constants/tab-name';
import PcNormalTabs from '@/components/common-base/tabs/pc-normal-tabs/pc-normal-tabs.vue';
import PcNormalTabPane from '@/components/common-base/tabs/pc-normal-tabs/pc-normal-tab-pane.vue';
import PcRichTextRender from '@/components/common-base/rich-text-render/pc-rich-text-render.vue';
import PcTuwenLive from '@/components/page-watch-common/interactive-receive/tuwen-live/pc-tuwen-live.vue';
import PcPromoteExternalLink from '@/components/page-watch-common/promote-external-link/pc-promote-external-link.vue';
import PcPlaybackList from '@/components/page-watch-common/playback-list/pc-playback-list/pc-playback-list.vue';
import PcMultiMeetingPortrait from '@/components/page-watch-common/multi-meeting/pc-multi-meeting/pc-multi-meeting-portrait.vue';

import { useChannelStore } from '@/store/use-channel-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { ChannelMenuItem, ChannelMenuType, LiveStatus } from '@polyv/live-watch-sdk';
import { computed, unref } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { randomStr } from '@utils-ts/string';
import { useLayoutStore } from '@/store/use-layout-store';

const { channelDescription } = storeDefinitionToRefs(useChannelInfoStore);
const { liveStatus } = storeDefinitionToRefs(useChannelStore);
const { channelMenus, multiMeetingMenuData } = storeDefinitionToRefs(useChannelMenuStore);
const { pcBottomTabCurrentName } = storeDefinitionToRefs(useLayoutStore);

/**
 * 需要移除的菜单类型
 */
const removeMenuTypes = computed<ChannelMenuType[]>(() => {
  return [
    ChannelMenuType.Chat,
    ChannelMenuType.Quiz,
    ChannelMenuType.QA,
    ChannelMenuType.Invite,
    ChannelMenuType.Buy,
    ChannelMenuType.Members,
  ];
});

/** 底部菜单栏列表 */
const bottomMenuList = computed<ChannelMenuItem[]>(() => {
  const menus = unref(channelMenus).filter(menu => {
    // 需要移除的菜单栏类型
    const removeTypes = [...unref(removeMenuTypes)];

    /** @todo 嘉宾坐席逻辑处理 */

    return !removeTypes.includes(menu.menuType);
  });

  // 显示分会场菜单默认在最后一个
  if (unref(multiMeetingMenuData).visible) {
    menus.push({
      menuId: randomStr(8),
      menuType: ChannelMenuType.MultiMeeting,
      name: unref(multiMeetingMenuData).label,
    });
  }

  return menus;
});
</script>
