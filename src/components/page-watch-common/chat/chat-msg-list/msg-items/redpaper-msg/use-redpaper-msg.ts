/* eslint-disable sonarjs/no-duplicate-string */
import { computed, onBeforeUnmount, onMounted, ref, unref } from 'vue';
import { eventBus, appEvents } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';

import { translate } from '@/assets/lang';
import { ChatMsgRedpaperType, RedpackType } from '@polyv/live-watch-sdk';
import { RedpackStatusData } from '@/components/page-watch-common/interactive-receive/redpack-rain/types/redpack-rain-types';

import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';

interface RedpaperEntranceInstance {
  /** 更新红包状态 */
  updateStatus(status: string): void;
}

/**
 * @hook 互动-红包-聊天室红包消息
 */
export const useRedpaperMsg = () => {
  const { chatMsg } = useChatMsgDataInject<ChatMsgRedpaperType>();

  const watchCore = getWatchCore();

  /** 红包 SDK 实例 */
  const redpackSdk = watchCore.interactReceive.getRedpack();

  /** 红包入口实例 */
  const entranceRef = ref<RedpaperEntranceInstance>();

  /** 发送者的昵称 */
  const sendNick = computed(() => {
    return chatMsg.value.user?.nick;
  });

  /** 红包文案 */
  const redpackText = computed<string>(() => {
    const type = chatMsg.value.type || RedpackType.Normal;
    const redpackTexts: Record<string, string> = {
      [RedpackType.Normal]: translate('redpack.type.normal'),
      [RedpackType.OfficialNormal]: translate('redpack.type.normal'),
      [RedpackType.Password]: translate('redpack.type.password'),
      [RedpackType.Rain]: translate('redpack.type.rain'),
      [RedpackType.ScoreOfficialNormal]: translate('redpack.type.normal'),
      [RedpackType.ScorePassword]: translate('redpack.type.password'),
      [RedpackType.ScoreRain]: translate('redpack.type.rain'),
      [RedpackType.AlipayPasswordOfficialNormal]: translate('redpack.type.alipayPassword'),
    };

    return redpackTexts[type] || translate('redpack.type.normal');
  });

  /** 更新入口状态 */
  function updateEntranceStatus(data: RedpackStatusData) {
    const { redpackId, state } = data;
    if (redpackId !== unref(chatMsg).redpackId) {
      return;
    }

    const instance = unref(entranceRef);
    if (instance && instance.updateStatus) {
      instance.updateStatus(state);
    }
  }

  /** 打开红包弹层 */
  function openRedpackDialog() {
    eventBus.$emit(appEvents.interaction.OpenRedpack, unref(chatMsg));
  }

  onMounted(() => {
    eventBus.$on(appEvents.interaction.SetRedpackStatus, updateEntranceStatus);
  });

  onBeforeUnmount(() => {
    eventBus.$off(appEvents.interaction.SetRedpackStatus, updateEntranceStatus);
  });

  return {
    chatMsg,
    entranceRef,
    redpackSdk,
    sendNick,
    redpackText,
    openRedpackDialog,
  };
};
