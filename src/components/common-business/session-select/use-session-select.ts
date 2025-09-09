import { ref } from 'vue';

import { SimpleTabItem, SimpleTabItemValue } from '@/components/common-base/base-simple-tab';
import { useGlobalInject } from '@/app/use-global-inject';
import { ChannelSessionDataItem, ChannelSessionStatus, PageContent } from '@polyv/live-watch-sdk';
import { translate } from '@/assets/lang';

interface CategoryItem extends SimpleTabItem {
  status?: ChannelSessionStatus;
  order?: 'planStartTimeDesc' | 'planStartTimeAsc';
  visible: boolean;
}

export const useSessionSelect = (opts: { getVirtualPageSize: () => number }) => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const loading = ref(false);

  const categoryList = ref<CategoryItem[]>([]);

  const activeCategoryItem = ref<CategoryItem>();

  const sessionDataList = ref<ChannelSessionDataItem[]>([]);

  const totalSessionDataList = ref<ChannelSessionDataItem[]>([]);

  let dataSource: Omit<PageContent<ChannelSessionDataItem>, 'contents'> = {
    pageNumber: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 1,
  };

  /**
   * 获取列表数据
   */
  async function fetchChannelSessionDataList() {
    const result = await watchCore.channel.getChannelSessionList({
      pageNumber: dataSource.pageNumber,
      pageSize: dataSource.pageSize,
      status: activeCategoryItem.value?.status,
      order: activeCategoryItem.value?.order,
    });

    const { contents: data, ..._dataSource } = result;
    dataSource = _dataSource;

    const processedData = data.filter(item => item.name !== null);

    console.log('processedData', processedData);
    return processedData;
  }

  async function setChannelSessionDataList() {
    totalSessionDataList.value = await fetchChannelSessionDataList();

    const result = sessionDataList.value.concat(
      totalSessionDataList.value.splice(0, opts.getVirtualPageSize()),
    );

    sessionDataList.value = result;
  }

  async function onCategoryIdChange(categoryId: SimpleTabItemValue) {
    try {
      loading.value = true;
      const categoryItem = categoryList.value.find(i => i.value === categoryId);
      if (activeCategoryItem.value?.value === categoryItem?.value) return;

      activeCategoryItem.value = categoryItem;

      dataSource = {
        pageNumber: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1,
      };
      totalSessionDataList.value = [];
      sessionDataList.value = [];
      await setChannelSessionDataList();
    } catch (error) {
      console.error('onCategoryIdChange', error);
    } finally {
      loading.value = false;
    }
  }

  function loadMoreChannelSessionDataList() {
    // 总数据为空时，翻页请求接口
    if (totalSessionDataList.value.length === 0 && dataSource.pageNumber < dataSource.totalPages) {
      dataSource.pageNumber = dataSource.pageNumber + 1;
      setChannelSessionDataList();
      return;
    }

    // 总数据不为空时，前端自行分页
    sessionDataList.value = sessionDataList.value.concat(
      totalSessionDataList.value.splice(0, opts.getVirtualPageSize()),
    );
  }

  function setCategoryList() {
    const enabledPlayback = watchCore.channel.getEnablePlayback();
    const data: CategoryItem[] = [
      {
        label: translate('base.all'),
        value: 'all',
        visible: true,
      },
      {
        label: translate('liveStatus.live'),
        value: 'live',
        status: ChannelSessionStatus.Live,
        order: 'planStartTimeDesc',
        visible: true,
      },
      {
        label: translate('liveStatus.unStart'),
        value: 'notStart',
        status: ChannelSessionStatus.UnStart,
        order: 'planStartTimeAsc',
        visible: true,
      },
      {
        label: translate('liveStatus.playback'),
        value: 'playback',
        status: ChannelSessionStatus.Playback,
        order: 'planStartTimeDesc',
        visible: enabledPlayback,
      },
      {
        label: translate('liveStatus.end'),
        value: 'end',
        status: ChannelSessionStatus.End,
        order: 'planStartTimeDesc',
        visible: !enabledPlayback,
      },
    ];
    categoryList.value = data.filter(i => i.visible);
    activeCategoryItem.value = data[0];
  }

  async function initData() {
    try {
      loading.value = true;
      setCategoryList();
      await setChannelSessionDataList();
    } catch (error) {
      console.error('initData', error);
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,

    categoryList,
    activeCategoryItem,
    onCategoryIdChange,

    totalSessionDataList,
    sessionDataList,

    initData,
    loadMoreChannelSessionDataList,
  };
};
