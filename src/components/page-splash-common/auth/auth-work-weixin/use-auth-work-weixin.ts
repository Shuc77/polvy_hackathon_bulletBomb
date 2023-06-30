import { useWorkWeixinAuthorize } from '@/hooks/platform/use-weixin/use-weixin-authorize';
import {
  loadWorkWeixinLoginSdk,
  WwLoginInstance,
} from '@/plugins/external-lib-loaders/load-work-weixin-login';
import { translate } from '@/assets/lang';
import { toast } from '@/hooks/components/use-toast';
import { getWatchCore } from '@/core/watch-sdk';
import { AuthSettingItemEnterpriseWeChat } from '@polyv/live-watch-sdk';
import { onBeforeMount, onBeforeUnmount, onMounted, ref, unref } from 'vue';
import { useAuthButtonInject } from '../hooks/use-auth-button';
import { getWwLoginStyle } from './utils';

export const useAuthWorkWeixinPc = () => {
  const watchCore = getWatchCore();
  useAuthButtonInject<AuthSettingItemEnterpriseWeChat>(onClickAuthButton);

  const dialogVisible = ref(false);

  async function onClickAuthButton() {
    // 企微已过期
    if (watchCore.weixin.isWorkWeixinExpired()) {
      toast.error(translate('auth.error.workWeixinExpire'));
      return;
    }

    dialogVisible.value = true;
    initWorkWeixinCode();
  }

  let wwloginInstance: WwLoginInstance | undefined;

  /**
   * 初始化企微登录二维码
   */
  async function initWorkWeixinCode() {
    destroyWwLogin();

    const watchCore = getWatchCore();
    const data = await watchCore.weixin.getWorkWeixinAuthorizeCode();
    const WwLogin = await loadWorkWeixinLoginSdk();

    wwloginInstance = new WwLogin({
      id: 'wx_work_code',
      appid: data.corpId,
      agentid: data.agentId,
      redirect_uri: encodeURIComponent(data.redirectUrl),
      state: data.state,
      lang: 'zh',
      href: getWwLoginStyle(),
    });
  }

  /**
   * 销毁企微登录实例
   */
  function destroyWwLogin() {
    if (wwloginInstance) {
      wwloginInstance.destroyed();
      wwloginInstance = undefined;
    }
  }

  onBeforeMount(() => {
    loadWorkWeixinLoginSdk();
  });

  onBeforeUnmount(() => {
    destroyWwLogin();
  });

  return {
    dialogVisible,
  };
};

export const useAuthWorkWeixinMobile = () => {
  const watchCore = getWatchCore();
  useAuthButtonInject<AuthSettingItemEnterpriseWeChat>(onClickAuthButton);
  const { canWorkWeixinAuthorize, redirectWorkWeixinAuthorize } = useWorkWeixinAuthorize();

  async function onClickAuthButton() {
    // 企微已过期
    if (watchCore.weixin.isWorkWeixinExpired()) {
      toast.error(translate('auth.error.workWeixinExpire'));
      return;
    }

    // 当前环境不支持企微授权
    if (!unref(canWorkWeixinAuthorize)) {
      toast.error(translate('auth.error.workWeixinNotAllow'));
      return;
    }

    // 判断是否为企业成员
    if (!watchCore.weixin.isEnterpriseStaff()) {
      toast.error(translate('auth.error.workWeixinNotStaff'));
      return;
    }

    redirectWorkWeixinAuthorize({
      snsApiBase: false,
    });
  }

  onMounted(() => {
    // 企微环境下直接自动执行授权
    onClickAuthButton();
  });
};
