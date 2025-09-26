<!-- @file 竖屏字幕管理组件 -->
<template>
  <div
    class="c-portrait-subtitle-manager"
    v-if="liveSubtitlesEnable"
  >
    <!-- 字幕浮窗 -->
    <portrait-subtitle-float
      :visible.sync="subtitleFloatVisible"
      :display-mode="subtitleDisplayMode"
      @close="handleFloatClose"
    />

    <!-- 字幕设置弹窗 -->
    <portrait-subtitle-setting
      :visible.sync="subtitleSettingVisible"
      @close="handleSettingClose"
      @enable-subtitle-float="handleEnableSubtitleFloat"
    />

    <mobile-message-box
      ref="subtitleCloseTipsRef"
      content-center
      :title="$lang('portrait.subtitle.close.tips.title')"
      :content="$lang('portrait.subtitle.close.tips.content')"
      :confirm-button-text="$lang('base.enabled.off')"
      :cancel-button-text="$lang('base.cancel')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

import PortraitSubtitleFloat from '../portrait-subtitle-float/portrait-subtitle-float.vue';
import PortraitSubtitleSetting from '../portrait-subtitle-setting/portrait-subtitle-setting.vue';
import { MobileMessageBox, MessageBoxInstance } from '@/components/common-base/message-box';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { appEvents } from '@/app/app-events/use-app-events';

const { getEmitter } = useGlobalInject();

const { localUerSubtitlesEnable, liveSubtitlesEnable, subtitleDisplayMode } =
  storeDefinitionToRefs(useSubtitleStore);

// 浮窗显示状态
const subtitleFloatVisible = ref(false);
// 设置弹窗显示状态
const subtitleSettingVisible = ref(false);

/** 取消预约提示弹层实例 */
const subtitleCloseTipsRef = ref<MessageBoxInstance>();

// 监听字幕开关状态 - 只有用户主动启用时才显示浮窗
watch(
  [localUerSubtitlesEnable, liveSubtitlesEnable],
  ([localEnabled, liveEnabled]) => {
    if (localEnabled && liveEnabled) {
      subtitleFloatVisible.value = true;
    } else {
      subtitleFloatVisible.value = false;
    }
  },
  { immediate: true },
);

// // 显示关闭确认对话框
const showCloseConfirmDialog = async () => {
  // 这里可以使用 message-box 组件或其他确认对话框
  const confirmed = await subtitleCloseTipsRef.value?.$confirm();
  if (confirmed) {
    subtitleFloatVisible.value = false;
    // 同时关闭本地字幕开关
    const subtitleStore = useSubtitleStore();
    subtitleStore.changeLocalUerSubtitlesEnable(false);
  }
};

// 浮窗关闭处理
const handleFloatClose = () => {
  // 弹出二次确认
  showCloseConfirmDialog();
};

// 设置弹窗关闭处理
const handleSettingClose = () => {
  subtitleSettingVisible.value = false;
};

// 启用字幕浮窗显示
const handleEnableSubtitleFloat = () => {
  subtitleFloatVisible.value = true;
};

// 监听打开字幕设置事件
const handleOpenSubtitleSetting = () => {
  subtitleSettingVisible.value = true;
};

onMounted(() => {
  // 监听来自更多面板的事件
  getEmitter().on(appEvents.portrait.OpenSubtitleSettingPopup, handleOpenSubtitleSetting);
});
</script>
