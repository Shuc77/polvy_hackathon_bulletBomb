import { getWatchCore } from '@/core/watch-sdk';
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { ChatEvents, ChatMsgSpeakTopType, LiveStatus } from '@polyv/live-watch-sdk';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useChannelStore } from '@/store/use-channel-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

export function useSpeakTop() {
  const watchCore = getWatchCore();
  const { liveStatus, currentSessionId } = storeDefinitionToRefs(useChannelStore);

  const playbackStore = usePlaybackStore();

  const content = ref('');
  const user = ref({
    nick: '',
    pic: '',
  });
  const showSpeakTop = ref(false);

  const handleSpeakToTop = (data: ChatMsgSpeakTopType) => {
    // 回放ppt，可能会触发 onSliceId, 导致播放前会有一条上墙数据。这里过滤掉播放前的上墙数据
    if (playbackStore.chatReplayEnabled && watchCore.player.getCurrentTime() < 0.1) {
      return;
    }

    content.value = watchCore.chat.parseSpeakContent(data.content, {
      parseEmotion: true,
      parseLink: true,
    });
    user.value.nick = data.nick;
    user.value.pic = data.pic;
    showSpeakTop.value = true;
  };

  const handleSpeakCancelTop = () => {
    content.value = '';
    user.value.nick = '';
    user.value.pic = '';
    showSpeakTop.value = false;
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
    content,
    user,
    showSpeakTop,
  };
}
