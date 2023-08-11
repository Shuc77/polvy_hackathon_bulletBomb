import { useChatStore } from '@/store/use-chat-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { AppConfig, PolyvWatchCore, createWatchCore, setDebugMode } from '@polyv/live-watch-sdk';

import { bindChannelModuleEvents } from '@/core/bind-sdk-events/bind-channel-events';
import { bindChatModuleEvents } from '@/core/bind-sdk-events/bind-chat-events';
import { bindConnectMicModuleEvents } from '@/core/bind-sdk-events/bind-connect-mic-events';
import { bindEnrollModuleEvents } from '@/core/bind-sdk-events/bind-enroll-events';
import { bindInteractReceiveEvents } from '@/core/bind-sdk-events/bind-interact-receive-events';
import { bindPlayerModuleEvents } from '@/core/bind-sdk-events/bind-player-events';
import { bindUserEvents } from '@/core/bind-sdk-events/bind-user-events';
import { bindWatchCoreEvents } from '@/core/bind-sdk-events/bind-watch-core-events';

/** 观看页核心模块实例 */
let watchCore: PolyvWatchCore | undefined;

/** 获取观看页核心模块实例 */
export function getWatchCore(): PolyvWatchCore {
  if (!watchCore) {
    throw new Error('watchCore in not define!');
  }
  return watchCore;
}

/** 初始化观看页应用对象 */
export function initWatchSdk(appConfig: AppConfig): PolyvWatchCore {
  if (watchCore) {
    return watchCore;
  }
  const chatStore = useChatStore();
  const viewerStore = useViewerStore();

  watchCore = createWatchCore(appConfig);

  // 绑定 SDK 相关事件的监听回调
  bindWatchCoreEvents();
  bindChannelModuleEvents();
  bindChatModuleEvents();
  bindConnectMicModuleEvents();
  bindEnrollModuleEvents();
  bindInteractReceiveEvents();
  bindPlayerModuleEvents();
  bindUserEvents();

  // 设置弹幕添加拦截器，如果当前只看主持人，则不添加弹幕
  watchCore.barrage.setBarrageAddIntercept(data => {
    const userType = data.user?.userType;
    const userId = data.user?.userId;
    const actor = data.user?.actor;

    if (
      chatStore.onlySpecialMsg &&
      !watchCore?.user.isSpecialUserType(userType, actor) &&
      userId !== viewerStore.viewerId
    ) {
      return true;
    }

    return false;
  });

  return watchCore;
}

window.debugWatchSdk = (params?: string) => {
  // 生产环境增加限制
  if (WATCH_SDK_ENV === 'prod' && params !== `plv_watch_v${PROJECT_VERSION}`) {
    return;
  }

  window.watchCore = watchCore;
  setDebugMode(true);
  console.info(watchCore);
};
