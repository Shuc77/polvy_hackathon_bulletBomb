<script lang="tsx">
import { defineComponent, ref, type ExtractPropTypes } from 'vue';

import MobileSidebar from '../sidebar/mobile-sidebar.vue';
import MobileSidebarItem from '../sidebar-item/mobile-sidebar-item.vue';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import { MobileIconCheck } from '@/components/component-icons/mobile/map';

export type TreeSelectDataValue = string | number;

export type TreeSelectChild = {
  label: string;
  value: TreeSelectDataValue;
  disabled?: boolean;
};

export type TreeSelectItem = {
  label: string;
  value: TreeSelectDataValue;
  children?: TreeSelectChild[];
  disabled?: boolean;
  className?: unknown;
};

export const treeSelectProps = {
  items: PropUtils.array<TreeSelectItem>().def(),
  activeValues: PropUtils.array<TreeSelectDataValue>().def(),
};

export type TreeSelectProps = ExtractPropTypes<typeof treeSelectProps>;

/**
 * 和一般的 TreeSelect 组件不同，这个组件实际是类似级联的组件，目前只处理了两层
 */
export default defineComponent({
  name: 'MobileTreeSelect',

  components: {
    'mobile-icon-check': MobileIconCheck,
  },

  props: treeSelectProps,

  emits: ['click-nav', 'click-item', 'update:activeValues', 'finish'],

  setup(props, { emit, slots }) {
    const sidebarNavActiveIndex = ref(
      (() => {
        const itemVal = props.activeValues[0];
        const index = props.items.findIndex(i => i.value === itemVal);
        return index === -1 ? 0 : index;
      })(),
    );

    const isActiveItem = (itemVal: TreeSelectDataValue) => props.activeValues.includes(itemVal);

    const renderContentItem = (item: TreeSelectChild) => {
      const onClick = () => {
        if (item.disabled) return;

        const __activeValues = props.activeValues.slice();
        __activeValues.splice(1, 1, item.value);

        emit('update:activeValues', __activeValues);
        emit('click-item', item);
        emit('finish', __activeValues.slice());
      };

      return (
        <div
          key={item.value}
          class={{
            'g-singleline': true,
            'c-mobile-tree-select__item': true,
            'c-mobile-tree-select__item--active': isActiveItem(item.value),
            'c-mobile-tree-select__item--disabled': item.disabled,
          }}
          {...{
            on: {
              click: onClick,
            },
          }}>
          {item.label}
          {isActiveItem(item.value) && <mobile-icon-check class="c-mobile-tree-select__selected" />}
        </div>
      );
    };

    const onSidebarChange = (index: number) => {
      sidebarNavActiveIndex.value = index;
    };

    const onClickSidebarItem = (index: number) => {
      const item = props.items[index];
      emit('click-nav', { index, item });

      const __activeValues = props.activeValues.slice();
      __activeValues.splice(1, 0);
      emit('update:activeValues', [item.value]);

      const children = props.items[index].children;
      if (!children || (Array.isArray(children) && children.length === 0)) {
        emit('update:activeValues', [item.value]);
        emit('finish', [item.value]);
      }
    };

    const renderSidebar = () => {
      const Items = props.items.map(item => (
        <MobileSidebarItem
          class={['c-mobile-tree-select__nav-item', item.className]}
          disabled={item.disabled}
          {...{
            on: {
              click: onClickSidebarItem,
            },
          }}>
          <span slot="title">{slots['nav-text'] ? slots['nav-text'](item) : item.label}</span>
        </MobileSidebarItem>
      ));

      return (
        <MobileSidebar
          class="c-mobile-tree-select__nav"
          modelValue={sidebarNavActiveIndex.value}
          {...{
            on: {
              change: onSidebarChange,
            },
          }}>
          {Items}
        </MobileSidebar>
      );
    };

    const renderContent = () => {
      if (slots.content) {
        return slots.content();
      }

      const selected = props.items[sidebarNavActiveIndex.value] || {};
      if (selected.children) {
        return selected.children.map(renderContentItem);
      }
    };

    return () => (
      <div class="c-mobile-tree-select">
        {renderSidebar()}
        <div
          class="c-mobile-tree-select__content"
          key={sidebarNavActiveIndex.value}>
          {renderContent()}
        </div>
      </div>
    );
  },
});
</script>

<style lang="scss">
$--c-mobile-tree-select-font-size: 16px;
$--c-mobile-tree-select-nav-background: #f2f3f5;
$--c-mobile-tree-select-content-background: #fff;
$--c-mobile-tree-select-item-height: 56px;
$--c-mobile-tree-select-item-active-color: $--color-primary;
$--c-mobile-tree-select-item-disabled-color: #c8c9cc;
$--c-mobile-tree-select-item-selected-size: 24px;

.c-mobile-tree-select {
  position: relative;
  display: flex;
  height: 100%;
  min-height: 300px;
  font-size: $--c-mobile-tree-select-font-size;

  &__nav {
    flex: 1;
    overflow-y: auto;
    background: $--c-mobile-tree-select-nav-background;
    -webkit-overflow-scrolling: touch;
  }

  &__content {
    flex: 2;
    overflow-y: auto;
    background: $--c-mobile-tree-select-content-background;
    -webkit-overflow-scrolling: touch;
  }

  &__item {
    position: relative;
    padding: 0 48px 0 16px;
    font-weight: 500;
    line-height: $--c-mobile-tree-select-item-height;
    cursor: pointer;
    user-select: none;

    &--active {
      color: $--c-mobile-tree-select-item-active-color;
    }

    &--disabled {
      color: $--c-mobile-tree-select-item-disabled-color;
      cursor: not-allowed;

      &:active {
        background-color: transparent;
      }
    }
  }

  &__selected {
    position: absolute;
    right: 16px;
    font-size: $--c-mobile-tree-select-item-selected-size;
  }
}
</style>
