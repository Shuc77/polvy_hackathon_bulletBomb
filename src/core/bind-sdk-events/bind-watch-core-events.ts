import { getWatchCore } from '@/core/watch-sdk';
import { PolyvWatchCoreEvents } from '@polyv/live-watch-sdk';

import { useChannelStore } from '@/store/use-channel-store';
import { useFinanceStore } from '@/store/use-finance-store';

export function bindWatchCoreEvents(): void {
  const watchCore = getWatchCore();

  const channelStore = useChannelStore();
  const financeStore = useFinanceStore();

  // 观看核心已安装
  watchCore.eventEmitter.on(PolyvWatchCoreEvents.WatchCoreSetuped, () => {
    channelStore.syncChannelDetail();

    financeStore.initRiskConfirm();
    financeStore.initRiskEvaluation();
  });

  // 观看核心已连接聊天室
  watchCore.eventEmitter.on(PolyvWatchCoreEvents.WatchCoreConnected, () => {
    console.log('观看核心已连接聊天室');
  });

  // 观看核心已销毁
  watchCore.eventEmitter.on(PolyvWatchCoreEvents.WatchCoreDestroyed, () => {
    console.log('观看核心已销毁');
  });
}
