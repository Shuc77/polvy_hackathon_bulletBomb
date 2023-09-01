import { ref } from 'vue';
import debounce from 'lodash-es/debounce';

import { InviteDetailListItem, InviteDetailListRequestFailReason } from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';

export const useInviteDetail = () => {
  const page = ref(0);
  const isLoading = ref(false);
  const isNoMore = ref(false);
  const isLoadFailed = ref(false);
  const totalInviteDetailList = ref<InviteDetailListItem[]>([]);
  const inviteDetailList = ref<InviteDetailListItem[]>([]);

  async function initInviteDetail() {
    page.value = 0;
    isLoading.value = false;
    isNoMore.value = false;
    await getInviteDetail(true);
  }

  async function getInviteDetail(isFirst = false) {
    if (isLoading.value || isNoMore.value) return;

    try {
      isLoadFailed.value = false;
      isLoading.value = true;

      const watchCore = getWatchCore();
      const data = await watchCore.invite.getInviteDetailList({
        pageNumber: page.value + 1,
      });

      isLoading.value = false;

      if (!data.success) {
        if (data.failReason === InviteDetailListRequestFailReason.FeatureClose) {
          isNoMore.value = true;
          return;
        }
        throw new Error('getInviteDetailList request failed');
      }

      page.value = data.pageNumber;
      inviteDetailList.value = data.contents;
      if (data.totalPages <= page.value) {
        isNoMore.value = true;
      }

      if (isFirst) {
        totalInviteDetailList.value = [];
      }
      if (inviteDetailList.value.length > 0) {
        const pushedList = isNoMore.value
          ? inviteDetailList.value
          : inviteDetailList.value.splice(0, 20);
        totalInviteDetailList.value.push(...pushedList);
      }
    } catch (err) {
      isLoadFailed.value = true;
      isLoading.value = false;
      console.error('getInviteDetailList', err);
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
      if (inviteDetailList.value.length > 0) {
        totalInviteDetailList.value.push(...inviteDetailList.value.splice(0, 20));
      } else {
        getInviteDetail();
      }
    }
  }, debounceTime);

  return {
    totalInviteDetailList,

    initInviteDetail,
    getInviteDetail,

    handleScroll,
  };
};
