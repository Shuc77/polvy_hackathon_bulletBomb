import { appEvents, useEventBusListener } from '@/app/app-events';
import { translate } from '@/assets/lang';
import { copyText } from '@/assets/utils/copy';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { toast } from '@/hooks/components/use-toast';
import { parseEmotions } from '@polyv/emotion-sdk';
import { ChatMsgSpeakType } from '@polyv/live-watch-sdk';
import { ref } from 'vue';
import { useChatMsgUser } from '../chat-msg-list/msg-items/_hooks/chat-msg-user-hook';
import { FullMsgData } from './type';
import { nl2br } from '@utils-ts/string';

export const useChatFullMessage = () => {
  const { visible, setVisible } = useSimpleVisible();

  const fullContent = ref('');

  const chatMsg = ref<ChatMsgSpeakType>();

  const { msgUserAvatar, msgUserActor, msgUserNick, msgUserType } = useChatMsgUser({
    chatMsg,
  });

  useEventBusListener(appEvents.chat.ShowFullMessage, (data: FullMsgData) => {
    // 将换行符转成 <br />
    const content = nl2br(data.fullContent);
    // 表情标签转换
    fullContent.value = parseEmotions(content);

    chatMsg.value = data.chatMsg;
    setVisible(true);
  });

  /**
   * 复制内容
   */
  async function copyContent() {
    await copyText(fullContent.value);
    toast.success(translate('copy.success'));
  }

  return {
    visible,
    fullContent,
    chatMsg,
    msgUserAvatar,
    msgUserNick,
    msgUserType,
    msgUserActor,
    copyContent,
  };
};
