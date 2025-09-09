import { PropUtils, VueProps } from '@polyv/vue-components';
import { useClickOutside } from '@/hooks/behaviors/use-click-outside';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { ref, unref, watch } from 'vue';

export const msgTipsControlProps = () => ({
  /** 是否禁用提示，默认：true */
  disabledTips: PropUtils.bool.def(true),
});

export const useMsgTipsControl = (options: { props: VueProps<typeof msgTipsControlProps> }) => {
  const { props } = options;

  /** 外层节点 */
  const referenceRef = ref<HTMLDivElement>();

  const { listenClickOutSide, removeListenClickOutSide } = useClickOutside(
    referenceRef,
    onClickOutside,
    false,
  );

  /** 提示是否显示 */
  const {
    visible: tipsVisible,
    toggle: toggleTipsVisible,
    close: closeTips,
  } = useSimpleVisible(false);

  /** 点击内容 */
  function onClickControl() {
    if (props.disabledTips) {
      return;
    }

    listenClickOutSide();
    toggleTipsVisible();
  }

  /** 点击提示 */
  function onClickTips() {
    closeTips();
  }

  /** 处理点击外部 */
  function onClickOutside() {
    removeListenClickOutSide();
    closeTips();
  }

  watch(
    () => unref(tipsVisible),
    () => {
      if (!unref(tipsVisible)) {
        removeListenClickOutSide();
      }
    },
  );

  return {
    referenceRef,
    tipsVisible,
    onClickControl,
    onClickTips,
  };
};
