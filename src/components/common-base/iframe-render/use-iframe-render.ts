import { formatStyleSize } from '@/assets/utils/dom';
import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { computed } from 'vue';
import { CSSProperties } from 'vue/types/jsx';

export const iframeRenderProps = () => ({
  /** 地址 */
  src: PropUtils.looseString,
  /** 高度，默认：600 */
  height: PropUtils.oneOfType<string | number>([String, Number]).def(600),
});

export const useIframeRender = (options: { props: VueProps<typeof iframeRenderProps> }) => {
  const { props } = options;

  const iframeSrc = computed(() => props.src);

  const wrapStyle = computed(() => {
    const styles: CSSProperties = {};

    if (props.height) {
      styles.height = formatStyleSize(props.height);
    }

    return styles;
  });

  return {
    iframeSrc,
    wrapStyle,
  };
};
