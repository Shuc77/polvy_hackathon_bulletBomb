import { wait } from '@/assets/utils/utils';
import { getWatchCore } from '@/core/watch-sdk';
import { ref } from 'vue';

import { appEvents, eventBus, useEventBusListener } from '@/app/app-events';
import { useSendMsg } from '@/components/page-watch-common/chat/chat-msg-list/hooks/send-msg-hook';
import { useChatStore } from '@/store/use-chat-store';

import { translate } from '@/assets/lang';
import { MsgInputWrapInstance } from '@/components/page-watch-common/msg-input-wrap/use-msg-input-wrap';
import { toast } from '@/hooks/components/use-toast';
import { PlvInputContent } from '@/plugins/polyv-ui/types';

/**
 * @hook 聊天输入控制器
 */
export const useChatInputController = (options?: {
  /** 提交拦截 */
  submitIntercept?: (contentList: PlvInputContent[]) => boolean;
}) => {
  const chatStore = useChatStore();

  const {
    // eslint-disable-next-line prettier/prettier
    sendSpeakMsg: sendChatSpeakMsg,
    sendImageMsg: sendChatImageMsg,
    sendSystemMsg: sendChatSystemMsg,
  } = useSendMsg();

  /** 消息输入框 */
  const msgInputWrapRef = ref<MsgInputWrapInstance>();

  /** 聚焦输入框 */
  function focusMsgInput() {
    if (!msgInputWrapRef.value) return;

    msgInputWrapRef.value.focusInput();
  }

  /** 处理发送系统消息 */
  function onSendSystemMsg({ content }: { content: string }) {
    sendChatSystemMsg(content);
  }

  /** 监听输入框消息发送 */
  async function onSubmitMessage({ contentList }: { contentList: PlvInputContent[] }) {
    if (!msgInputWrapRef.value) return;

    msgInputWrapRef.value.clearInput();
    msgInputWrapRef.value.resetStatus();

    if (options?.submitIntercept) {
      const res = options.submitIntercept(contentList);
      if (res) {
        return;
      }
    }

    await submitMessageQueue(contentList);
  }

  /** 提交消息队列 */
  async function submitMessageQueue(contentList: PlvInputContent[]) {
    for await (const message of contentList) {
      if (message.type === 'text') {
        submitTextInput(message.content);
      } else if (message.type === 'img') {
        await submitImageInput(message.file);
      }
      await wait(200);
    }
  }

  /** 提交图片文件 */
  async function submitImageInput(file: File | null) {
    try {
      const watchCore = getWatchCore();

      const { imageId, imageUrl, size } = await watchCore.utils.directUploadImage(file);
      sendChatImageMsg({
        imageId,
        imageUrl,
        size,
      });
    } catch (error) {
      toast.error(translate('watchCore.error.uploadImage'));
    }
  }

  /** 提交纯文本 */
  function submitTextInput(content: string) {
    sendChatSpeakMsg({
      content,
      quoteMsg: chatStore.currentQuoteMsg,
    });

    // 回调事件到报名抽奖，判断是否满足评论抽奖的条件
    eventBus.$emit(appEvents.interaction.CheckCommentLotteryComment, content);

    chatStore.$patch({
      currentQuoteMsg: undefined,
    });
  }

  /** 点击发送图片 */
  async function onClickSendImage() {
    const watchCore = getWatchCore();
    watchCore.utils.uploadMultiImage({
      success: ({ imageId, imageUrl, size }) => {
        sendChatImageMsg({
          imageId,
          imageUrl,
          size,
        });
      },
      fail: () => {
        toast.error(translate('watchCore.error.uploadImage'));
      },
    });
  }

  useEventBusListener(appEvents.chat.ToSendImage, onClickSendImage);

  return {
    msgInputWrapRef,
    focusMsgInput,

    onSendSystemMsg,
    onSubmitMessage,
    onClickSendImage,
  };
};
