/**
 * @file 频道菜单 store
 */
import { computed, ComputedRef, Ref, ref, unref } from 'vue';
import { defineStore } from 'pinia';
import { translate } from '@/assets/lang';
import { getWatchCore } from '@/core/watch-sdk';
import {
  ChannelMenuItem,
  ChannelMenuType,
  MultiMeetingListLayout,
  YN,
} from '@polyv/live-watch-sdk';
import cloneDeep from 'lodash-es/cloneDeep';

import { useInteractReceiveStore } from './use-interact-receive-store';
import { useLangStore } from './use-lang-store';
import { useWatchAppStore } from './use-watch-app-store';
import { useMultiMeetingStore } from './use-multi-meeting-store';
import { useChannelStore } from './use-channel-store';
import { ynToBool } from '@utils-ts/boolean';

export interface MenuDataType {
  /** 是否创建该菜单节点 */
  visible: boolean;
  /** 菜单标题 */
  label: string;
}

/** 频道菜单 store */
export interface ChannelMenuStoreState {
  /** 中文频道菜单 */
  cnChannelMenus: Ref<ChannelMenuItem[]>;
  /** 英文频道菜单 */
  enChannelMenus: Ref<ChannelMenuItem[]>;
  /** 频道菜单（根据多语言返回） */
  channelMenus: ComputedRef<ChannelMenuItem[]>;
  /** 聊天室菜单信息 */
  chatMenuData: ComputedRef<MenuDataType>;
  /** 商品库菜单信息 */
  productMenuData: ComputedRef<MenuDataType>;
  /** 用户列表菜单信息 */
  membersMenuData: ComputedRef<MenuDataType>;
  /** 提问菜单信息 */
  askMenuData: ComputedRef<MenuDataType>;
  /** 问答菜单信息 */
  qaMenuData: ComputedRef<MenuDataType>;
  /** 投票活动菜单信息 */
  voteActiveMenuData: ComputedRef<MenuDataType>;
  /** 邀请榜菜单信息 */
  inviteRankMenuData: ComputedRef<MenuDataType>;
  /** 微活动菜单信息 */
  microActivityMenuData: ComputedRef<MenuDataType>;
  /** 分会场菜单信息 */
  multiMeetingMenuData: ComputedRef<MenuDataType>;
}

export interface ChannelMenuStoreAction {
  /** 同步频道菜单数据 */
  syncChannelMenus: () => void;
  /** 插入菜单 */
  addChannelMenu: (menuData: ChannelMenuItem, onlyType?: boolean) => void;
  /** 移除菜单 */
  removeChannelMenu: (menuId: string) => void;
  /** 根据菜单类型获取菜单数据 */
  getMenuData: (menuType: ChannelMenuType) => ChannelMenuItem | undefined;
  /** 根据菜单类型获取菜单 Tab 名称 */
  filterMenuTabLabel: (menuType: ChannelMenuType, label: string) => string;
}

/** 频道菜单 store */
export interface ChannelMenuStore extends ChannelMenuStoreState, ChannelMenuStoreAction {}

export const useChannelMenuStore = defineStore<'channelMenu', ChannelMenuStore>(
  'channelMenu',
  () => {
    const watchAppStore = useWatchAppStore();
    const langStore = useLangStore();
    const channelStore = useChannelStore();
    const interactReceiveStore = useInteractReceiveStore();
    const multiMeetingStore = useMultiMeetingStore();

    /** 中文频道菜单 */
    const cnChannelMenus = ref<ChannelMenuItem[]>([]);
    /** 英文频道菜单 */
    const enChannelMenus = ref<ChannelMenuItem[]>([]);

    /** 频道菜单（根据多语言返回） */
    const channelMenus = computed<ChannelMenuItem[]>(() => {
      let menus = unref(cnChannelMenus);

      if (langStore.englishSettingEnabled && !langStore.isChineseLang) {
        menus = unref(enChannelMenus);
      }

      if (watchAppStore.isPlaybackWatchUrl) {
        menus = menus.filter(menu => menu.menuType === ChannelMenuType.Chat);
      }

      // 研讨会下不显示提问
      if (channelStore.isSeminarChannel) {
        menus = menus.filter(menu => menu.menuType === ChannelMenuType.Quiz);
      }

      // 处理 displayEnabled 字段
      menus = menus.filter(menu => ynToBool(menu.displayEnabled, YN.Y));

      return menus.map(menu => {
        return {
          ...menu,
          name: filterMenuTabLabel(menu.menuType, menu.name),
        };
      });
    });

    /** 同步频道菜单 */
    function syncChannelMenus(): void {
      const watchCore = getWatchCore();
      cnChannelMenus.value = cloneDeep(watchCore.menu.getChannelMenus('zh_CN'));
      enChannelMenus.value = cloneDeep(watchCore.menu.getChannelMenus('en'));
    }

    /**
     * 插入菜单
     * @param menuData 菜单数据
     * @param onlyType 是否唯一的 menuType
     */
    function addChannelMenu(menuData: ChannelMenuItem, onlyType = false): void {
      const findMenuIndex = (menu: ChannelMenuItem) => {
        if (onlyType && menu.menuType === menuData.menuType) {
          return true;
        }
        return menu.menuId === menuData.menuId;
      };

      // 插入中文菜单
      const cnIndex = unref(cnChannelMenus).findIndex(findMenuIndex);
      if (cnIndex === -1) {
        const newCnMenus = [...unref(cnChannelMenus), menuData];
        cnChannelMenus.value = newCnMenus;
      }
      // 插入英文菜单
      const enIndex = unref(enChannelMenus).findIndex(findMenuIndex);
      if (enIndex === -1) {
        const newEnMenus = [...unref(enChannelMenus), menuData];
        enChannelMenus.value = newEnMenus;
      }
    }

    /**
     * 移除菜单
     * @param menuId 菜单 id
     */
    function removeChannelMenu(menuId: string): void {
      // 移除中文菜单
      const newCnMenus = unref(cnChannelMenus).filter(menu => menu.menuId !== menuId);
      cnChannelMenus.value = newCnMenus;
      // 移除英文菜单
      const newEnMenus = unref(enChannelMenus).filter(menu => menu.menuId !== menuId);
      enChannelMenus.value = newEnMenus;
    }

    /**
     * 根据菜单类型获取菜单数据
     * @param menuType 菜单类型
     */
    function getMenuData(menuType: ChannelMenuType): ChannelMenuItem | undefined {
      const menus = unref(channelMenus);
      const index = menus.findIndex(menu => menu.menuType === menuType);
      return index === -1 ? undefined : menus[index];
    }

    /** 获取菜单栏 */
    function filterMenuTabLabel(menuType: ChannelMenuType, label: string): string {
      type TranslateOptionItem = [translateText: string, ...cnTexts: string[]];

      const translateOptions: Record<ChannelMenuType, TranslateOptionItem> = {
        [ChannelMenuType.Desc]: [translate('menu.tabName.desc'), '直播介绍'],
        [ChannelMenuType.Chat]: [translate('menu.tabName.chat'), '聊天', '互动聊天'],
        [ChannelMenuType.Text]: [translate('menu.tabName.text'), '图文'],
        [ChannelMenuType.Seat]: [translate('menu.tabName.seat'), '云席'],
        [ChannelMenuType.Quiz]: [translate('menu.tabName.quiz'), '提问'],
        [ChannelMenuType.Iframe]: [translate('menu.tabName.iframe'), '链接'],
        [ChannelMenuType.Previous]: [translate('menu.tabName.previous'), '往期'],
        [ChannelMenuType.Tuwen]: [translate('menu.tabName.tuwen'), '图文直播'],
        [ChannelMenuType.QA]: [translate('menu.tabName.qa'), '问答'],
        [ChannelMenuType.Buy]: [translate('menu.tabName.buy'), '边看边买'],
        [ChannelMenuType.Invite]: [translate('menu.tabName.invite'), '邀请榜'],
        [ChannelMenuType.Members]: [translate('menu.tabName.members'), '成员'],
        [ChannelMenuType.Vote]: [translate('menu.tabName.vote'), '投票'],
        [ChannelMenuType.MicroActivity]: [translate('menu.tabName.microActivity'), '微活动'],
        [ChannelMenuType.MultiMeeting]: [translate('menu.tabName.multiMeeting'), '分会场'],
      };

      if (!translateOptions[menuType]) {
        console.warn(`${menuType} 不存在多语言映射表中，需要进行补充`);
        return label;
      }

      const [translateText, ...cnTexts] = translateOptions[menuType];
      if (!label || (!langStore.isChineseLang && cnTexts.includes(label))) {
        label = translateText;
      }

      return label;
    }

    /** 聊天室菜单信息 */
    const chatMenuData = computed<MenuDataType>(() => {
      const menuData = getMenuData(ChannelMenuType.Chat);

      return {
        visible: !!menuData,
        label: menuData?.name ?? translate('menu.tabName.chat'),
      };
    });

    /** 商品库菜单信息 */
    const productMenuData = computed<MenuDataType>(() => {
      const menuData = getMenuData(ChannelMenuType.Buy);

      return {
        visible: !!menuData && interactReceiveStore.interactSetting.productEnabled,
        label: menuData?.name ?? translate('menu.tabName.buy'),
      };
    });

    /** 用户列表菜单信息 */
    const membersMenuData = computed<MenuDataType>(() => {
      const menuData = getMenuData(ChannelMenuType.Members);

      return {
        visible: !!menuData,
        label: menuData?.name ?? translate('menu.tabName.members'),
      };
    });

    /** 提问菜单信息 */
    const askMenuData = computed<MenuDataType>(() => {
      const menuData = getMenuData(ChannelMenuType.Quiz);

      return {
        visible: !!menuData,
        label: menuData?.name ?? translate('menu.tabName.quiz'),
      };
    });

    /** 问答菜单信息 */
    const qaMenuData = computed<MenuDataType>(() => {
      const menuData = getMenuData(ChannelMenuType.QA);

      return {
        visible: !!menuData,
        label: menuData?.name ?? translate('menu.tabName.qa'),
      };
    });

    /** 投票活动菜单信息 */
    const voteActiveMenuData = computed<MenuDataType>(() => {
      const visible =
        interactReceiveStore.interactSetting.voteActiveEnabled && !watchAppStore.isPlaybackWatchUrl;
      return {
        visible,
        label: translate('menu.tabName.vote'),
      };
    });

    /** 邀请榜菜单信息 */
    const inviteRankMenuData = computed<MenuDataType>(() => {
      const menuData = getMenuData(ChannelMenuType.Invite);

      return {
        visible: !!menuData,
        label: menuData?.name ?? translate('menu.tabName.invite'),
      };
    });

    /** 微活动菜单信息 */
    const microActivityMenuData = computed<MenuDataType>(() => {
      const menuData = getMenuData(ChannelMenuType.MicroActivity);

      return {
        visible: !!menuData,
        label: menuData?.name ?? translate('menu.tabName.microActivity'),
      };
    });

    /** 分会场菜单信息 */
    const multiMeetingMenuData = computed<MenuDataType>(() => {
      return {
        visible:
          multiMeetingStore.multiMeetingEnabled &&
          multiMeetingStore.multiMeetingListLayout === MultiMeetingListLayout.Portrait,
        label: filterMenuTabLabel(
          ChannelMenuType.MultiMeeting,
          translate('menu.tabName.multiMeeting'),
        ),
      };
    });

    return {
      cnChannelMenus,
      enChannelMenus,
      channelMenus,
      chatMenuData,
      productMenuData,
      membersMenuData,
      askMenuData,
      qaMenuData,
      voteActiveMenuData,
      inviteRankMenuData,
      microActivityMenuData,
      multiMeetingMenuData,

      addChannelMenu,
      removeChannelMenu,
      syncChannelMenus,
      getMenuData,
      filterMenuTabLabel,
    };
  },
);
