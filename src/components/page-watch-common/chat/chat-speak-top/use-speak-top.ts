import { ref, onMounted, watch, onBeforeUnmount, Ref } from 'vue';
import {
  ChatEvents,
  ChatMsgSpeakTopType,
  LiveStatus,
  SliceIdSpeakTop,
} from '@polyv/live-watch-sdk';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useChannelStore } from '@/store/use-channel-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useGlobalInject } from '@/app/use-global-inject';

export function useSpeakTop() {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();
  const { liveStatus, currentSessionId } = storeDefinitionToRefs(useChannelStore);

  const playbackStore = usePlaybackStore();

  const messageList: Ref<SliceIdSpeakTop[]> = ref([]);

  const showSpeakTop = ref(false);

  const handleSpeakToTop = (data: ChatMsgSpeakTopType) => {
    // 回放ppt，可能会触发 onSliceId, 导致播放前会有一条上墙数据。这里过滤掉播放前的上墙数据
    if (playbackStore.chatMsgReplayEnabled && watchCore.player.getCurrentTime() < 0.1) {
      return;
    }

    messageList.value = [data, ...(data.others || [])].map(item => {
      item.content = watchCore.chat.parseSpeakContent(item.content, {
        parseEmotion: true,
        parseLink: true,
      });
      return item;
    });
    showSpeakTop.value = true;
  };

  const handleSpeakCancelTop = (data?: { id: string }) => {
    if (!data || !data.id) {
      messageList.value = [];
    } else {
      const index = messageList.value.findIndex(item => item.id === data.id);
      if (index !== -1) {
        messageList.value.splice(index, 1);
      }
    }
    if (messageList.value.length === 0) {
      showSpeakTop.value = false;
    }
  };

  watch(liveStatus, () => {
    if ([LiveStatus.End, LiveStatus.Live].includes(liveStatus.value)) {
      handleSpeakCancelTop();
      watchCore.chat.cancelSpeakTop();
    }
  });

  // 场次id变化时也去掉评论上墙
  watch(currentSessionId, () => {
    handleSpeakCancelTop();
    watchCore.chat.cancelSpeakTop();
  });

  onMounted(() => {
    watchCore.chat.eventEmitter.on(ChatEvents.SpeakToTop, handleSpeakToTop);
    watchCore.chat.eventEmitter.on(ChatEvents.SpeakCancelTop, handleSpeakCancelTop);

    const data = watchCore.chat.getSpeakTopInfo();
    if (data) {
      handleSpeakToTop(data);
    }
  });

  onBeforeUnmount(() => {
    watchCore.chat.eventEmitter.off(ChatEvents.SpeakToTop, handleSpeakToTop);
    watchCore.chat.eventEmitter.off(ChatEvents.SpeakCancelTop, handleSpeakCancelTop);
  });

  return {
    showSpeakTop,
    messageList,
  };
}
