/**
 * @file 直播术语字幕
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import {
  PlayerEvents,
  PlayerEventsRelations,
  PlayStatus,
  PolyvWatchCore,
  SubtitleConfig,
  SubtitlesListItem,
  SubtitleEvents,
  SubtitleRealTimeCC,
  SubtitleSliceType,
  SubtitleTranslate,
} from '@polyv/live-watch-sdk';
import { useGlobalInject } from '@/app/use-global-inject';
import { usePlayerStore } from '@/store/use-player-store';
import { findTimelineItem } from '@/core/term/timeline';
import { TermTrack } from '@/core/term/term-matcher';
import { isTermDemoEnabled } from '@/core/term/term-options';
import { publishSubtitleTermCue } from '@/live-buddy/term-sync';
import { useTermCard } from './use-term-card';
import { useTermMatcher } from './use-term-matcher';

const DEMO_INTERVAL_MS = 6000;
/** 直播期间 SDK 可能不触发 TimeUpdate，使用本地时钟兜底 */
const LIVE_TICK_MS = 500;
/** 增量同步 SDK 字幕列表的间隔，避免每 500ms 重复处理整份列表 */
const SDK_LIST_SYNC_MS = 1000;
/** 历史字幕兜底轮询间隔，防止实时 WebSocket 事件漏发导致只能刷新才更新 */
const SUBTITLE_HISTORY_POLL_MS = 1000;
const SUBTITLE_HISTORY_INITIAL_SIZE = 100;
const SUBTITLE_HISTORY_POLL_SIZE = 20;
const LOG_PREFIX = '[term-subtitle]';
/** 距离直播边缘多少秒内视为实时观看 */
const LIVE_EDGE_TOLERANCE = 5;
/** 时移匹配时允许的字幕尾部误差 */
const TIMELINE_MATCH_TOLERANCE = 1;
/** 只保留最近一小时的字幕时间轴 */
const LIVE_TIMELINE_RETENTION = 60 * 60;
const MAX_LIVE_TIMELINE = 2000;

interface DemoItem {
  source: string;
  translation: string;
}

interface LiveSubtitleItem {
  index: number;
  start: number;
  end: number;
  source: string;
  translation: string;
}

interface SubtitleHistoryResponse {
  list?: SubtitlesListItem[];
  total?: number;
}

interface SubtitleHistoryProvider {
  __getSubtitlesHistory?: (options: {
    index?: number;
    size?: number;
    order?: number;
  }) => Promise<SubtitleHistoryResponse>;
}

const DEMO_SENTENCES: Record<TermTrack, DemoItem[]> = {
  medical: [
    {
      source: '今天我们重点讨论 PD-1 抑制剂在非小细胞肺癌中的临床试验结果。',
      translation:
        'Today we will focus on the clinical trial results of PD-1 inhibitors in non-small cell lung cancer.',
    },
    {
      source: '影像学上，CT扫描和MRI可以帮助评估肿瘤负荷以及生物标志物变化。',
      translation: 'CT scans and MRI can help evaluate tumor burden and changes in biomarkers.',
    },
    {
      source: '接下来会介绍免疫治疗与靶向治疗的联合策略。',
      translation:
        'Next, we will discuss combination strategies of immunotherapy and targeted therapy.',
    },
    {
      source: '患者因 CHD 入院，同时存在高尿酸血症和痛风风险。',
      translation: 'The patient was admitted for CHD, with risks of hyperuricemia and gout.',
    },
  ],
  trade: [
    {
      source: '本次货物采用 FOB 条款，并通过 L/C 完成结算。',
      translation: 'This shipment uses FOB terms and is settled through an L/C.',
    },
    {
      source: '报关时需要准备提单、原产地证以及相关关税资料。',
      translation:
        'Customs declaration requires the B/L, Certificate of Origin and related tariff documents.',
    },
    {
      source: 'Incoterms 会明确买卖双方在运输和保险上的责任。',
      translation:
        'Incoterms clarify the responsibilities of buyers and sellers for transport and insurance.',
    },
  ],
  workplace: [
    {
      source: '这次复盘主要看 KPI 和 OKR 是否对齐，以及项目是否形成闭环。',
      translation:
        'This review focuses on whether KPI and OKR are aligned and whether the project forms a closed loop.',
    },
    {
      source: '我们需要提升执行颗粒度，并明确每个阶段的 ROI。',
      translation: 'We need to improve execution granularity and clarify the ROI of each stage.',
    },
    {
      source: '先对齐目标，再拆解抓手，最后通过复盘验证效果。',
      translation:
        'First align on goals, then break down the levers, and finally validate through a review.',
    },
  ],
};

/**
 * 估算一句话的展示时长，用于补全进入直播间时拿到的最近字幕。
 * SDK 的 getSubtitlesList 不保证携带绝对时间，只能按文本长度近似。
 */
function estimateSubtitleDuration(text: string) {
  const cjkCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const otherCount = Math.max(0, text.length - cjkCount);
  return Math.min(8, Math.max(2, cjkCount * 0.22 + otherCount * 0.06));
}

export const useTermSubtitle = () => {
  const { getWatchCore } = useGlobalInject();
  const playerStore = usePlayerStore();

  let watchCore: PolyvWatchCore | undefined;
  let sdkEventsBound = false;
  let playerEventsBound = false;
  let mounted = false;

  function resolveWatchCore() {
    if (watchCore) return watchCore;

    try {
      watchCore = getWatchCore();
    } catch (error) {
      console.warn('[term] watchCore is not ready', error);
    }

    return watchCore;
  }

  const { track, segmentsOf, segmentsOfText } = useTermMatcher();
  const selectedTrack = ref<TermTrack>(track);
  const isDemoMode = ref(isTermDemoEnabled());

  const sourceText = ref('');
  const translationText = ref('');
  const currentIndex = ref(-1);
  const subtitleVisible = ref(false);

  const sourceSegments = segmentsOf(sourceText);
  const translationSegments = segmentsOf(translationText);
  const hasSubtitle = computed(() => !!sourceText.value || !!translationText.value);
  const showSubtitle = computed(() => subtitleVisible.value && hasSubtitle.value);

  const termCard = useTermCard(track);

  const translationMap: Record<string, string> = {};
  let liveTimeline: LiveSubtitleItem[] = [];
  const liveItemMap = new Map<number, LiveSubtitleItem>();
  let lastCurrentTime = 0;
  let lastDurationTime = 0;
  let lastSdkListSyncAt = 0;
  let lastHistoryPollAt = 0;
  let historyLoading = false;
  let timeShiftSupportCached = false;
  let liveTickTimer: number | null = null;
  let lastLoggedIndex = -1;
  let lastLoggedVisible = false;
  let lastHistorySignature = '';
  let lastEmptyTimelineLogAt = 0;
  let lastRealtimeLogIndex = -1;

  function getLiveEdgeTime() {
    if (Number.isFinite(lastDurationTime) && lastDurationTime > 0) return lastDurationTime;

    try {
      const time = resolveWatchCore()?.player.getCurrentTime();
      if (Number.isFinite(time) && (time || 0) > 0) return time as number;
    } catch (error) {
      console.warn('[term] get current time failed', error);
    }

    return lastCurrentTime;
  }

  function getSubtitleConfig() {
    return resolveWatchCore()?.subtitle.getSubtitleConfig();
  }

  function isTimeShiftSupported() {
    if (timeShiftSupportCached) return true;

    try {
      const support = !!resolveWatchCore()?.player.supportLiveTimeShift().support;
      timeShiftSupportCached = support;
      return support;
    } catch (error) {
      return false;
    }
  }

  function isAtLiveEdge() {
    // 未开启时移时不存在“回看位置”，始终按实时字幕处理
    if (!isTimeShiftSupported()) return true;
    if (!Number.isFinite(lastDurationTime) || lastDurationTime <= 0) return true;
    return lastDurationTime - lastCurrentTime <= LIVE_EDGE_TOLERANCE;
  }

  function getSdkSubtitleDuration(subtitle: SubtitlesListItem) {
    const duration = Number(subtitle.duration);
    if (!Number.isFinite(duration) || duration <= 0) return 0;

    // SDK 内部会用 duration 与毫秒级 delayTime 比较，因此这里按毫秒归一化。
    const seconds = duration > 60 ? duration / 1000 : duration;
    return Math.min(120, seconds);
  }

  function applyItem(item: LiveSubtitleItem) {
    currentIndex.value = item.index;
    sourceText.value = item.source;
    const translation = item.translation || translationMap[String(item.index)] || '';
    translationText.value =
      translation || (getSubtitleConfig()?.subtitleTranslateEnabled ? '翻译中…' : '');
    subtitleVisible.value = true;

    publishSubtitleTermCue({
      cueKey: `live:${item.index}`,
      segments: segmentsOfText(`${item.source}\n${translation}`),
      sourceText: item.source,
      translationText: translation,
      timestamp: item.start,
    });

    const shouldLog = item.index !== lastLoggedIndex || !lastLoggedVisible;
    lastLoggedIndex = item.index;
    lastLoggedVisible = true;
    if (shouldLog) {
      console.info(`${LOG_PREFIX} render #${item.index} src=${item.source.slice(0, 60)}`, {
        translationPending: !translation,
        translation: translation.slice(0, 40),
        sourceLength: item.source.length,
        translationLength: translation.length,
        timelineSize: liveTimeline.length,
      });
    }
  }

  function pruneLiveTimeline() {
    if (!liveTimeline.length) return;

    const cutoff =
      lastCurrentTime > LIVE_TIMELINE_RETENTION
        ? lastCurrentTime - LIVE_TIMELINE_RETENTION
        : Number.NEGATIVE_INFINITY;

    let removeCount = 0;
    while (removeCount < liveTimeline.length && liveTimeline[removeCount].end < cutoff) {
      liveItemMap.delete(liveTimeline[removeCount].index);
      removeCount++;
    }

    if (removeCount) liveTimeline.splice(0, removeCount);
    if (liveTimeline.length > MAX_LIVE_TIMELINE) {
      const overflow = liveTimeline.length - MAX_LIVE_TIMELINE;
      liveTimeline.slice(0, overflow).forEach(item => liveItemMap.delete(item.index));
      liveTimeline.splice(0, overflow);
    }
  }

  function upsertLiveItem(index: number, text: string, edgeTime: number) {
    let item = liveItemMap.get(index);

    if (!item) {
      item = {
        index,
        start: edgeTime,
        end: edgeTime,
        source: text,
        translation: translationMap[String(index)] || '',
      };
      liveItemMap.set(index, item);
      liveTimeline.push(item);
    } else {
      item.source = text;
      item.end = Math.max(item.end, edgeTime);
    }

    if (item.end < item.start) item.end = item.start;

    pruneLiveTimeline();
    return item;
  }

  function sortLiveTimeline() {
    liveTimeline.sort((first, second) => first.start - second.start || first.index - second.index);
  }

  function buildSeedItem(
    subtitle: SubtitlesListItem,
    config: SubtitleConfig,
    cursor: number,
  ): { item: LiveSubtitleItem; nextCursor: number } | null {
    const source = String(subtitle[config.subtitleSourceLanguage] || '');
    const translation = config.subtitleTranslateEnabled
      ? String(subtitle[config.subtitleTranslateLanguage] || '')
      : '';

    if (!source && !translation) return null;

    const duration = getSdkSubtitleDuration(subtitle);
    const start = Math.max(
      0,
      cursor - (duration || estimateSubtitleDuration(source || translation)),
    );

    return {
      item: {
        index: subtitle.index,
        start,
        end: cursor,
        source,
        translation: translation || translationMap[String(subtitle.index)] || '',
      },
      nextCursor: start,
    };
  }

  function mergeSeedItem(item: LiveSubtitleItem) {
    const existing = liveItemMap.get(item.index);

    if (!existing) {
      liveItemMap.set(item.index, item);
      liveTimeline.push(item);
      return true;
    }

    let changed = false;
    // 强制同步通常发生在切换翻译语言后，这里需要刷新已缓存条目的文案。
    if (item.source && existing.source !== item.source) {
      existing.source = item.source;
      changed = true;
    }
    if (existing.translation !== item.translation) {
      existing.translation = item.translation;
      changed = true;
    }
    // 页面刚打开时播放器时间可能还是 0，等播放器给出时间后补正旧条目的时间轴。
    if (existing.start === 0 && existing.end === 0 && item.end > 0) {
      existing.start = item.start;
      existing.end = item.end;
      changed = true;
    }
    if (existing.end <= existing.start && item.end > item.start) {
      existing.start = item.start;
      existing.end = item.end;
      changed = true;
    }
    return changed;
  }

  function seedTimelineFromSdk(list: SubtitlesListItem[]) {
    if (!list.length) return;

    const config = getSubtitleConfig();
    if (!config) return;

    const edgeTime = Math.max(0, getLiveEdgeTime());

    // 公开的 getSubtitlesList 会丢掉 relativeTime，无法安全还原绝对起点，
    // 因此按当前直播边缘从后往前近似补齐最近一批字幕。
    let cursor = edgeTime;
    let seededCount = 0;

    for (let index = list.length - 1; index >= 0; index--) {
      const result = buildSeedItem(list[index], config, cursor);
      if (!result) continue;

      cursor = result.nextCursor;
      if (mergeSeedItem(result.item)) seededCount++;
    }

    if (seededCount) {
      sortLiveTimeline();
      pruneLiveTimeline();
      // 只要 SDK 列表中出现了新内容，就视为收到了一次新的字幕数据。
    }
  }

  function seedFromCurrentList() {
    const core = resolveWatchCore();
    if (!core) return;
    seedTimelineFromSdk(core.subtitle.getSubtitlesList());
  }

  /**
   * 拉取服务端最新历史字幕。SDK 的实时字幕 WebSocket 在部分直播/伪直播场景
   * 会漏发，而历史接口仍能返回最新结果，因此作为实时事件的兜底数据源。
   */
  async function fetchSubtitleHistory(size: number): Promise<SubtitlesListItem[]> {
    const core = resolveWatchCore();
    const provider = core?.subtitle as unknown as SubtitleHistoryProvider | undefined;
    const fetchHistory = provider?.__getSubtitlesHistory;
    if (!provider || typeof fetchHistory !== 'function') return [];

    const result = await fetchHistory.call(provider, { size, order: -1 });
    const list = result?.list ?? [];
    return [...list].reverse();
  }

  async function pollSubtitleHistory() {
    if (!mounted || isDemoMode.value || historyLoading) return;

    const now = Date.now();
    if (now - lastHistoryPollAt < SUBTITLE_HISTORY_POLL_MS) return;

    lastHistoryPollAt = now;
    historyLoading = true;

    try {
      const history = await fetchSubtitleHistory(SUBTITLE_HISTORY_POLL_SIZE);
      if (!mounted) return;
      if (!history.length) {
        if (now - lastEmptyTimelineLogAt > 5000) {
          lastEmptyTimelineLogAt = now;
          console.warn(`${LOG_PREFIX} history empty`, {
            pollSize: SUBTITLE_HISTORY_POLL_SIZE,
          });
        }
        return;
      }

      const newest = history[history.length - 1];
      const config = getSubtitleConfig();
      const newestSource = String(newest?.[config?.subtitleSourceLanguage || 'English'] || '');
      const newestTranslation = String(
        newest?.[config?.subtitleTranslateLanguage || 'Chinese'] || '',
      );
      const signature = String(newest?.index ?? 0);
      if (signature !== lastHistorySignature) {
        lastHistorySignature = signature;
        console.info(`${LOG_PREFIX} history #${newest?.index} src=${newestSource.slice(0, 60)}`, {
          count: history.length,
          sourceLength: newestSource.length,
          translationLength: newestTranslation.length,
          translation: newestTranslation.slice(0, 40),
        });
      }

      seedTimelineFromSdk(history);
      syncLiveSubtitleAtTime(lastCurrentTime);
    } catch (error) {
      console.warn('[term] poll live subtitle history failed', error);
    } finally {
      historyLoading = false;
    }
  }

  function syncTimelineFromSdk(force = false) {
    const now = Date.now();
    if (!force && now - lastSdkListSyncAt < SDK_LIST_SYNC_MS) return;
    lastSdkListSyncAt = now;
    seedFromCurrentList();
  }

  function syncLiveByPlayerClock() {
    if (!mounted || isDemoMode.value) return;

    const core = resolveWatchCore();
    if (!core) return;

    try {
      const time = Number(core.player.getCurrentTime());
      const duration = Number(core.player.getDurationTime());

      if (!Number.isFinite(time)) return;
      if (Number.isFinite(duration) && duration > 0) lastDurationTime = duration;

      lastCurrentTime = time;
      syncTimelineFromSdk();
      pollSubtitleHistory();
      syncLiveSubtitleAtTime(time);
    } catch (error) {
      // 播放器切换或销毁期间读取时间失败属于正常情况
    }
  }

  function startLiveTicker() {
    if (liveTickTimer !== null) return;
    liveTickTimer = window.setInterval(syncLiveByPlayerClock, LIVE_TICK_MS);
  }

  function stopLiveTicker() {
    if (liveTickTimer === null) return;
    window.clearInterval(liveTickTimer);
    liveTickTimer = null;
  }

  function syncLiveSubtitleAtTime(time: number) {
    lastCurrentTime = time;
    pruneLiveTimeline();

    if (!liveTimeline.length) {
      if (Date.now() - lastEmptyTimelineLogAt > 5000) {
        lastEmptyTimelineLogAt = Date.now();
        console.warn(`${LOG_PREFIX} timeline empty`, { time });
      }
      return;
    }

    const latest = liveTimeline[liveTimeline.length - 1];

    if (isAtLiveEdge()) {
      // 暂停在直播边缘时保持当前画面字幕，不继续追最新的实时结果

      applyItem(latest);
      return;
    }

    const target = findTimelineItem(liveTimeline, time, TIMELINE_MATCH_TOLERANCE);
    if (target) {
      applyItem(target);
    } else {
      if (subtitleVisible.value) {
        console.info(`${LOG_PREFIX} hide`, { time, timelineSize: liveTimeline.length });
      }
      subtitleVisible.value = false;
    }
  }

  function onSubtitleRealTimeCC(data: SubtitleRealTimeCC) {
    if (!data.text && data.sliceType !== SubtitleSliceType.End) return;

    const config = getSubtitleConfig();
    if (config && data.language !== config.subtitleSourceLanguage) return;

    const edgeTime = getLiveEdgeTime();
    const item = upsertLiveItem(data.index, data.text, edgeTime);
    if (data.index !== lastRealtimeLogIndex) {
      lastRealtimeLogIndex = data.index;
      console.info(`${LOG_PREFIX} realtime event`, {
        index: data.index,
        sliceType: data.sliceType,
        language: data.language,
        textLength: data.text.length,
      });
    }

    if (playerStore.playStatus === PlayStatus.Playing && isAtLiveEdge()) {
      applyItem(item);
    }
  }

  function onSubtitleTranslate(data: SubtitleTranslate) {
    const config = getSubtitleConfig();
    if (!config?.subtitleTranslateEnabled) return;
    if (data.language !== config.subtitleTranslateLanguage) return;

    const previous = translationMap[String(data.index)];
    translationMap[String(data.index)] = data.result;
    if (previous !== data.result) {
      console.info(`${LOG_PREFIX} translation #${data.index} text=${data.result.slice(0, 40)}`, {
        language: data.language,
        resultLength: data.result.length,
      });
    }

    const item = liveItemMap.get(data.index);
    if (item) item.translation = data.result;

    if (currentIndex.value === data.index && subtitleVisible.value) {
      translationText.value = data.result;
      publishSubtitleTermCue({
        cueKey: `live:${data.index}`,
        segments: segmentsOfText(`${sourceText.value}\n${data.result}`),
        sourceText: sourceText.value,
        translationText: data.result,
        timestamp: lastCurrentTime,
      });
    }
  }

  function syncCachedTranslation() {
    const item = liveItemMap.get(currentIndex.value);
    translationText.value = item?.translation || translationMap[String(currentIndex.value)] || '';
  }

  function onSubtitleListForceSync(payload: { data: SubtitlesListItem[] }) {
    // 该事件主要由切换翻译语言触发，先清空旧语种翻译，避免新旧语言混用
    Object.keys(translationMap).forEach(key => {
      delete translationMap[key];
    });
    liveItemMap.forEach(item => {
      item.translation = '';
    });

    seedTimelineFromSdk(payload.data || []);
    syncCachedTranslation();
    syncLiveSubtitleAtTime(lastCurrentTime);
  }

  function onDemoTimeUpdate(params: PlayerEventsRelations[PlayerEvents.TimeUpdate]) {
    const sentences = DEMO_SENTENCES[selectedTrack.value];
    if (!sentences.length) return;

    const index = Math.floor(params.currentTime / (DEMO_INTERVAL_MS / 1000)) % sentences.length;
    if (index === currentIndex.value) return;

    const item = sentences[index];
    translationMap[String(index)] = item.translation;
    currentIndex.value = index;
    sourceText.value = item.source;
    translationText.value = item.translation;
    subtitleVisible.value = true;

    publishSubtitleTermCue({
      cueKey: `demo:${index}`,
      segments: segmentsOfText(`${item.source}\n${item.translation}`),
      sourceText: item.source,
      translationText: item.translation,
      timestamp: params.currentTime,
    });
  }

  function onPlayerTimeUpdate(params: PlayerEventsRelations[PlayerEvents.TimeUpdate]) {
    lastCurrentTime = params.currentTime;
    if (Number.isFinite(params.durationTime) && params.durationTime > 0) {
      lastDurationTime = params.durationTime;
    }

    if (isDemoMode.value) {
      onDemoTimeUpdate(params);
    } else {
      syncTimelineFromSdk();
      syncLiveSubtitleAtTime(params.currentTime);
    }
  }

  function clearCurrentSubtitle() {
    sourceText.value = '';
    translationText.value = '';
    currentIndex.value = -1;
    subtitleVisible.value = false;
    termCard.resetCard();
  }

  function onSubtitleListReset() {
    // SDK 在 OnSliceStart 时会清空自己的列表。前端保留已收到的历史用于时移回看，
    // 只清空当前展示，随后由增量同步继续接管新字幕。
    const wasVisible = subtitleVisible.value;
    console.info(`${LOG_PREFIX} list reset`, {
      wasVisible,
      timelineSize: liveTimeline.length,
    });
    syncTimelineFromSdk(true);
    if (!wasVisible) clearCurrentSubtitle();
  }

  function resetSubtitle() {
    clearCurrentSubtitle();
    liveTimeline = [];
    liveItemMap.clear();
    lastSdkListSyncAt = 0;
    Object.keys(translationMap).forEach(key => {
      delete translationMap[key];
    });
  }

  function bindSdkEvents() {
    const core = resolveWatchCore();
    if (!core || sdkEventsBound) return;

    core.subtitle.eventEmitter.on(SubtitleEvents.SubtitleRealTimeCC, onSubtitleRealTimeCC);
    core.subtitle.eventEmitter.on(SubtitleEvents.SubtitleTranslate, onSubtitleTranslate);
    core.subtitle.eventEmitter.on(SubtitleEvents.SubtitleListReset, onSubtitleListReset);
    core.subtitle.eventEmitter.on(SubtitleEvents.SubtitleListForceSync, onSubtitleListForceSync);
    sdkEventsBound = true;
  }

  function unbindSdkEvents() {
    if (!watchCore || !sdkEventsBound) return;

    watchCore.subtitle.eventEmitter.off(SubtitleEvents.SubtitleRealTimeCC, onSubtitleRealTimeCC);
    watchCore.subtitle.eventEmitter.off(SubtitleEvents.SubtitleTranslate, onSubtitleTranslate);
    watchCore.subtitle.eventEmitter.off(SubtitleEvents.SubtitleListReset, onSubtitleListReset);
    watchCore.subtitle.eventEmitter.off(
      SubtitleEvents.SubtitleListForceSync,
      onSubtitleListForceSync,
    );
    sdkEventsBound = false;
  }

  function bindPlayerEvents() {
    const core = resolveWatchCore();
    if (!core || playerEventsBound) return;

    core.player.eventEmitter.on(PlayerEvents.TimeUpdate, onPlayerTimeUpdate);
    playerEventsBound = true;
  }

  function unbindPlayerEvents() {
    if (!watchCore || !playerEventsBound) return;

    watchCore.player.eventEmitter.off(PlayerEvents.TimeUpdate, onPlayerTimeUpdate);
    playerEventsBound = false;
  }

  async function initLiveTimeline() {
    const core = resolveWatchCore();
    if (!core) return;

    try {
      const history = await fetchSubtitleHistory(SUBTITLE_HISTORY_INITIAL_SIZE);
      console.info(`${LOG_PREFIX} init history`, {
        count: history.length,
        sdkListSize: core.subtitle.getSubtitlesList().length,
        newestIndex: history[history.length - 1]?.index,
      });
      if (history.length) {
        seedTimelineFromSdk(history);
        lastHistoryPollAt = Date.now();
      } else if (!core.subtitle.getSubtitlesList().length) {
        // 私有历史接口不可用时，退回 SDK 自己的最近 10 条历史。
        await core.subtitle.initSubtitleList();
      }

      if (mounted) {
        seedFromCurrentList();
        lastSdkListSyncAt = Date.now();
        syncLiveSubtitleAtTime(lastCurrentTime);
      }
    } catch (error) {
      console.warn('[term] init live subtitle history failed', error);
    }
  }

  onMounted(() => {
    mounted = true;
    console.info(`${LOG_PREFIX} hook mounted`, {
      demoMode: isDemoMode.value,
      track: selectedTrack.value,
      liveStatus: resolveWatchCore()?.channel.getLiveStatus(),
    });
    bindPlayerEvents();

    if (isDemoMode.value) {
      console.warn(`${LOG_PREFIX} demo mode enabled by termDemo=1; live subtitles are disabled`);
      return;
    }

    bindSdkEvents();
    startLiveTicker();
    initLiveTimeline();
  });

  onBeforeUnmount(() => {
    mounted = false;
    unbindSdkEvents();
    unbindPlayerEvents();
    stopLiveTicker();
    resetSubtitle();
  });

  return {
    selectedTrack,
    isDemoMode,
    showSubtitle,
    sourceSegments,
    translationSegments,
    ...termCard,
    resetSubtitle,
  };
};
