import { isMobile } from '@/assets/utils/browser';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { useChannelStore } from './use-channel-store';
import { LiveStatus } from '@polyv/live-watch-sdk';
import { usePlaybackStore } from './use-playback-store';
import { useWatchAppStore } from './use-watch-app-store';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { useFeedInjectStore } from './use-feed-inject-store';

export interface DocStoreState {
  /** 配置是否使用文档 */
  docEnabled: Ref<boolean>;
  /** 能否创建文档 */
  canRenderDoc: ComputedRef<boolean>;
  /** 文档比例 */
  documentProportion: Ref<number | undefined>;
  /** 文档开关 */
  documentSwitch: Ref<boolean>;
  /** 是否具有画笔权限 */
  hasPaintAuth: Ref<boolean>;
  /** 是否处于画笔模式 */
  paintMode: Ref<boolean>;
  /** 翻页开关 */
  viewerPptTurningEnabled: Ref<boolean>;
}

export interface DocStoreActions {
  /** 切换文档开关 */
  toggleDocumentSwitch(): void;
  /** 同步文档 store */
  syncDocStore(): void;
}

export interface DocStore extends DocStoreState, DocStoreActions {}

/**
 * 文档 store
 */
export const useDocStore = defineStore<'doc', DocStore>('doc', () => {
  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();
  const playbackStore = usePlaybackStore();
  const feedInjectStore = useFeedInjectStore();

  /** 配置是否使用文档 */
  const docEnabled = ref(true);

  /** 能否创建文档 */
  const canRenderDoc = computed(() => {
    // 移动端下，只有在直播中或处于回放状态才能显示
    if (isMobile && !(channelStore.liveStatus === LiveStatus.Live || playbackStore.isPlaybacking)) {
      return false;
    }

    // 会议模式下不支持创建文档
    if (watchAppStore.meetingMode) {
      return false;
    }

    if (isBuildForFeedMainMode() && feedInjectStore.inFirstFeedLayout) {
      return false;
    }

    return channelStore.isPptChannel || channelStore.isSeminarChannel;
  });

  /** 文档比例，宽/高 */
  const documentProportion = ref<number>();

  /** 文档开关 */
  const documentSwitch = ref(true);

  /** 切换文档开关 */
  function toggleDocumentSwitch() {
    documentSwitch.value = !documentSwitch.value;
  }

  /** 是否具有画笔权限 */
  const hasPaintAuth = ref(false);

  /** 是否处于画笔模式 */
  const paintMode = ref(false);

  /** 翻页开关 */
  const viewerPptTurningEnabled = ref(true);

  function syncDocStore() {
    const watchCore = watchAppStore.getWatchCore();
    const docInfo = watchCore.doc.getDocInfo();
    hasPaintAuth.value = docInfo.hasPaintAuth;
    paintMode.value = docInfo.paintMode;
    viewerPptTurningEnabled.value = docInfo.viewerPptTurningEnabled;
  }

  return {
    docEnabled,
    canRenderDoc,
    documentProportion,
    documentSwitch,
    toggleDocumentSwitch,
    hasPaintAuth,
    paintMode,
    viewerPptTurningEnabled,
    syncDocStore,
  };
});
