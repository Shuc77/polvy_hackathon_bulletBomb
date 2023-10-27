import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { computed } from 'vue';
import { CSSProperties } from 'vue/types/jsx';

export const msgContainerProps = () => ({
  /** 气泡模式 */
  bubbleModel: PropUtils.bool.def(true),
  /** 气泡最小宽度 */
  minWidth: PropUtils.number,
  /** 气泡内边距 */
  bubblePadding: PropUtils.string,
  /** 是否渲染另一个内容，默认：false */
  renderOtherContent: PropUtils.bool.def(false),
});

export const useMsgContainer = (options: { props: VueProps<typeof msgContainerProps> }) => {
  const { props } = options;

  const bubbleStyle = computed(() => {
    const style: CSSProperties = {};

    if (props.minWidth) {
      style.minWidth = `${props.minWidth}px`;
    }

    if (props.bubblePadding) {
      style.padding = props.bubblePadding;
    }

    return style;
  });

  return {
    bubbleStyle,
  };
};
