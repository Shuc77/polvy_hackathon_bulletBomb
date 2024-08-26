<script lang="tsx">
import { defineComponent, type InjectionKey, type ExtractPropTypes } from 'vue';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import { useChildren } from '@/hooks/core/use-vue/use-children';

export type SidebarProvide = {
  getActive: () => number;
  // eslint-disable-next-line no-unused-vars
  setActive: (value: number) => void;
};

export const SIDEBAR_KEY: InjectionKey<SidebarProvide> = Symbol('MobileSidebar');

export const sidebarProps = {
  modelValue: PropUtils.number.def(0),
};

export type SidebarProps = ExtractPropTypes<typeof sidebarProps>;

export default defineComponent({
  name: 'MobileSidebar',

  props: sidebarProps,

  emits: ['change', 'update:modelValue'],

  setup(props, { emit, slots }) {
    const { linkChildren } = useChildren(SIDEBAR_KEY);

    const getActive = () => +props.modelValue;

    const setActive = (value: number) => {
      if (value !== getActive()) {
        emit('update:modelValue', value);
        emit('change', value);
      }
    };

    linkChildren({
      getActive,
      setActive,
    });

    return () => (
      <div
        role="tablist"
        class="c-mobile-sidebar">
        {slots.default?.()}
      </div>
    );
  },
});
</script>

<style lang="scss">
.c-mobile-sidebar {
  width: 80px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
