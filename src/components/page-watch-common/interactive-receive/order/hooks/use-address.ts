/*
 * @Author: kim
 * @Description: 地址处理
 */
import { ref, onMounted } from 'vue';
import { getWatchCore } from '@/core/watch-sdk';
import type { AddressDetail } from '../types/order-types';

export function useAddress() {
  const watchCore = getWatchCore();
  /** 地址管理sdk */
  const addressManagementSdk = watchCore.interactReceive.getAddressManagement();
  /** 地址 */
  const address = ref<AddressDetail | Record<string, never>>({});

  /**
   * @description: 获取用户默认地址
   */
  async function fetchGetUserAddress() {
    if (!addressManagementSdk) return;
    const res = await addressManagementSdk.getDefaultAddressOfUser();
    address.value = res || {};
  }

  onMounted(() => {
    fetchGetUserAddress();
  });

  return {
    address,
    addressManagementSdk,
  };
}
