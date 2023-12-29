import { getWatchCore } from '@/core/watch-sdk';
import { PlayStatus, SubtitleEvents } from '@polyv/live-watch-sdk';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { usePlayerStore } from '@/store/use-player-store';
import { eventBus, appEvents } from '@/app/app-events';

export function bindSubtitleEvents() {
  const watchCore = getWatchCore();
  const subtitleStore = useSubtitleStore();
  const playerStore = usePlayerStore();

  watchCore.subtitles.eventEmitter.on(SubtitleEvents.SubtitleSetuped, () => {
    subtitleStore.$patch({
      subtitleModuleSetuped: true,
    });
    subtitleStore.syncSubtitleConfig();
  });

  watchCore.subtitles.eventEmitter.on(SubtitleEvents.SubtitleEnableToggle, ({ enable }) => {
    subtitleStore.changeSubtitlesTeacherEnable(enable);
  });

  watchCore.subtitles.eventEmitter.on(SubtitleEvents.SubtitleRealTimeCC, data => {
    if (playerStore.playStatus === PlayStatus.Playing) {
      eventBus.$emit(appEvents.player.SubtitleRealTimeCC, data);
    }
  });
}
