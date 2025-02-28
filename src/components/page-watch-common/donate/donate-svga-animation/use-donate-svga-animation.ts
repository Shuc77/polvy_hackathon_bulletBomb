/**
 * @file 打赏 svga 特效 hook
 */
import { useSvgaPlayer } from '@/hooks/animation/use-svga-player';
import { useDonateStore } from '@/store/use-donate-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import {
  ChatEvents,
  ChatMsgRewardType,
  ChatMsgSource,
  ChatMsgType,
  DonateType,
} from '@polyv/live-watch-sdk';
import { onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';
import { useGlobalInject } from '@/app/use-global-inject';

export const useDonateSvgaAnimation = () => {
  const { getWatchCore } = useGlobalInject();

  const donateStore = useDonateStore();
  const watchCore = getWatchCore();
  const { isGoOnRedpackRain } = storeDefinitionToRefs(useInteractReceiveStore);

  /** 用于渲染动画的 ref 节点 */
  const donateRef = ref<HTMLDivElement>();

  const { animationQueue, pushAnimationQueue, pauseAnimationQueue, startAnimationQueue } =
    useSvgaPlayer(donateRef);

  /** 根据打赏图片地址获取 svga 地址 */
  function getSvgaUrl(gimg: string): string | undefined {
    // 如果后台有上传 svga 特效文件，则优先使用后台配置
    const goodInfo = donateStore.findDonateGoodByImg(gimg);
    if (goodInfo && goodInfo.dynamicFile) {
      return goodInfo.dynamicFile;
    }

    return watchCore.donate.getDonateSvgaUrl(gimg);
  }

  // 如果正在显示红包雨不显示打赏特效
  watch(
    () => unref(isGoOnRedpackRain),
    () => {
      if (unref(isGoOnRedpackRain)) {
        pauseAnimationQueue();
      } else {
        startAnimationQueue();
      }
    },
  );

  function canPushInQueue(chatMsg: ChatMsgRewardType): boolean {
    const isSelfGood = chatMsg.isSelf;
    const isPayGood = !chatMsg.isFree;

    // 自己打赏的必须插入，只处理本地插入的
    if (isSelfGood) {
      return !!chatMsg.isLocal;
    }

    // 屏蔽了其他人的打赏动画
    if (!donateStore.donateAnimationVisible) {
      return false;
    }

    return isPayGood || unref(animationQueue).length < 100;
  }

  /** 处理打赏消息 */
  function onChatMsgEvent(evt: { chatMsg: ChatMsgType }) {
    const chatMsg = evt.chatMsg;
    // 非打赏消息
    if (chatMsg.msgSource !== ChatMsgSource.Reward) {
      return;
    }

    // 非道具打赏
    if (chatMsg.donateType !== DonateType.Good) {
      return;
    }

    const pushInQueue = canPushInQueue(chatMsg);
    if (!pushInQueue) {
      return;
    }

    const isSelfGood = chatMsg.isSelf;
    const svgaUrl = getSvgaUrl(chatMsg.gimg);
    pushAnimationQueue(svgaUrl || chatMsg.gimg, isSelfGood, undefined, true);
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
    donateRef,
  };
};
