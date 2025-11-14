import { fitProtocol } from '@/assets/utils/url';
import { useResizeOssImage } from '@/hooks/business/use-resize-oss-image';
import { previewImage } from '@/hooks/components/use-image-preview';
import { ChatMsgImageType } from '@polyv/live-watch-sdk';
import { computed, nextTick, ref, unref } from 'vue';
import { useChatMsgComputedInject } from '../_hooks/chat-msg-computed-hook';
import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';

export interface ImageSizeType {
  width: number;
  height: number;
}

const recordImageSize: UniversalParams<ImageSizeType | undefined> = {};

export const useImageMsg = () => {
  const { chatMsg } = useChatMsgDataInject<ChatMsgImageType>();
  const { containerRef, getVirtualList } = useChatMsgComputedInject();

  const { resizeOSSImg } = useResizeOssImage();

  const imageRef = ref<HTMLImageElement>();

  const chatImageUrl = computed(() => {
    return fitProtocol(chatMsg.value.imageUrl, ['blob']);
  });

  const imageId = ref(chatMsg.value.imageId);

  /** 图片宽高 */
  const imageSize = ref<ImageSizeType | undefined>(
    recordImageSize[imageId.value] ?? chatMsg.value.size,
  );

  /** 本地图片占位图 */
  const localImagePlaceholder = computed(() => {
    if (chatMsg.value.isLocal && chatMsg.value.isSended) {
      return chatMsg.value.localImageUrl;
    }
    return undefined;
  });

  /** 是否长图 */
  const isLargeImage = computed(() => {
    return !!imageSize.value && imageSize.value.height / imageSize.value.width >= 3;
  });

  const imageBoundSize = computed(() => {
    let minWidth = 50;
    const minHeight = 50;
    const maxWidth = 150;
    const maxHeight = 200;

    if (isLargeImage.value) {
      minWidth = 80;
    }

    return {
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
    };
  });

  const imageBoundStyle = computed(() => {
    return {
      minWidth: `${imageBoundSize.value.minWidth}px`,
      maxWidth: `${imageBoundSize.value.maxWidth}px`,
      minHeight: `${imageBoundSize.value.minHeight}px`,
      maxHeight: `${imageBoundSize.value.maxHeight}px`,
    };
  });

  /** 图片地址 */
  const imageUrl = computed(() => {
    if (chatMsg.value.isLocal && !chatMsg.value.isSended) {
      return chatImageUrl.value;
    }

    const { minWidth, minHeight, maxWidth, maxHeight } = imageBoundSize.value;

    let width: number | undefined;
    let height: number | undefined;

    const size = chatMsg.value.size;
    if (size) {
      if (size.height > size.width) {
        // 竖向图片
        height = Math.min(size.height, maxHeight);
      } else {
        // 横向图片
        width = Math.min(size.width, maxWidth);
      }

      const prop = size.width / size.height;
      // 高度实际渲染的宽度小于最小宽度时，宽度取最小宽度，高度不限制
      if (height && height * prop < minWidth) {
        width = minWidth;
        height = undefined;
      }
      // 宽度实际渲染的高度小于最小高度时，高度取最小高度，宽度不限制
      if (width && width / prop < minHeight) {
        height = minHeight;
        width = undefined;
      }
    }

    if (width) {
      width = width * 2;
    }
    if (height) {
      height = height * 2;
    }

    if (width || height) {
      return resizeOSSImg(chatImageUrl.value, width, height);
    }

    return chatImageUrl.value;
  });

  /** 是否加载完成 */
  const isLoaded = ref(false);

  /** 处理图片加载完成 */
  async function onImageLoad() {
    if (isLoaded.value) {
      return;
    }

    const imageElem = unref(imageRef);
    if (!imageElem) return;

    if (!imageSize.value) {
      imageSize.value = {
        width: imageElem.width,
        height: imageElem.height,
      };
      recordImageSize[unref(imageId)] = imageSize.value;
    }

    isLoaded.value = true;

    /** 容器节点 */
    const container = unref(containerRef);
    if (container) {
      // 是否在底部
      const isBottom = container.scrollTop + container.clientHeight >= container.scrollHeight;

      await nextTick();

      // 如果在设置图片显示之前滚动容器在最底部，则显示之后手动置底
      const virtualList = getVirtualList();
      if (isBottom && virtualList) {
        virtualList.scrollToFoot();
      }
    }
  }

  function onClickImage() {
    previewImage([unref(chatImageUrl)]);
  }

  return {
    chatMsg,
    imageRef,
    imageSize,
    imageUrl,
    localImagePlaceholder,
    isLoaded,
    isLargeImage,
    imageBoundSize,
    imageBoundStyle,
    onImageLoad,
    onClickImage,
  };
};
