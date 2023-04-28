import { computed, ComputedRef } from 'vue';
import { defineStore } from 'pinia';

import { useChannelStore } from './use-channel-store';
import { useChannelMenuStore } from './use-channel-menu-store';
import { ynToBool } from '@utils-ts/boolean';
import { YN } from '@polyv/live-watch-sdk';

export interface MicroActivityStoreState {
  /** 微活动开关 */
  microActivityEnabled: ComputedRef<boolean>;
  /** 微活动名称 */
  microActivityTitle: ComputedRef<string>;
  /** 微活动-挂件Icon */
  microActivityPendantIcon: ComputedRef<string>;
}

export type MicroActivityStore = MicroActivityStoreState;

export const useMicroActivityStore = defineStore<'microActivity', MicroActivityStore>(
  'microActivity',
  () => {
    const channelStore = useChannelStore();
    const channelMenuStore = useChannelMenuStore();

    /** 微活动开关 */
    const microActivityEnabled = computed(() => {
      return (
        channelMenuStore.microActivityMenuData.visible ||
        ynToBool(
          channelStore.channelDetail?.interactionSetting.microActivity.microActivityEnabled || YN.N,
        )
      );
    });

    /** 微活动名称 */
    const microActivityTitle = computed(() => {
      return channelMenuStore.microActivityMenuData.label;
    });

    /** 微活动-挂件Icon */
    const microActivityPendantIcon = computed(() => {
      return channelStore.channelDetail?.interactionSetting.microActivity.pendantIcon || '';
    });

    return {
      microActivityEnabled,
      microActivityTitle,
      microActivityPendantIcon,
    };
  },
);
