import { isMobile } from '@/assets/utils/browser';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { useChannelStore } from './use-channel-store';
import { LiveStatus } from '@polyv/live-watch-sdk';
import { usePlaybackStore } from './use-playback-store';
import { getWatchCore } from '@/core/watch-sdk';

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
  const channelStore = useChannelStore();
  const playbackStore = usePlaybackStore();

  /** 配置是否使用文档 */
  const docEnabled = ref(true);

  /** 能否创建文档 */
  const canRenderDoc = computed(() => {
    // 移动端下，非直播或回放下不显示
    if (isMobile && !(channelStore.liveStatus === LiveStatus.Live || playbackStore.isPlaybacking)) {
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

  function syncDocStore() {
    const watchCore = getWatchCore();
    const docInfo = watchCore.doc.getDocInfo();
    hasPaintAuth.value = docInfo.hasPaintAuth;
    paintMode.value = docInfo.paintMode;
  }

  return {
    docEnabled,
    canRenderDoc,
    documentProportion,
    documentSwitch,
    toggleDocumentSwitch,
    hasPaintAuth,
    paintMode,
    syncDocStore,
  };
});
