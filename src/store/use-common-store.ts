import { AreaDataJson } from '@/plugins/polyv-ui/types';
import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';

export interface CommonStoreState {
  /** 中国地区数据 */
  areaData: Ref<AreaDataJson>;
}

export const useCommonStore = defineStore<'common', CommonStoreState>('common', () => {
  /** 中国地区数据 */
  const areaData = ref<AreaDataJson>([]);

  return {
    areaData,
  };
});
