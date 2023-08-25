/** @file 邀请榜 hook 钩子 */

import debounce from 'lodash-es/debounce';
import { computed, ref, unref } from 'vue';

import { getWatchCore } from '@/core/watch-sdk';
import { useInviteStore } from '@/store/use-invite-store';
import { useViewerStore } from '@/store/use-viewer-store';

import { translate } from '@/assets/lang';
import { isWeixin, isWorkWeixin } from '@/assets/utils/browser';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import {
  InviteRankCurrentViewer,
  InviteRankItem,
  InviteRankRequestFailReason,
} from '@polyv/live-watch-sdk';

const isGeneralWeixin = isWeixin && !isWorkWeixin;

export const useInviteRankHook = () => {
  const page = ref(0);
  const isLoading = ref(false);
  const isNoMore = ref(false);
  /** 接口获取的邀请榜列表 */
  const resRankList = ref<InviteRankItem[]>([]);
  /** 当前可见的邀请榜列表，除去前三名 */
  const rankList = ref<InviteRankItem[]>([]);
  /** 邀请榜前三名 */
  const topThreeRankItems = ref<InviteRankItem[]>([]);
  /** 接口获取的当前用户邀请数据 */
  const currentRankInfo = ref<InviteRankCurrentViewer | null>(null);
  /** 是否加载接口失败 */
  const isLoadFailed = ref(false);

  const viewerStore = useViewerStore();
  const { invitePosterEnabled } = storeDefinitionToRefs(useInviteStore);

  /** 是否显示底部信息 */
  const showBottomInfo = computed(() => {
    return isGeneralWeixin && currentRankInfo.value && invitePosterEnabled.value;
  });

  /** 当前用户与第一名的距离 */
  const currentToFirstNumber = computed(() => {
    if (!currentRankInfo.value || !topThreeRankItems.value.length) {
      return 0;
    }
    return Math.abs(topThreeRankItems.value[0].inviteNum - currentRankInfo.value.inviteNum);
  });

  /** 当前用户与第二名的距离 */
  const currentToSecondNumber = computed(() => {
    if (!currentRankInfo.value || topThreeRankItems.value.length < 2) {
      return 0;
    }
    return Math.abs(topThreeRankItems.value[1].inviteNum - currentRankInfo.value.inviteNum);
  });

  /** 当前用户的排名文案 */
  const currentDes = computed<string>(() => {
    const rankInfo = unref(currentRankInfo);
    if (!rankInfo) {
      return '';
    }

    // 我是第一名
    if (rankInfo.rank === 1) {
      // 只有我一个人
      if (unref(topThreeRankItems).length === 1) {
        return translate('invite.rank.desc1');
      }

      // 有第二名
      return translate('invite.rank.desc2', {
        number: String(currentToSecondNumber.value),
      });
    }

    return translate('invite.rank.desc3', {
      number: String(currentToFirstNumber.value),
    });
  });

  /** 判断是否为当前用户 */
  function isCurrentViewer(item: InviteRankItem) {
    return item.openId === viewerStore.openId;
  }

  /** 初始化邀请榜数据 */
  async function initInviteRank() {
    page.value = 0;
    isLoading.value = false;
    isNoMore.value = false;
    await getRankList(true);
    if (isGeneralWeixin) {
      await getCurrentRankInfo();
    }
  }

  const debounceTime = 300;
  /** 邀请榜滚动钩子 */
  const handleScroll = debounce(function (e) {
    if (isNoMore.value) {
      return;
    }
    // 获取下一页数据
    const target = e.target;
    const scrollHeight = parseInt(target.scrollHeight);
    const scrollTop = parseInt(target.scrollTop);
    const clientHeight = parseInt(target.clientHeight);
    if (scrollTop >= scrollHeight - clientHeight - 150) {
      if (resRankList.value.length > 0) {
        rankList.value.push(...resRankList.value.splice(0, 20));
      } else {
        getRankList();
      }
    }
  }, debounceTime);

  /** 获取邀请榜列表数据 */
  async function getRankList(isFirst = false) {
    if (isLoading.value || isNoMore.value) return;

    try {
      isLoadFailed.value = false;
      isLoading.value = true;

      const watchCore = getWatchCore();
      const data = await watchCore.invite.getRankList({
        pageNumber: page.value + 1,
      });

      isLoading.value = false;

      if (!data.success) {
        if (data.failReason === InviteRankRequestFailReason.FeatureClose) {
          isNoMore.value = true;
          return;
        }
        throw new Error('getRankList request failed');
      }

      page.value = data.pageNumber;
      resRankList.value = data.contents;
      if (data.totalPages <= page.value) {
        isNoMore.value = true;
      }

      if (isFirst) {
        rankList.value = [];
      }
      if (resRankList.value.length > 0) {
        const pushedList = isNoMore.value ? resRankList.value : resRankList.value.splice(0, 20);
        rankList.value.push(...pushedList);
        // 单独获取前三名数据
        if (isFirst) {
          topThreeRankItems.value = rankList.value.splice(0, 3);
        }
      }
    } catch (err) {
      isLoadFailed.value = true;
      isLoading.value = false;
      console.error('getRankList', err);
    }
  }

  /** 获取当前用户的排行信息 */
  async function getCurrentRankInfo() {
    try {
      const watchCore = getWatchCore();
      const data = await watchCore.invite.getCurrentRankInfo();
      if (!data) {
        console.warn('获取当前用户的排行榜信息为空');
      } else {
        currentRankInfo.value = { ...data };
      }
    } catch (error) {
      console.error('getCurrentRankInfo', error);
    }
  }

  return {
    currentRankInfo,
    rankList,
    topThreeRankItems,
    isLoading,
    isNoMore,
    isLoadFailed,

    showBottomInfo,
    currentDes,
    invitePosterEnabled,

    isCurrentViewer,
    initInviteRank,
    handleScroll,
  };
};
