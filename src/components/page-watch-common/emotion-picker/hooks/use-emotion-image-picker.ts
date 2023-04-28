import { emitFunc, VueEmit } from '@/assets/utils/vue-utils/emit-utils';
import { getWatchCore } from '@/core/watch-sdk';
import { EmotionImageData } from '@polyv/live-watch-sdk';
import { onMounted, ref } from 'vue';
import { useSendMsg } from '../../chat/chat-msg-list/hooks/send-msg-hook';

export const emotionImagePickerEmits = () => ({
  /** 点击表情 */
  'click-image': emitFunc<EmotionImageData>(),
});

export const useEmotionImagePicker = (options: {
  emit: VueEmit<typeof emotionImagePickerEmits>;
}) => {
  const { sendEmotionImageMsg } = useSendMsg();

  const { emit } = options;

  /** 图片表情列表 */
  const emotionList = ref<EmotionImageData[]>([]);

  /** 处理点击表情 */
  async function onClickItem(data: EmotionImageData) {
    emit('click-image', data);

    sendEmotionImageMsg({
      emotionId: data.id,
      emotionUrl: data.url,
    });
  }

  onMounted(async () => {
    const watchCore = getWatchCore();
    const data = await watchCore.chat.getEmotionImages();
    emotionList.value = data;
  });

  return {
    emotionList,
    onClickItem,
  };
};
