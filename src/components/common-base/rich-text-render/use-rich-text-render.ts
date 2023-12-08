import { resizeHtmlContentImg } from '@/assets/utils/string';
import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { computed } from 'vue';

/**
 * <rich-text-render> props 配置
 */
export const richTextRenderProps = () => ({
  /** html 富文本内容 */
  htmlContent: PropUtils.string.def(''),
  /** 是否跟随页面多皮肤，默认 true */
  followPageSkin: PropUtils.bool.def(true),
});

export const useRichTextRender = (options: { props: VueProps<typeof richTextRenderProps> }) => {
  const { props } = options;

  /** 用于渲染的富文本内容 */
  const renderHtmlContent = computed<string>(() => {
    return resizeHtmlContentImg(props.htmlContent);
  });

  return {
    renderHtmlContent,
  };
};
