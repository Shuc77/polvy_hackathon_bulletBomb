import { useGlobalInject } from '@/app/use-global-inject';
import {
  ChatEvents,
  ChatEventsRelations,
  InteractReceiveEvents,
  InteractReceiveEventsRelations,
  ProductClickType,
} from '@polyv/live-watch-sdk';
import { randomStr } from '@polyv/utils/es/string';
import { computed, nextTick, onBeforeUnmount, onMounted, Ref, ref, watchEffect } from 'vue';
import { MessageEffectData, MessageEffectType } from '../type';
import { useEffectSetting } from './use-effect-setting';

export interface RunwayEffectController {
  /** 设置跑道消息数据 */
  pushQueue(item: MessageEffectData): void;
  /** 获取跑道队列 */
  getRunwayQueue(): Ref<MessageEffectData[]>;
  /** 从队列尾部开始寻找节点 */
  getQueueItemByEnd(
    effectType: MessageEffectType,
    targetId: unknown,
  ): { index: number; item: MessageEffectData } | undefined;
  /** 设置显示时间，单位：ms */
  setVisibleTime(time: number): void;
}

/**
 * 观众登录跑道消息
 */
export const useRunwayJoinVisit = (controller: RunwayEffectController) => {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();

  const { effectSetting } = useEffectSetting();

  const targetId = 'joinVisit';
  const targetName = '';

  /** 处理聊天室登录事件 */
  function onUserLoginEvent(event: ChatEventsRelations[ChatEvents.ChatUserLogin]) {
    const user = event.user;
    if (!user) {
      return;
    }

    joinItem(user.nick);
  }

  function joinItem(nickname: string) {
    const runwayQueue = controller.getRunwayQueue();
    const queueItem = controller.getQueueItemByEnd(MessageEffectType.JoinVisit, targetId);
    if (queueItem) {
      runwayQueue.value[queueItem.index].nicknameCount += 1;
    } else if (effectSetting.joinVisitEffectTip) {
      controller.pushQueue({
        id: randomStr(8),
        effectType: MessageEffectType.JoinVisit,
        nicknames: [nickname],
        nicknameCount: 1,
        targetId,
        targetName,
        strTemplate: effectSetting.joinVisitEffectTip,
      });
    }
  }

  onMounted(() => {
    if (effectSetting.visitEffectEnabled) {
      watchCore.chat.eventEmitter.on(ChatEvents.ChatUserLogin, onUserLoginEvent);
    }
  });

  onBeforeUnmount(() => {
    if (effectSetting.visitEffectEnabled) {
      watchCore.chat.eventEmitter.off(ChatEvents.ChatUserLogin, onUserLoginEvent);
    }
  });
};

/**
 * 商品点击/下单跑道消息
 */
export const useRunwayProduct = (controller: RunwayEffectController) => {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();

  const { effectSetting, getProductClickTemplate, getProductBuyTemplate } = useEffectSetting();

  /**
   * 处理商品点击和购买事件
   * @param effectType 特效类型
   * @param data 商品数据
   */
  function handleProductEvent(
    effectType: MessageEffectType.ProductClick | MessageEffectType.ProductBuy,
    data: {
      type: ProductClickType;
      nickname: string;
      productId: string;
      productName: string;
      nicknameCount: number;
    },
  ) {
    const { type, nickname, productId, productName } = data;

    const runwayQueue = controller.getRunwayQueue();
    const queueItem = controller.getQueueItemByEnd(effectType, productId);
    if (queueItem) {
      runwayQueue.value[queueItem.index].nicknameCount += data.nicknameCount;
    } else {
      let strTemplate = '';
      if (effectType === MessageEffectType.ProductClick) {
        strTemplate = getProductClickTemplate(type);
      } else {
        strTemplate = getProductBuyTemplate();
      }

      if (strTemplate) {
        controller.pushQueue({
          id: randomStr(8),
          effectType,
          nicknames: [nickname],
          nicknameCount: data.nicknameCount,
          targetId: productId,
          targetName: productName,
          productType: type,
          strTemplate,
        });
      }
    }
  }

  function onProductClickEvent(
    data: InteractReceiveEventsRelations[InteractReceiveEvents.ProductClick],
  ) {
    const type = data.type;
    const nickname = data.nickname;
    const productId = data.productId;
    const productName = data.name;

    handleProductEvent(MessageEffectType.ProductClick, {
      type,
      nickname,
      productId,
      productName,
      nicknameCount: 1,
    });
  }

  function onProductBuyEvent(
    data: InteractReceiveEventsRelations[InteractReceiveEvents.ProductBuyTimes],
  ) {
    const type = data.productType;
    const nickname = data.nickname;
    const productId = data.productId;
    const productName = data.productName;
    const count = data.count;

    handleProductEvent(MessageEffectType.ProductBuy, {
      type,
      nickname,
      productId,
      productName,
      nicknameCount: count,
    });
  }

  onMounted(() => {
    if (effectSetting.productEffectEnabled) {
      watchCore.interactReceive.eventEmitter.on(
        InteractReceiveEvents.ProductClick,
        onProductClickEvent,
      );

      watchCore.interactReceive.eventEmitter.on(
        InteractReceiveEvents.ProductBuyTimes,
        onProductBuyEvent,
      );
    }
  });

  onBeforeUnmount(() => {
    if (effectSetting.productEffectEnabled) {
      watchCore.interactReceive.eventEmitter.off(
        InteractReceiveEvents.ProductClick,
        onProductClickEvent,
      );

      watchCore.interactReceive.eventEmitter.off(
        InteractReceiveEvents.ProductBuyTimes,
        onProductBuyEvent,
      );
    }
  });
};

/**
 * 签到跑道消息
 */
export const useRunwayCheckIn = (controller: RunwayEffectController) => {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();

  const { effectSetting } = useEffectSetting();

  const targetId = 'checkIn';
  const targetName = '';

  function onCheckInTimes(data: InteractReceiveEventsRelations[InteractReceiveEvents.SignInTimes]) {
    const nickname = data.nickname;
    const count = data.count;

    const runwayQueue = controller.getRunwayQueue();
    const queueItem = controller.getQueueItemByEnd(MessageEffectType.CheckIn, targetId);
    if (queueItem) {
      runwayQueue.value[queueItem.index].nicknameCount += count;
    } else if (effectSetting.checkinInteractionEffectTip) {
      controller.pushQueue({
        id: randomStr(8),
        effectType: MessageEffectType.CheckIn,
        nicknames: [nickname],
        nicknameCount: count,
        targetId,
        targetName,
        strTemplate: effectSetting.checkinInteractionEffectTip,
      });
    }
  }

  onMounted(() => {
    if (effectSetting.interactionEffectEnabled) {
      watchCore.interactReceive.eventEmitter.on(InteractReceiveEvents.SignInTimes, onCheckInTimes);
    }
  });

  onBeforeUnmount(() => {
    if (effectSetting.interactionEffectEnabled) {
      watchCore.interactReceive.eventEmitter.off(InteractReceiveEvents.SignInTimes, onCheckInTimes);
    }
  });
};

/**
 * 跑道消息 hook
 */
export const useRunwayEffect = () => {
  const controller: RunwayEffectController = {
    pushQueue,
    getRunwayQueue,
    getQueueItemByEnd,
    setVisibleTime,
  };

  useRunwayJoinVisit(controller);
  useRunwayProduct(controller);
  useRunwayCheckIn(controller);

  /** 外层是否显示 */
  const wrapVisible = ref(false);

  /** 跑道队列 */
  const runwayQueue = ref<MessageEffectData[]>([]);

  function onAfterLeave() {
    if (runwayQueue.value.length === 0) {
      wrapVisible.value = false;
    }
  }

  /** 插入队列 */
  async function pushQueue(item: MessageEffectData) {
    wrapVisible.value = true;
    await nextTick();
    runwayQueue.value.push(item);
  }

  function getRunwayQueue() {
    return runwayQueue;
  }

  /**
   * 从队列尾部开始寻找节点
   * @param effectType 特效类型
   */
  function getQueueItemByEnd(effectType: MessageEffectType, targetId: unknown) {
    for (let i = runwayQueue.value.length - 1; i >= 0; i--) {
      const item = runwayQueue.value[i];
      if (item.effectType === effectType && targetId === item.targetId) {
        return {
          index: i,
          item,
        };
      }
    }
  }

  /** 当前显示的列表 */
  const currentData = computed<MessageEffectData | undefined>(() => {
    return runwayQueue.value[0];
  });

  /** 隐藏时间，毫秒级别 */
  let visibleTime = 3000;

  function setVisibleTime(time: number) {
    visibleTime = time;
  }

  /** 隐藏定时器 */
  let hideTimer: number | undefined;

  /** 设置隐藏定时器 */
  function setHideTimer() {
    if (hideTimer) {
      return;
    }
    clearHideTimer();
    hideTimer = window.setTimeout(() => {
      runwayQueue.value.splice(0, 1);
      clearHideTimer();
    }, visibleTime);
  }
  /** 清空隐藏定时器 */
  function clearHideTimer() {
    clearTimeout(hideTimer);
    hideTimer = undefined;
  }

  watchEffect(() => {
    if (currentData.value) {
      setHideTimer();
    } else {
      clearHideTimer();
    }
  });

  onBeforeUnmount(() => {
    clearHideTimer();
  });

  return {
    currentData,
    onAfterLeave,
    pushQueue,
    wrapVisible,
  };
};
