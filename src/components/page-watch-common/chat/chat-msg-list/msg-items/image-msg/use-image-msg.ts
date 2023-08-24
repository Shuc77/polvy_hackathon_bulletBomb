import { isMobile } from '@/assets/utils/browser';
import { resizeOSSImg } from '@/assets/utils/image';
import { fitProtocol } from '@/assets/utils/url';
import { previewImage } from '@/hooks/components/use-image-preview';
import { ChatMsgImageType } from '@polyv/live-watch-sdk';
import { computed, nextTick, ref, unref } from 'vue';
import { CSSProperties } from 'vue/types/jsx';
import { useChatMsgComputedInject } from '../_hooks/chat-msg-computed-hook';
import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';

export interface ImageSizeType {
  width: number;
  height: number;
}

const recordImageSize: UniversalParams<ImageSizeType | undefined> = {};

// 图片最小显示宽度
const minPicWidth = isMobile ? 48 : 44;
// 图片最小高度
const minPicHeight = isMobile ? 48 : 25;
// 图片最大显示宽度
const maxPicWidth = isMobile ? 250 : 258;
// 图片最大显示高度
const maxPicHeight = isMobile ? 140 : 144;
// 纵向超长图比例(高/宽)
const portraitLongPicRatio = 2.25;
// 横向超长图比例(高/宽)
const landscapeLongPicRatio = 0.14;

export const useImageMsg = () => {
  const { chatMsg } = useChatMsgDataInject<ChatMsgImageType>();
  const { containerRef, getVirtualList } = useChatMsgComputedInject();

  const imageRef = ref<HTMLImageElement>();

  const chatImageUrl = computed(() => {
    return fitProtocol(chatMsg.value.imageUrl);
  });

  /** 图片地址 */
  const imageUrl = computed(() => {
    const size = chatMsg.value.size;
    const width = size && size.width ? size.width / 2 : undefined;
    const height = size && size.height ? size.height / 2 : undefined;

    return resizeOSSImg(chatImageUrl.value, width, height);
  });

  /** 图片宽高 */
  const imageSize = ref<ImageSizeType | undefined>(
    recordImageSize[imageUrl.value] ?? chatMsg.value.size,
  );

  /** 图片高宽比 */
  const imageRatio = computed(() => {
    if (!imageSize.value) {
      return 72 / 128;
    }
    return imageSize.value.height / imageSize.value.width;
  });

  /** 图片外层样式 */
  const wrapStyle = ref<UniversalParams<string>>({});
  /** 图片样式 */
  const imageStyle = ref<UniversalParams<string>>({});

  /** 是否加载完成 */
  const isLoaded = ref(false);

  /** 计算样式 */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  function computedStyle() {
    if (!imageSize.value) {
      return;
    }
    const { width: imageWidth, height: imageHeight } = imageSize.value;
    const ratio = imageHeight / imageWidth;

    const _wrapStyle: CSSProperties = {};
    const _imageStyle: CSSProperties = {};

    if (ratio > 1) {
      // 纵向图片
      if (ratio > portraitLongPicRatio) {
        // 图片纵向超长
        if (imageHeight >= minPicHeight && imageHeight <= maxPicHeight) {
          _imageStyle.height = `${imageHeight}px`;
        }

        if (imageWidth >= minPicWidth && imageWidth <= maxPicWidth) {
          _imageStyle.width = `${imageWidth}px`;
        }
      }
      _imageStyle.maxWidth = `${maxPicWidth}px`;
      _imageStyle.maxHeight = `${maxPicHeight}px`;
    } else {
      // 横向图片
      if (ratio < landscapeLongPicRatio) {
        // 图片横向超长
        if (imageHeight >= minPicHeight && imageHeight <= maxPicHeight) {
          _imageStyle.height = `${imageHeight}px`;
        }

        if (imageWidth >= minPicWidth && imageWidth <= maxPicWidth) {
          _imageStyle.width = `${imageWidth}px`;
        }

        _imageStyle.maxWidth = `${maxPicWidth}px`;
        _imageStyle.maxHeight = `${maxPicHeight}px`;
      } else {
        _imageStyle.maxWidth = '100%';
        _imageStyle.maxHeight = `${maxPicHeight}px`;
      }
    }

    _wrapStyle.maxWidth = `${maxPicWidth}px`;
    _wrapStyle.maxHeight = `${maxPicHeight}px`;
    _imageStyle.minWidth = `${minPicWidth}px`;
    _imageStyle.minHeight = `${minPicHeight}px`;

    wrapStyle.value = _wrapStyle as UniversalParams<string>;
    imageStyle.value = _imageStyle as UniversalParams<string>;
  }
  computedStyle();

  /** 处理图片加载完成 */
  async function onImageLoad() {
    const imageElem = unref(imageRef);
    if (!imageElem) return;

    imageSize.value = {
      width: imageElem.width,
      height: imageElem.height,
    };

    recordImageSize[unref(imageUrl)] = imageSize.value;

    computedStyle();

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
    minPicWidth,
    minPicHeight,
    maxPicWidth,
    maxPicHeight,
    wrapStyle,
    imageStyle,
    imageRef,
    imageSize,
    imageUrl,
    isLoaded,
    imageRatio,
    onImageLoad,
    onClickImage,
  };
};
