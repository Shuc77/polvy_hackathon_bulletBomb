<!-- @file 回放字幕 -->
<template>
  <div
    v-if="mainText || translatedText"
    class="c-player-replay-subtitle"
    :style="{
      bottom: `${bottom}px`,
      fontSize: `${fontsize}`,
    }"
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
  YN,
} from '@polyv/live-watch-sdk';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { ynToBool } from '@utils-ts/boolean';
import { useSubtitleProps, usePlayerSubtitle } from '../_hooks/_use-player-subtitle';
import { useGlobalInject } from '@/app/use-global-inject';

const { getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();

const subtitleStore = useSubtitleStore();

const { mainReplaySubtitleShow, subReplaySubtitleShow, replaySubtitleList } =
  storeDefinitionToRefs(useSubtitleStore);

const props = defineProps(useSubtitleProps());
const {
  fontsize,

  init,
  destroy,
} = usePlayerSubtitle({ props });

// 主字幕集合
const mainSrtList = ref<SubtitleParsedItem[]>([]);

// 翻译字幕集合
const translatedSrtListMap = ref<{ [langId: string]: SubtitleParsedItem[] }>({});

// 主字幕-单行
const mainText = ref('');

// 翻译字幕-单行
const translatedText = ref('');

const timeBetween = 1000;

/** 设置回放字幕集合 */
const setReplaySrtList = async (subtitleItem: ReplaySubtitleItem) => {
  if (!subtitleItem.srtUrl) return;

  const originSubtitleContent = await watchCore.subtitle.getReplaySubtitleContent(
    subtitleItem.srtUrl,
  );
  const parsedSubtitleList = watchCore.subtitle.parseReplaySubtitleContent(originSubtitleContent);

  const tempSrtList = parsedSubtitleList.map(item => {
    return {
      start: item.start / timeBetween,
      end: item.end / timeBetween,
      text: item.text,
      index: item.index,
    };
  });

  if (ynToBool(subtitleItem.isOriginal)) {
    mainSrtList.value = tempSrtList;
    subtitleStore.changeMainReplaySubtitleShow(true);
  } else {
    translatedSrtListMap.value[subtitleItem.id] = tempSrtList;
    subtitleStore.changeSubReplaySubtitleShow(true);
  }
};

const setReplaySubtitleList = (list: ReplaySubtitleItem[]) => {
  watchCore.subtitle.setReplaySubtitleList(list);
};

watch(
  () => replaySubtitleList.value,
  () => {
    subtitleStore.changeMainReplaySubtitleShow(false);
    subtitleStore.changeSubReplaySubtitleShow(false);

    if (!replaySubtitleList.value.length) return;

    setReplaySubtitleList(replaySubtitleList.value);
    replaySubtitleList.value.forEach(item => {
      setReplaySrtList(item);
    });

    const firstTranslateLang = replaySubtitleList.value.find(item => item.isOriginal !== YN.Y);
    if (firstTranslateLang) {
      subtitleStore.$patch({
        curSelectedReplaySubtitleItemId: String(firstTranslateLang.id),
      });
    }
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
    subtitleStore.changeMainReplaySubtitleShow(data.checked);
  } else {
    subtitleStore.changeSubReplaySubtitleShow(data.checked);
  }
};

/** 播放器时间更新 */
const onPlayerTimeUpdate = (params: PlayerEventsRelations[PlayerEvents.TimeUpdate]) => {
  mainText.value = getDisplayTextByTime(mainSrtList.value, params.currentTime);

  const curTranslateSrtList =
    translatedSrtListMap.value[subtitleStore.curSelectedReplaySubtitleItemId];
  if (curTranslateSrtList) {
    translatedText.value = getDisplayTextByTime(curTranslateSrtList, params.currentTime);
  }
};

const bindPlayerEvents = () => {
  watchCore.player.eventEmitter.on(
    PlayerEvents.PlayerUIReplaySubtitleChecked,
    onPlayerUIReplaySubtitleChecked,
  );
  watchCore.player.eventEmitter.on(PlayerEvents.TimeUpdate, onPlayerTimeUpdate);
};

const unbindPlayerEvent = () => {
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
  left: 50%;
  z-index: 7;
  box-sizing: border-box;
  width: max-content;
  max-width: 90%;
  padding: 8px 20px;
  line-height: 1.5;
  color: #fff;
  text-align: left;
  background-color: rgba(29, 33, 41, 0.8);
  border-radius: 12px;
  transform: translateX(-50%);

  .c-player-replay-subtitle-line {
    text-align: center;
  }
}
</style>
