import { ref, computed, watch } from 'vue';
import { PropUtils, VueProps, useProps } from '@/assets/utils/vue-utils/props-utils';
import { PlvPopperManager } from '@/plugins/polyv-ui/admin-import';
import { emitFunc, updateModelEmit, VueEmit } from '@/assets/utils/vue-utils/emit-utils';
import type { PcSidePopupInstance } from './type';
import { PC_LAYOUT_PLAYER_UPPER_IAR_RENDER } from '@/assets/constants/selector';

export const sidePcPopupProps = () => ({
  /** 渲染的父容器节点 */
  mountEl: PropUtils.oneOfType<HTMLElement>([HTMLElement]).def(
    () => document.querySelector(PC_LAYOUT_PLAYER_UPPER_IAR_RENDER) as HTMLElement,
  ),
  /** 显示状态，默认：false，支持 .sync */
  visible: PropUtils.bool.def(false),
});

export const sidePcPopupEmits = () => ({
  ...updateModelEmit<'visible', boolean>('visible'),
  open: emitFunc<void>(),
  opened: emitFunc<void>(),
  close: emitFunc<void>(),
  closed: emitFunc<void>(),
});

export const sidePcPopupInstance = () => ({});

export const useSidePcPopup = (options: {
  props: VueProps<typeof sidePcPopupProps>;
  emits: VueEmit<typeof sidePcPopupEmits>;
}) => {
  const { props, emits } = options;
  const { visible, mountEl } = useProps(props);

  const zIndex = ref(3000);

  const sidePopupStyle = computed(() => {
    return {
      zIndex: zIndex.value,
    };
  });

  function raiseZIndex() {
    PlvPopperManager.openPopper(mountEl.value);
    zIndex.value = PlvPopperManager.zIndex;
  }

  function openPopup() {
    raiseZIndex();

    emits('open');
  }

  function closePopup() {
    emits('update:visible', false);
    emits('close');
  }

  function afterEnter() {
    emits('opened');
  }

  function afterLeave() {
    emits('closed');
  }

  watch(
    () => visible.value,
    newValue => {
      if (newValue) {
        openPopup();
      } else {
        closePopup();
      }
    },
    {
      immediate: true,
    },
  );

  const couponSidePopupInstance: PcSidePopupInstance = {
    raiseZIndex,
  };

  return {
    sidePopupStyle,
    afterEnter,
    afterLeave,
    closePopup,
    couponSidePopupInstance,
  };
};
