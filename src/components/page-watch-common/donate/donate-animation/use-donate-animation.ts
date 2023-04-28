import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { getWatchCore } from '@/core/watch-sdk';
import { useDonateStore } from '@/store/use-donate-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import {
  ChatEvents,
  ChatMsgRewardType,
  ChatMsgSource,
  ChatMsgType,
  DonateType,
} from '@polyv/live-watch-sdk';
import { uuidV4 } from '@utils-ts/string';
import { onBeforeUnmount, onMounted, ref, unref } from 'vue';

/** 打赏动画轨道节点 */
export interface AnimationTrackItem {
  /** 动画 id */
  animationId: string;
  /** 昵称 */
  nick: string;
  /** 礼物道具图片 */
  gimg: string;
  /** 礼物数量 */
  count: number;
  /** 打赏内容 */
  rewardContent: string;
  /** 打赏类型 */
  donateType: DonateType;
}

export const donateAnimationProps = () => ({
  /** 动画轨道数 */
  trackCount: PropUtils.number.def(3),
});

export const useDonateAnimation = (options: { props: VueProps<typeof donateAnimationProps> }) => {
  const interactReceiveStore = useInteractReceiveStore();
  const donateStore = useDonateStore();

  const { props } = options;

  /** 节点高度（高度+距离） */
  const itemHeight = 40 + 32;

  /** 动画轨道列表 */
  const trackList = ref<AnimationTrackItem[]>([]);

  /** 等待队列 */
  const waitQueue: ChatMsgRewardType[] = [];

  /** 检查动画轨道 */
  function checkAnimationTrack() {
    if (!waitQueue.length || interactReceiveStore.isGoOnRedpackRain) {
      return;
    }

    if (unref(trackList).length < props.trackCount) {
      // 有空位，则补充空位
      const surplusCount = props.trackCount - unref(trackList).length;
      const pushList = waitQueue.splice(0, surplusCount);

      pushList.forEach(chatMsg => {
        trackList.value.push({
          animationId: uuidV4(),
          nick: chatMsg.user.nick,
          gimg: chatMsg.gimg,
          count: chatMsg.goodNum ?? 1,
          rewardContent: chatMsg.rewardContent,
          donateType: chatMsg.donateType,
        });
      });
    }
  }

  /**
   * 处理节点离开完毕
   * @param animationId 动画 id
   */
  function onItemLeaved(animationId: string) {
    const index = trackList.value.findIndex(item => item.animationId === animationId);
    if (index !== -1) {
      trackList.value.splice(index, 1);
      checkAnimationTrack();
    }
  }

  /**
   * 打赏道具是否可以插入到队列中
   */
  function canPushInQueue(chatMsg: ChatMsgRewardType) {
    const isSelfGood = chatMsg.isSelf;
    const isPayGood = !chatMsg.isFree;

    // 自己打赏的必须插入
    if (isSelfGood) {
      return true;
    }

    // 屏蔽了其他人的打赏动画
    if (!donateStore.donateAnimationVisible) {
      return false;
    }

    return isPayGood || waitQueue.length < 100;
  }

  /** 处理聊天室消息 */
  function onChatMsgEvent(evt: { chatMsg: ChatMsgType }) {
    const chatMsg = evt.chatMsg;
    // 非打赏消息
    if (chatMsg.msgSource !== ChatMsgSource.Reward) {
      return;
    }

    /** 是否需要插入到队列中 */
    const pushInQueue = canPushInQueue(chatMsg);
    const isSelfGood = chatMsg.isSelf;

    if (!pushInQueue) {
      return;
    }

    if (isSelfGood) {
      // 如果是自己的打赏则优先显示
      waitQueue.unshift(chatMsg);
    } else {
      waitQueue.push(chatMsg);
    }
    checkAnimationTrack();
  }

  onMounted(() => {
    const watchCore = getWatchCore();
    watchCore.chat.eventEmitter.on(ChatEvents.ChatMessage, onChatMsgEvent);
  });

  onBeforeUnmount(() => {
    const watchCore = getWatchCore();
    watchCore.chat.eventEmitter.off(ChatEvents.ChatMessage, onChatMsgEvent);
  });

  return {
    trackList,
    itemHeight,
    onItemLeaved,
  };
};
