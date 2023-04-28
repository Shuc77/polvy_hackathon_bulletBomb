import { computed } from 'vue';
import { getWatchCore } from '@/core/watch-sdk';

import { useChannelStore } from '@/store/use-channel-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

import { ynToBool } from '@utils-ts/boolean';
import { YN } from '@polyv/live-watch-sdk';

/**
 * @hook 互动-红包挂件
 * */
export const useRedpackPendant = () => {
  const channelStore = useChannelStore();
  const interactReceiveStore = useInteractReceiveStore();

  const watchCore = getWatchCore();
  /** 红包 SDK 实例 */
  const redpackSdk = watchCore.interactReceive.getRedpack();

  /** 自动请求详情 */
  const autoFetchDetail = computed(() => {
    return ynToBool(channelStore.channelDetail?.channelConfig.userRedpackEnabled, YN.N);
  });

  /** 处理红包挂件入口显示状态改变 */
  function onEntryVisibleChanged(visible = true) {
    interactReceiveStore.redpackPendantVisible = visible;
  }

  return {
    redpackSdk,
    autoFetchDetail,
    onEntryVisibleChanged,
  };
};
