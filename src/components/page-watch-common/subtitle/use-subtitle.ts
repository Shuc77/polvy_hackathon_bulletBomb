import cloneDeep from 'lodash-es/cloneDeep';
import { onBeforeUnmount, onMounted, ref, set, nextTick, Ref, computed, watch } from 'vue';

import { getWatchCore } from '@/core/watch-sdk';
import {
  SubtitleRealTimeCC,
  SubtitleTranslate,
  SubtitleEvents,
  SubtitlesListItem,
  SubtitleSliceType,
  SubtitleSourceTranslateLanguage,
} from '@polyv/live-watch-sdk';

import { translate } from '@/assets/lang';
import { TAB_NAME_SUBTITLE } from '@/assets/constants/tab-name';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { SubtitleSelectOptionItem } from './mobile-subtitle-select/use-subtitle-select';

/**
 * 实时字幕列表 hook
 * @hook
 */
export const useSubtitle = (subtitleScroll: Ref<HTMLElement | undefined>) => {
  const subtitleStore = useSubtitleStore();
  const {
    liveSubtitleSourceLanguage,
    liveSubtitleSourceTranslateLanguage,

    liveSubtitleSourceTranslateLanguageOptions,
    liveSubtitleSourceLanguageOptions,
    subtitleDisplayNumber,
    subtitleDisplayNumberLimitEnabled,
  } = storeDefinitionToRefs(useSubtitleStore);

  /** 用户选择的翻译的类型 */
  const subtitleTranslateSelected = ref<
    ['all' | 'source' | 'translate', SubtitleSourceTranslateLanguage | undefined]
  >(['all', liveSubtitleSourceTranslateLanguage.value]);

  watch(subtitleTranslateSelected, () => {
    const [type, lang] = subtitleTranslateSelected.value;
    if (type !== 'source' && lang && lang !== liveSubtitleSourceTranslateLanguage.value) {
      subtitleStore.changeLiveSubtitleSourceTranslateLanguage(lang);
    }
  });

  /** 可以选择的翻译选项 */
  const subtitleTranslateOptions = computed<SubtitleSelectOptionItem[]>(() => {
    return [
      {
        label: translate('subtitle.all'),
        value: 'all',
        children: liveSubtitleSourceTranslateLanguageOptions.value,
      },
      {
        label: translate('subtitle.source'),
        value: 'source',
        children: liveSubtitleSourceLanguageOptions.value,
      },
      {
        label: translate('subtitle.translate'),
        value: 'translate',
        children: liveSubtitleSourceTranslateLanguageOptions.value,
      },
    ];
  });

  /** 临时的实时字幕 */
  const currentSubtitle = ref('');

  /** 所有的字幕历史 */
  const subtitleList = ref<SubtitlesListItem[]>([]);

  const isBottom = ref(true);

  const hasNewMessage = ref(false);

  watch(
    () => isBottom.value,
    val => {
      if (val) {
        hasNewMessage.value = false;
      }
    },
  );

  function addSubtitleListener() {
    if (!subtitleScroll.value) return;

    subtitleScroll.value.addEventListener('scroll', e => {
      const el = e.target as HTMLElement;
      const scrollEl = el.querySelector('.c-subtitle__scroll');
      if (scrollEl && scrollEl.clientHeight < el.offsetHeight) return;
      isBottom.value = el.scrollHeight - el.offsetHeight - el.scrollTop <= 70;
    });
  }

  function scrollToBottom(check = true) {
    if (!isBottom.value && check) return;
    // 变成异步任务，先让eventListener检查
    setTimeout(() => {
      if (!subtitleScroll.value) return;
      subtitleScroll.value.scrollTo(0, subtitleScroll.value.scrollHeight);
    }, 0);
  }

  function firstToSubtitle() {
    scrollToBottom(false);
    addSubtitleListener();
  }

  function spliceSubtitle() {
    let value = subtitleDisplayNumber.value;
    if (!subtitleDisplayNumberLimitEnabled.value || value < 1) return;
    if (currentSubtitle.value) {
      value++;
    }
    const num = subtitleList.value.length - value;
    if (num > 0) {
      subtitleList.value.splice(0, num);
    }
  }

  const { pcAsideTabCurrentName } = storeDefinitionToRefs(useLayoutStore);

  const { mobileMenuCurrentName } = storeDefinitionToRefs(useLayoutStore);

  const isScrollToBottom = ref(false);

  watch(
    () => pcAsideTabCurrentName.value,
    val => {
      if (!isScrollToBottom.value && val === TAB_NAME_SUBTITLE) {
        firstToSubtitle();
        isScrollToBottom.value = true;
      }
    },
  );

  watch(
    () => mobileMenuCurrentName.value,
    val => {
      if (!isScrollToBottom.value && val === TAB_NAME_SUBTITLE) {
        firstToSubtitle();
        isScrollToBottom.value = true;
      }
    },
  );

  function getSubtitleList() {
    const watchCore = getWatchCore();
    subtitleList.value = cloneDeep(watchCore.subtitles.getSubtitlesList());
    spliceSubtitle();
  }

  function onSubtitleRealTimeCC(data: SubtitleRealTimeCC) {
    if (data.sliceType === SubtitleSliceType.End) {
      currentSubtitle.value = '';
      const params: SubtitlesListItem = {
        index: data.index,
        [liveSubtitleSourceLanguage.value]: data.text,
      };
      subtitleList.value.push(params);
      spliceSubtitle();
    } else {
      currentSubtitle.value = data.text;
    }
    scrollToBottom();

    if (!isBottom.value) hasNewMessage.value = true;
  }

  function onSubtitleTranslate(data: SubtitleTranslate) {
    const index = subtitleList.value.findIndex(item => item.index === data.index);
    if (index >= 0) {
      set(subtitleList.value[index], data.language, data.result);
      scrollToBottom();
    }
  }

  function onResetSubtitleList() {
    subtitleList.value = [];
    isBottom.value = true;
  }

  function onSubtitleListForceSync() {
    getSubtitleList();
    scrollToBottom();
  }

  function bindSubtitleEvent() {
    const watchCore = getWatchCore();

    watchCore.subtitles.eventEmitter.on(SubtitleEvents.SubtitleRealTimeCC, onSubtitleRealTimeCC);
    watchCore.subtitles.eventEmitter.on(SubtitleEvents.SubtitleTranslate, onSubtitleTranslate);
    watchCore.subtitles.eventEmitter.on(SubtitleEvents.SubtitleListReset, onResetSubtitleList);
    watchCore.subtitles.eventEmitter.on(
      SubtitleEvents.SubtitleListForceSync,
      onSubtitleListForceSync,
    );
  }

  function unbindSubtitleEvent() {
    const watchCore = getWatchCore();

    watchCore.subtitles.eventEmitter.off(SubtitleEvents.SubtitleRealTimeCC, onSubtitleRealTimeCC);
    watchCore.subtitles.eventEmitter.off(SubtitleEvents.SubtitleTranslate, onSubtitleTranslate);
    watchCore.subtitles.eventEmitter.off(SubtitleEvents.SubtitleListReset, onResetSubtitleList);
    watchCore.subtitles.eventEmitter.off(
      SubtitleEvents.SubtitleListForceSync,
      onSubtitleListForceSync,
    );
  }

  onMounted(() => {
    const watchCore = getWatchCore();
    // eslint-disable-next-line promise/prefer-await-to-then
    watchCore.subtitles.initSubtitleList().finally(() => {
      bindSubtitleEvent();
      getSubtitleList();
      nextTick(() => {
        subtitleScroll.value?.scrollTo({
          top: subtitleScroll.value.offsetHeight,
        });
      });
    });
  });

  onBeforeUnmount(() => {
    unbindSubtitleEvent();
  });

  return {
    hasNewMessage,
    scrollToBottom,

    subtitleTranslateSelected,
    subtitleTranslateOptions,

    subtitleList,
    currentSubtitle,
  };
};
