<!-- @file 回放字幕 -->
<template>
  <div
    class="c-player-replay-subtitle"
    :style="`bottom: ${bottom}px`"
  >
    <p
      v-show="mainReplaySubtitleShow"
      class="c-player-replay-subtitle-line"
    >
      {{ mainText }}
    </p>
    <p
      v-show="subReplaySubtitleShow"
      class="c-player-replay-subtitle-line"
    >
      {{ translatedText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, watch } from 'vue';
import {
  PlayerEvents,
  PlayerEventsRelations,
  ReplaySubtitleItem,
  SubtitleParsedItem,
} from '@polyv/live-watch-sdk';

import { getWatchCore } from '@/core/watch-sdk';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { ynToBool } from '@polyv/utils/es/boolean';
import { useSubtitleProps, usePlayerSubtitle } from '../_hooks/_use-player-subtitle';

const subtitleStore = useSubtitleStore();

const { mainReplaySubtitleShow, subReplaySubtitleShow } = storeDefinitionToRefs(useSubtitleStore);
const { replaySubtitleList } = storeDefinitionToRefs(usePlaybackStore);

const props = defineProps(useSubtitleProps());
const {
  fontsize,

  init,
  destroy,
} = usePlayerSubtitle({ props });

// 主字幕集合
const mainSrtList = ref<SubtitleParsedItem[]>([]);

// 翻译字幕集合
const translatedSrtList = ref<SubtitleParsedItem[]>([]);

// 主字幕-单行
const mainText = ref('');

// 翻译字幕-单行
const translatedText = ref('');

const timeBetween = 1000;

/** 设置回放字幕集合 */
const setReplaySrtList = async (isOriginal: 'Y' | 'N', url?: string) => {
  if (!url) return;

  const watchCore = getWatchCore();
  const originSubtitleContent = await watchCore.subtitles.getReplaySubtitleContent(url);
  const parsedSubtitleList = watchCore.subtitles.parseReplaySubtitleContent(originSubtitleContent);

  const tempSrtList = parsedSubtitleList.map(item => {
    return {
      start: item.start / timeBetween,
      end: item.end / timeBetween,
      text: item.text,
      index: item.index,
    };
  });

  if (ynToBool(isOriginal)) {
    mainSrtList.value = tempSrtList;
    subtitleStore.changeMainSubtitleShow(true);
  } else {
    translatedSrtList.value = tempSrtList;
    subtitleStore.changeSubSubtitleShow(true);
  }
};

const setReplaySubtitleList = (list: ReplaySubtitleItem[]) => {
  const watchCore = getWatchCore();
  watchCore.subtitles.setReplaySubtitleList(list);
};

watch(
  () => replaySubtitleList.value,
  () => {
    subtitleStore.changeMainSubtitleShow(false);
    subtitleStore.changeSubSubtitleShow(false);

    if (!replaySubtitleList.value.length) return;

    setReplaySubtitleList(replaySubtitleList.value);

    replaySubtitleList.value.forEach(item => {
      setReplaySrtList(item.isOriginal, item.srtUrl);
    });
  },
  {
    immediate: true,
  },
);

const getDisplayTextByTime = (srtList: SubtitleParsedItem[], time: number) => {
  if (!srtList.length) return '';
  const index = srtList.findIndex(item => {
    return time >= item.start && time <= item.end;
  });
  return index > -1 ? srtList[index].text : '';
};

const onPlayerUIReplaySubtitleChecked = (
  data: PlayerEventsRelations[PlayerEvents.PlayerUIReplaySubtitleChecked],
) => {
  if (ynToBool(data.isOriginal)) {
    subtitleStore.changeMainSubtitleShow(data.checked);
  } else {
    subtitleStore.changeSubSubtitleShow(data.checked);
  }
};

/** 播放器时间更新 */
const onPlayerTimeUpdate = (params: PlayerEventsRelations[PlayerEvents.TimeUpdate]) => {
  mainText.value = getDisplayTextByTime(mainSrtList.value, params.currentTime);
  translatedText.value = getDisplayTextByTime(translatedSrtList.value, params.currentTime);
};

const bindPlayerEvents = () => {
  const watchCore = getWatchCore();
  watchCore.player.eventEmitter.on(
    PlayerEvents.PlayerUIReplaySubtitleChecked,
    onPlayerUIReplaySubtitleChecked,
  );
  watchCore.player.eventEmitter.on(PlayerEvents.TimeUpdate, onPlayerTimeUpdate);
};

const unbindPlayerEvent = () => {
  const watchCore = getWatchCore();
  watchCore.player.eventEmitter.off(
    PlayerEvents.PlayerUIReplaySubtitleChecked,
    onPlayerUIReplaySubtitleChecked,
  );
  watchCore.player.eventEmitter.off(PlayerEvents.TimeUpdate, onPlayerTimeUpdate);
};

onMounted(async () => {
  init();
  bindPlayerEvents();
});

onBeforeUnmount(() => {
  setReplaySubtitleList([]);
  unbindPlayerEvent();
  destroy();
});
</script>

<style lang="scss">
.c-player-replay-subtitle {
  position: absolute;
  bottom: 150px;
  left: 10%;
  z-index: 9;
  width: 80%;
  font-size: v-bind(fontsize);
  line-height: 1.5;
  color: #fff;
  text-align: left;
  // prettier-ignore
  text-shadow: rgb(0, 0, 0) 1px 0 1px,
    rgb(0, 0, 0) 0 1px 1px,
    rgb(0, 0, 0) 0 -1px 1px,
    rgb(0, 0, 0) -1px 0 1px;

  .c-player-replay-subtitle-line {
    text-align: center;
  }
}
</style>
