import { translate } from '@/assets/lang';
import { PropUtils, useProps, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { ConnectMicItem } from '@polyv/live-watch-sdk';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, unref } from 'vue';

export const connectMicItemProps = () => ({
  micItem: PropUtils.object<ConnectMicItem>().isRequired,
  /** 连麦信息是否显示 */
  micInfoVisible: PropUtils.bool.def(true),
});

/** 连麦节点 hook */
export const useConnectMicItem = (options: { props: VueProps<typeof connectMicItemProps> }) => {
  const { props } = options;
  const { micInfoVisible } = useProps(props);

  const wrapRef = ref<HTMLDivElement>();

  /** 连麦用户昵称 */
  const micNickname = computed<string>(() => {
    const micItem = props.micItem;
    if (micItem.isTeacher) {
      return translate('connectMic.teacher');
    }
    if (micItem.isSelf) {
      return translate('connectMic.me');
    }
    return micItem.nickname;
  });

  /** 是否关闭麦克风 */
  const isAudioMuted = computed(() => props.micItem.isAudioMuted);

  /** 当前音量，0 ～ 1 */
  const currentVolume = computed(() => props.micItem.currentVolume);

  /** 是否关闭摄像头 */
  const isVideoMuted = computed(() => props.micItem.isVideoMuted);

  /** 是否 sip 电话入座 */
  const isSipUser = computed(() => props.micItem.isSipUser);

  /** 是否本地推流 */
  const isLocal = computed(() => props.micItem.isLocal);

  /** 是否主讲 */
  const isMaster = computed(() => props.micItem.isMaster);

  /** 当前用户的连麦方式 */
  const currentConnectMicType = computed(() => props.micItem.currentConnectMicType);

  /**
   * 初始化连麦节点
   */
  async function initMicItem() {
    await nextTick();
    const micItem = props.micItem;
    const wrapElement = unref(wrapRef);
    if (!wrapElement) {
      return;
    }
    wrapElement.innerHTML = '';

    // 本地流则调用推送方法
    if (micItem.isLocal) {
      micItem.publishSteam({
        element: wrapElement,
        control: false,
        playConfig: {
          fit: 'contain',
        },
      });
    } else {
      micItem.subscribeStream({
        element: wrapElement,
        control: false,
        playConfig: {
          fit: 'contain',
        },
      });
    }
  }

  /**
   * 销毁连麦节点
   */
  function destroyMicItem(): void {
    const micItem = props.micItem;
    micItem.removeStream();
  }

  onMounted(() => {
    initMicItem();
  });

  onBeforeUnmount(() => {
    destroyMicItem();
  });

  return {
    wrapRef,
    micInfoVisible,
    micNickname,
    isAudioMuted,
    currentVolume,
    isVideoMuted,
    isSipUser,
    isLocal,
    isMaster,
    currentConnectMicType,
  };
};
