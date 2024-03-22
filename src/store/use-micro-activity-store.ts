import { getWatchCore } from '@/core/watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';

import { useChannelMenuStore } from './use-channel-menu-store';
import { useCommonStore } from './use-common-store';

export interface MicroActivityStoreState {
  /** 微活动开关 */
  microActivityEnabled: Ref<boolean>;
  /** 微活动-挂件Icon */
  microActivityPendantIcon: Ref<string>;
  /** 微活动名称 */
  microActivityTitle: ComputedRef<string>;
  /** 同步微活动 store */
  syncMicroActivityStore(): void;
}

export type MicroActivityStore = MicroActivityStoreState;

export const useMicroActivityStore = defineStore<'microActivity', MicroActivityStore>(
  'microActivity',
  () => {
    const commonStore = useCommonStore();
    const channelMenuStore = useChannelMenuStore();

    /** 微活动开关 */
    const microActivityEnabled = ref(false);

    /** 微活动-挂件Icon */
    const microActivityPendantIcon = ref(commonStore.plvDefaultResource.defaultWidgetGame);

    /** 微活动名称 */
    const microActivityTitle = computed(() => {
      return channelMenuStore.microActivityMenuData.label;
    });

    function syncMicroActivityStore() {
      const watchCore = getWatchCore();
      const setting = watchCore.microActivity.getMicroActivitySetting();
      microActivityEnabled.value = setting.microActivityEnabled;
      microActivityPendantIcon.value = setting.pendantIcon;
    }

    return {
      microActivityEnabled,
      microActivityPendantIcon,
      microActivityTitle,
      syncMicroActivityStore,
    };
  },
);
