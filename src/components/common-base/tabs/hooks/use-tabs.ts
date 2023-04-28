/**
 * @file 标签页 Tabs hook
 */

import { eventBus } from '@/app/app-events';
import { useVue } from '@/hooks/core/use-vue';
import { emitFunc, VueEmit } from '@/assets/utils/vue-utils/emit-utils';
import { PropUtils, useProps, VueProps } from '@/assets/utils/vue-utils/props-utils';
import {
  inject,
  InjectionKey,
  nextTick,
  onMounted,
  onUpdated,
  provide,
  ref,
  unref,
  watch,
} from 'vue';
import {
  TabNameType,
  TabPaneDataItem,
  TabPaneInstance,
  TabsInjectContext,
  TabsInstance,
} from './types';
import { isTabPaneInstance } from './use-tab-pane';

export const tabsProps = () => ({
  /** 激活的面板 name */
  value: PropUtils.oneOfType<TabNameType>([String, Number]).def(''),
});

export const tabsEmits = () => ({
  input: emitFunc<TabNameType>(),
});

export const TABS_PROVIDE_KEY: InjectionKey<TabsInjectContext> = Symbol('tabsProvideKey');

export const useTabsProvide = (context: TabsInjectContext) => {
  provide(TABS_PROVIDE_KEY, context);
};

export const useTabsInject = (): TabsInjectContext => {
  return inject(TABS_PROVIDE_KEY) as TabsInjectContext;
};

/** 标签页 tabs hook */
export const useTabs = (options: {
  props: VueProps<typeof tabsProps>;
  emit: VueEmit<typeof tabsEmits>;
  switchEvent?: string;
}) => {
  const { props, emit } = options;
  const { value } = useProps(props);
  const { getSlot } = useVue();

  /** 上一次激活的面板 name */
  const prevTabName = ref<TabNameType>('');
  /** 当前激活的面板 name */
  const currentTabName = ref<TabNameType>('');
  /** 上一刻激活的面板索引 */
  const prevTabIndex = ref(-1);
  /** 当前激活的面板索引 */
  const currentTabIndex = ref(-1);
  /** 面板数据列表 */
  const tabPaneData = ref<TabPaneDataItem[]>([]);

  /** 设置当前激活的面板 */
  function setCurrentTab(name: TabNameType) {
    if (name === unref(currentTabName)) {
      return;
    }
    const newIndex = unref(tabPaneData).findIndex(paneData => paneData.name === name);

    if (newIndex === -1) {
      return;
    }

    prevTabName.value = unref(currentTabName);
    prevTabIndex.value = unref(currentTabIndex);

    currentTabName.value = name;
    currentTabIndex.value = newIndex;

    emit('input', name);

    if (options.switchEvent) {
      eventBus.$emit(options.switchEvent, name);
    }
  }

  /** 切到下一个 tab */
  function toNextTab() {
    // 已是最后一个
    if (currentTabIndex.value >= tabPaneData.value.length - 1) {
      return;
    }
    const nextTabData = tabPaneData.value[currentTabIndex.value + 1];
    nextTabData && setCurrentTab(nextTabData.name);
  }

  /** 切到上一个 tab */
  function toPrevTab() {
    // 已是最后一个
    if (currentTabIndex.value <= 0) {
      return;
    }
    const prevTabData = tabPaneData.value[currentTabIndex.value - 1];
    prevTabData && setCurrentTab(prevTabData.name);
  }

  watch(
    () => unref(value),
    () => setCurrentTab(unref(value)),
  );

  /** 获取面板实例对象 */
  function getTabPaneInstances() {
    const defaultSlot = getSlot();

    const instances: TabPaneInstance[] = [];

    defaultSlot.forEach(vNode => {
      const instance = vNode.componentInstance;
      if (isTabPaneInstance(instance)) {
        instances.push(instance);
      }
    });

    return instances;
  }

  /** 获取标签面板数据 */
  function getTabPaneData() {
    const panes: TabPaneDataItem[] = [];
    const instances = getTabPaneInstances();

    instances.forEach(instance => {
      const panelData = instance.getTabPaneData();
      panes.push(panelData);
    });

    return panes;
  }

  /** 更新标签面板数据 */
  async function updateTabPaneData() {
    await nextTick();
    const panes = getTabPaneData();
    const paneDataVal = unref(tabPaneData);

    // 是否需要更新 tab 面板数据
    let shouldUpdateTabPaneData = false;
    // 是否需要重置到第一个 tab
    let shouldSetFirstTab = false;

    if (panes.length !== paneDataVal.length) {
      shouldUpdateTabPaneData = true;
    } else {
      panes.forEach((paneData, index) => {
        const oldItem = paneDataVal[index];
        for (const key in paneData) {
          const field = key as keyof TabPaneDataItem;
          if (paneData[field] !== oldItem[field]) {
            shouldUpdateTabPaneData = true;
          }
        }
      });
    }

    if (shouldUpdateTabPaneData) {
      if (panes.length !== tabPaneData.value.length) {
        shouldSetFirstTab = true;
      }
      tabPaneData.value = panes;
    }

    const currentIndex = panes.findIndex(paneData => paneData.name === unref(currentTabName));
    if (currentIndex === -1 && panes.length) {
      shouldSetFirstTab = true;
    }

    if (shouldSetFirstTab) {
      setCurrentTab(panes[0].name);
    }
  }

  onMounted(() => {
    updateTabPaneData();
  });

  onUpdated(() => {
    updateTabPaneData();
  });

  useTabsProvide({
    prevTabName,
    currentTabName,
    prevTabIndex,
    currentTabIndex,
    tabPaneData,
    setCurrentTab,
    toNextTab,
    toPrevTab,
  });

  const tabsInstance: TabsInstance = {
    currentTabName,
    setCurrentTab,
  };

  return {
    prevTabName,
    currentTabName,
    prevTabIndex,
    currentTabIndex,
    setCurrentTab,
    toNextTab,
    toPrevTab,

    tabPaneData,
    getTabPaneData,
    updateTabPaneData,
    tabsInstance,
  };
};
