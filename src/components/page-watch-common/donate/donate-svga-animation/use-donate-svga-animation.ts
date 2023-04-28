/**
 * @file 打赏 svga 特效 hook
 */
import { DEFAULT_SVGA_DIRECTORY } from '@/assets/constants/defaults';
import { useSvgaPlayer } from '@/hooks/animation/use-svga-player';
import { getWatchCore } from '@/core/watch-sdk';
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

const svgaMap: UniversalParams<string> = {
  coffee: 'coffee.svga',
  like: 'like.svga',
  handclap: 'handclap.svga',
  666: '666.svga',
  star: 'star.svga',
  diamond: 'diamond.svga',
  car: 'car.svga',
  rocket: 'rocket.svga',
  bear: 'bear.svga',
  crown: 'crown.svga',
  cup: 'cup.svga',
  microphone: 'microphone.svga',
  villa: 'villa.svga',
  house: 'villa.svga', // 旧版的house图匹配新版的别墅动画
};

export const useDonateSvgaAnimation = () => {
  const donateStore = useDonateStore();
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

    // 如果没有则截取图片文件名来获取默认的 svga 文件
    const a = document.createElement('a');
    a.href = gimg;
    const paths = a.pathname.split('/');
    const goodName = paths[paths.length - 1].split('.')[0];
    if (!svgaMap[goodName]) {
      return undefined;
    }

    return DEFAULT_SVGA_DIRECTORY + svgaMap[goodName];
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

    const isSelfGood = chatMsg.isSelf;
    const pushInQueue = canPushInQueue(chatMsg);

    if (!pushInQueue) {
      return;
    }

    // 如果是自己的打赏则优先显示
    const svgaUrl = getSvgaUrl(chatMsg.gimg);
    pushAnimationQueue(svgaUrl || chatMsg.gimg, isSelfGood);
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
