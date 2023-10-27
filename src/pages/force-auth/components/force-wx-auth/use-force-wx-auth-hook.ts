import { computed, onMounted, ref } from 'vue';
import { getWatchCore } from '@/core/watch-sdk';

import { copyText, toastCopySuccess } from '@/assets/utils/copy';
import { useWeixinAuthorize } from '@/hooks/platform/use-weixin/use-weixin-authorize';
import { isWeixin } from '@/assets/utils/browser';
import { wait } from '@/assets/utils/utils';

import { FormProtocolInstance } from '@/components/common-base/form/form-protocol/use-form-protocol';
import { MessageBoxInstance } from '@/components/common-base/message-box/use-message-box';
import { useLangStore, convert2WatchSdkLang } from '@/store/use-lang-store';
import { ChannelAgreementConfig, LanguageType } from '@polyv/live-watch-sdk';

const generateDefaultChannelAgreementConfigItem = (): ChannelAgreementConfig[LanguageType] => {
  return {
    content: '',
    dialogContent: '',
    dialogTitle: '',
  };
};

export const useForceWxAuthHook = () => {
  const { redirectWeixinAuthorize } = useWeixinAuthorize();

  const watchCore = getWatchCore();
  const langStore = useLangStore();

  const channelAgreementConfig = ref<ChannelAgreementConfig>();

  /** 当前频道协议配置 */
  const currentChannelAgreementConfig = computed(() => {
    const defaultData = generateDefaultChannelAgreementConfigItem();
    if (!channelAgreementConfig.value) return defaultData;

    const langKey = convert2WatchSdkLang(langStore.currentLang);
    return channelAgreementConfig.value[langKey] || defaultData;
  });

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
    return currentChannelAgreementConfig.value.content;
  });

  const protocolConfirmRef = ref<MessageBoxInstance>();

  const protocolConfirmInfo = computed(() => {
    return {
      content: currentChannelAgreementConfig.value.dialogContent,
      title: currentChannelAgreementConfig.value.dialogTitle,
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
      channelAgreementConfig.value = await watchCore.channel.getChannelAgreementConfig();
      await wait(3000);
      protocolTipsVisible.value = false;
    }
  });

  return {
    channelAgreementConfig,

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
