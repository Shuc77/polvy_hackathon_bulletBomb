<!-- @file PC 端底部菜单栏 -->
<template>
  <div class="c-pc-watch-bottom-menu">
    <pc-normal-tabs
      v-model="pcBottomTabCurrentName"
      ref="pcBottomMenuRef"
    >
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
          <pc-tuwen-live v-if="iarSdkLoaded" />
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

        <!-- 云席 -->
        <pc-normal-tab-pane
          v-if="menu.menuType === ChannelMenuType.Seat"
          :key="`seat-${index}`"
          :label="menu.name"
          :name="TAB_NAME_SEAT"
          lazy-load
        >
          <pc-seat-table />
        </pc-normal-tab-pane>
      </template>
    </pc-normal-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, unref, onMounted, ref, watch } from 'vue';

import {
  TAB_NAME_PLAYBACK,
  TAB_NAME_TUWEN_LIVE,
  TAB_NAME_MULTI_MEETING,
  TAB_NAME_SEAT,
} from '@/assets/constants/tab-name';
import PcNormalTabs from '@/components/common-base/tabs/pc-normal-tabs/pc-normal-tabs.vue';
import PcNormalTabPane from '@/components/common-base/tabs/pc-normal-tabs/pc-normal-tab-pane.vue';
import PcRichTextRender from '@/components/common-base/rich-text-render/pc-rich-text-render.vue';
import PcTuwenLive from '@/components/page-watch-common/interactive-receive/tuwen-live/pc-tuwen-live.vue';
import PcPromoteExternalLink from '@/components/page-watch-common/promote-external-link/pc-promote-external-link.vue';
import PcPlaybackList from '@/components/page-watch-common/playback-list/pc-playback-list/pc-playback-list.vue';
import PcMultiMeetingPortrait from '@/components/page-watch-common/multi-meeting/pc-multi-meeting/pc-multi-meeting-portrait.vue';
import PcSeatTable from '@/components/page-watch-common/interactive-receive/seat-table/pc-seat-table.vue';
import { TabsInstance } from '@/components/common-base/tabs/hooks/types';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { ChannelMenuItem, ChannelMenuType, LiveStatus } from '@polyv/live-watch-sdk';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

import { randomStr } from '@utils-ts/string';
import { paramGetter } from '@/hooks/core/use-query-params';

const { channelDescription } = storeDefinitionToRefs(useChannelInfoStore);
const { liveStatus } = storeDefinitionToRefs(useChannelStore);
const { channelMenus, multiMeetingMenuData } = storeDefinitionToRefs(useChannelMenuStore);
const { pcBottomTabCurrentName } = storeDefinitionToRefs(useLayoutStore);
const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);

/** 底部菜单栏列表 */
const bottomMenuList = computed<ChannelMenuItem[]>(() => {
  // 需要保留展示的菜单类型
  const remainTypes = [
    ChannelMenuType.Desc,
    ChannelMenuType.Previous,
    ChannelMenuType.Text,
    ChannelMenuType.Tuwen,
    ChannelMenuType.Iframe,
    ChannelMenuType.Seat,
  ];

  const menus = unref(channelMenus).filter(menu => {
    return remainTypes.includes(menu.menuType);
  });

  // 如需显示分会场(竖向)，则默认放在最后一个
  if (unref(multiMeetingMenuData).visible) {
    menus.push({
      menuId: randomStr(8),
      menuType: ChannelMenuType.MultiMeeting,
      name: unref(multiMeetingMenuData).label,
    });
  }

  return menus;
});

const pcBottomMenuRef = ref<TabsInstance>();

onMounted(() => {
  const playBackVid = paramGetter.playBackVid();
  if (playBackVid) {
    const hasPlayBack = bottomMenuList.value.findIndex(
      item => item.menuType === ChannelMenuType.Previous,
    );
    if (hasPlayBack === -1) return;
    pcBottomMenuRef.value?.setDefaultTabName(TAB_NAME_PLAYBACK);
  }
});

watch(liveStatus, () => {
  if ([LiveStatus.Live, LiveStatus.Stop].includes(liveStatus.value)) {
    pcBottomMenuRef.value?.setDefaultTabName('');
  }
});
</script>
