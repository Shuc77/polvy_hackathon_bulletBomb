import { translate } from '@/assets/lang';
import { getWatchCore } from '@/core/watch-sdk';
import { ChatEvents, ChatMsgReplayStatus } from '@polyv/live-watch-sdk';
import { computed, onBeforeMount, ref } from 'vue';

export const useChatMsgReplayTips = () => {
  const watchCore = getWatchCore();

  const replayTipStatus = ref<ChatMsgReplayStatus>();

  const content = computed(() =>
    replayTipStatus.value === ChatMsgReplayStatus.Wait
      ? translate('chat.msg.replay.tips.wait')
      : translate('chat.msg.replay.tips.ing'),
  );

  onBeforeMount(() => {
    watchCore.chat.eventEmitter.on(ChatEvents.ChatMsgReplayStatusChange, ({ status }) => {
      replayTipStatus.value = status;
      if (status !== ChatMsgReplayStatus.Wait && status !== ChatMsgReplayStatus.InitSuccess) {
        console.error('useChatMsgReplayTips', status);
      }
    });
  });

  return {
    content,
  };
};
