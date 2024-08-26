<script lang="tsx">
import { defineComponent, type ExtractPropTypes } from 'vue';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';

import { SIDEBAR_KEY } from '../sidebar/mobile-sidebar.vue';
import { useParent } from '@/hooks/core/use-vue/use-parent';

export const sidebarItemProps = {
  title: PropUtils.string,
  disabled: PropUtils.bool.def(false),
};

export type SidebarItemProps = ExtractPropTypes<typeof sidebarItemProps>;

export default defineComponent({
  name: 'MobileSideBarItem',

  props: sidebarItemProps,

  emits: ['click'],

  setup(props, { emit, slots }) {
    const { parent, index } = useParent(SIDEBAR_KEY);

    if (!parent) {
      return;
    }

    const onClick = () => {
      if (props.disabled) {
        return;
      }

      emit('click', index.value);
      parent.setActive(index.value);
    };

    const isActiveNextSibling = () => {
      return index.value - 1 === parent.getActive();
    };

    const isActivePreviousSibling = () => {
      return index.value + 1 === parent.getActive();
    };

    const renderCorner = (className: string) => {
      return (
        <svg
          class={className}
          viewBox="0 0 30 30">
          <g
            stroke="none"
            stroke-width="1"
            fill="none"
            fill-rule="evenodd">
            <path
              d="M30,0 C13.4314575,3.04359188e-15 -2.02906125e-15,13.4314575 0,30 L0,30 L0,0 Z"
              fill="#fff"
              transform="translate(15.000000, 15.000000) scale(-1, -1) translate(-15.000000, -15.000000) "
            />
          </g>
        </svg>
      );
    };

    return () => {
      const { title, disabled } = props;
      const selected = index.value === parent.getActive();

      return (
        <div
          role="tab"
          class={{
            'c-mobile-sidebar-item': true,
            'c-mobile-sidebar-item--select': selected,
            'c-mobile-sidebar-item--disabled': disabled,
          }}
          tabindex={disabled ? undefined : 0}
          aria-selected={selected}
          {...{
            on: {
              click: onClick,
            },
          }}>
          {isActiveNextSibling() &&
            renderCorner('c-mobile-sidebar-item__corner c-mobile-sidebar-item__corner__top')}
          {isActivePreviousSibling() &&
            renderCorner('c-mobile-sidebar-item__corner c-mobile-sidebar-item__corner__bottom')}
          {slots.title ? slots.title() : title}
        </div>
      );
    };
  },
});
</script>

<style lang="scss">
$--c-mobile-sidebar-font-size: 16px;
$--c-mobile-sidebar-line-height: 24px;
$--c-mobile-sidebar-text-color: #323233;
$--c-mobile-sidebar-disabled-text-color: #c8c9cc;
$--c-mobile-sidebar-padding: 16px;
$--c-mobile-sidebar-active-color: $--color-primary;
$--c-mobile-sidebar-background: #f2f3f5;
$--c-mobile-sidebar-selected-font-weight: 600;
$--c-mobile-sidebar-selected-text-color: $--color-primary;
$--c-mobile-sidebar-selected-border-width: 4px;
$--c-mobile-sidebar-selected-border-height: 16px;
$--c-mobile-sidebar-selected-border-color: $--color-primary;
$--c-mobile-sidebar-selected-background: #fff;

.c-mobile-sidebar-item {
  position: relative;
  box-sizing: border-box;
  display: block;
  padding: $--c-mobile-sidebar-padding;
  overflow: hidden;
  font-size: $--c-mobile-sidebar-font-size;
  line-height: $--c-mobile-sidebar-line-height;
  color: $--c-mobile-sidebar-text-color;
  cursor: pointer;
  user-select: none;
  background: $--c-mobile-sidebar-background;

  &:not(:last-child)::after {
    border-bottom-width: 1px;
  }

  &__text {
    word-break: break-all;
  }

  &--select {
    font-weight: $--c-mobile-sidebar-selected-font-weight;
    color: $--c-mobile-sidebar-selected-text-color;

    &,
    &:active {
      background-color: $--c-mobile-sidebar-selected-background;
    }

    &::before {
      position: absolute;
      top: 50%;
      left: 0;
      width: $--c-mobile-sidebar-selected-border-width;
      height: $--c-mobile-sidebar-selected-border-height;
      content: '';
      background-color: $--c-mobile-sidebar-selected-border-color;
      transform: translateY(-50%);
    }
  }

  &--disabled {
    color: $--c-mobile-sidebar-disabled-text-color;
    cursor: not-allowed;

    &:active {
      background-color: $--c-mobile-sidebar-background;
    }
  }

  &__corner {
    position: absolute;
    right: 0;
    z-index: 100;
    width: 8px;
    height: 8px;
    pointer-events: none;
    user-select: none;
    &__top {
      top: 0;
      transform: rotate(-90deg);
    }
    &__bottom {
      bottom: 0;
    }
  }
}
</style>
