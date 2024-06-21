import { getWatchCore } from '@/core/watch-sdk';
import { ref } from 'vue';

export function useLotteryPrivacy() {
  const watchCore = getWatchCore();
  const privacyDetail = watchCore.interactReceive.getLotteryPrivacyDetail();

  const privacyContent = ref(privacyDetail.privacyContent);

  return {
    privacyContent,
  };
}
