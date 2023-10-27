import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { getWatchCore } from '@/core/watch-sdk';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { appendToURL } from '@just4/querystring';
import { DEFAULT_SPLASH_IMG, InvitePosterData, YN } from '@polyv/live-watch-sdk';
import { ynToBool } from '@polyv/utils/es/boolean';
import { formatDate } from '@utils-ts/date';
import { onMounted, ref } from 'vue';

export const invitePosterProps = () => ({
  type: PropUtils.number.def(0),
  extraInfo: PropUtils.oneOfType([Object, Array]),
});

// 海报合成页路径
const posterOrigin = 'https://live.polyv.cn';
// const posterOrigin = 'http://127.0.0.1:15014';
const posterBaseUrl = `${posterOrigin}/invite-poster/poster.html`;

export const useInvitePoster = (options: { props: VueProps<typeof invitePosterProps> }) => {
  const channelStore = useChannelStore();
  const channelInfoStore = useChannelInfoStore();
  const viewerStore = useViewerStore();
  const { props } = options;

  const posterData = ref<InvitePosterData>();

  const posterIframeRef = ref<HTMLIFrameElement>();

  /** iframe 地址 */
  const iframeUrl = ref('');

  /** 是否加载完成 */
  const loaded = ref(false);

  /** 海报 base64 数据 */
  const posterBase64 = ref('');

  function generateIframeUrl() {
    if (!posterData.value) {
      return;
    }

    const watchCore = getWatchCore();
    const { promotion, watchParams } = posterData.value;

    const { type = 1 } = props;

    let startTime = '';
    if (channelInfoStore.liveStartTime) {
      startTime = formatDate(channelInfoStore.liveStartTime, 'YYYY/MM/DD hh:mm:ss');
    }

    let footerText = '';
    const footerSetting = watchCore.channel.getPageFooterSetting();
    if (footerSetting.footerEnabled && footerSetting.footerText) {
      footerText = footerSetting.footerText;
    }

    const params = {
      type,
      channelId: channelStore.channelId,
      avatar: viewerStore.avatar,
      nickname: viewerStore.nickname,
      name: channelInfoStore.channelTitle,
      inviteCoverImage: promotion.inviteCoverImage || DEFAULT_SPLASH_IMG,
      publisher: channelInfoStore.channelPublisher,
      startTime,
      watchUrl: promotion.watchUrl + watchParams,
      customUserType: promotion.customUserType,
      footerText,
    };

    iframeUrl.value = appendToURL(posterBaseUrl, params);
  }

  function postCustomPosterData() {
    if (!posterData.value) {
      return;
    }

    const promotion = posterData.value.promotion;
    if (!promotion) {
      return;
    }
    const {
      // 海报图片链接(底图)
      invitePosterImageUrl,

      // 昵称开关
      invitePosterNickNameEnabled,
      // 昵称x位置
      nickNamePositionX = 0,
      // 昵称y位置
      nickNamePositionY = 0,
      // 昵称字号
      nickNameSize = 18,
      // 昵称颜色
      nickNameColor = '#FFFFFF',

      // 头像开关
      invitePosterAvatarEnabled,
      // 头像x位置
      avatarPositionX = '0',
      // 头像y位置
      avatarPositionY = '0',
      // 头像大小
      avatarSize = 50,

      // 二维码x位置
      qrCodePositionX = 0,
      // 二维码y位置
      qrCodePositionY = 0,
      // 二维码大小
      qrCodeSize = 100,
    } = promotion;

    const data: UniversalParams<unknown> = {
      invitePosterImageUrl,

      invitePosterNickNameEnabled: ynToBool(invitePosterNickNameEnabled, YN.Y),
      nickNamePositionX,
      nickNamePositionY,
      nickNameSize,
      nickNameColor,

      invitePosterAvatarEnabled: ynToBool(invitePosterAvatarEnabled, YN.Y),
      avatarPositionX,
      avatarPositionY,
      avatarSize,

      qrCodePositionX,
      qrCodePositionY,
      qrCodeSize,
      nicknameFontWeight: 700,
    };
    // 额外海报信息
    if (props.extraInfo) {
      data.extraInfo = props.extraInfo;
    }

    const posterIframe = posterIframeRef.value;

    if (posterIframe) {
      posterIframe.contentWindow?.postMessage(
        {
          event: 'customPosterData',
          data,
        },
        '*',
      );
    }
  }

  function onWindowMessage(e: MessageEvent) {
    const data = e.data;
    if (!e.origin.startsWith(posterOrigin)) {
      return;
    }
    if (typeof data === 'string' && data.indexOf('data:image') > -1) {
      loaded.value = true;
      posterBase64.value = data;
    } else if (data && data.event === 'getCustomPosterData') {
      postCustomPosterData();
    }
  }

  function listenEvents() {
    window.addEventListener('message', onWindowMessage);
  }

  onMounted(async () => {
    const watchCore = getWatchCore();
    posterData.value = await watchCore.invite.getInvitePosterData();
    generateIframeUrl();
    listenEvents();
  });

  return {
    iframeUrl,
    posterIframeRef,
    loaded,
    posterBase64,
  };
};
