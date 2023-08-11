import { computed, onMounted, ref } from 'vue';
import { getWatchCore } from '@/core/watch-sdk';

import { copyText, toastCopySuccess } from '@/assets/utils/copy';
import { useWeixinAuthorize } from '@/hooks/platform/use-weixin/use-weixin-authorize';
import { isMobile, isWeixin } from '@/assets/utils/browser';
import { wait } from '@/assets/utils/utils';
import { translate } from '@/assets/lang';

import { FormProtocolInstance } from '@/components/common-base/form/form-protocol/use-form-protocol';
import { MessageBoxInstance } from '@/components/common-base/message-box/use-message-box';

function getViewerConfig() {
  // 隐私协议
  const viewerPolicy = isMobile
    ? 'https://m.polyv.net/viewer-policy/?plainText=1'
    : 'https://www.polyv.net/viewer-policy/';
  // 用户协议
  const viewerAgreement = isMobile
    ? 'https://m.polyv.net/viewer-agreement/?plainText=1'
    : 'https://www.polyv.net/viewer-agreement/';

  return {
    viewerPolicy,
    viewerAgreement,
  };
}

export const useForceWxAuthHook = () => {
  const { redirectWeixinAuthorize } = useWeixinAuthorize();

  const watchCore = getWatchCore();

  const watchUrl = computed(() => {
    return window.location.href;
  });

  const qrcodeUrl = computed(() => {
    return watchCore.utils.generateQrcodeUrl(watchUrl.value);
  });

  /** 复制内容 */
  async function copyContent() {
    await copyText(watchUrl.value);
    toastCopySuccess();
  }

  const protocolRef = ref<FormProtocolInstance>();

  const protocolTipsVisible = ref(true);

  const protocolChecked = ref(false);

  const protocolContent = computed(() => {
    return translate('wxAuth.protocol.content', { ...getViewerConfig() });
  });

  const protocolConfirmRef = ref<MessageBoxInstance>();

  const protocolConfirmInfo = computed(() => {
    return {
      content: translate('wxAuth.protocol.confirm.content', { ...getViewerConfig() }),
      title: translate('wxAuth.protocol.confirm.title'),
    };
  });

  function onClickProtocolConfirmLink(a: HTMLAnchorElement) {
    if (protocolRef.value) {
      protocolRef.value.openProtocol(a);
    }
  }

  async function onClickAuthBtn() {
    if (!protocolChecked.value) {
      const res = await protocolConfirmRef.value?.$confirm();
      if (!res) {
        return;
      }
      protocolChecked.value = true;
    }
    redirectWeixinAuthorize({ snsApiBase: false });
  }

  onMounted(async () => {
    if (isWeixin) {
      await wait(3000);
      protocolTipsVisible.value = false;
    }
  });

  return {
    qrcodeUrl,
    copyContent,

    protocolRef,
    protocolChecked,
    protocolContent,
    protocolTipsVisible,
    protocolConfirmInfo,

    protocolConfirmRef,
    onClickProtocolConfirmLink,

    onClickAuthBtn,
  };
};
