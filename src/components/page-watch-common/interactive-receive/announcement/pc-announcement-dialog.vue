<!-- @file PC 端公告弹层 -->
<template>
  <pc-dialog
    ref="dialogRef"
    class="c-pc-announcement-dialog"
    draggable
    :visible.sync="announcementVisible"
    :title="announcementTitle"
    :mask="false"
    :mount-el="dialogMountEl"
    :position-computed-elem="positionComputedElem"
    @closed="onCloseDialog"
  >
    <iar-pc-bulletin
      ref="announcementRef"
      :announcement-sdk="announcementSdk"
      @show-detail-from-socket="onShowDetailFromSocket"
      @hide="setAnnouncementVisible(false)"
      @title-change="onTitleChange"
      @has-bulletin="onHasBulletin"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import {
  PC_MAIN_PLAYER_SELECTOR,
  PC_PLAYER_FULL_SCREEN_SELECTOR,
} from '@/assets/constants/selector';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useAnnouncement } from './hooks/use-announcement';
import { useLayoutStore } from '@/store/use-layout-store';
import { DialogInstance } from '@/components/common-base/dialog/pc-dialog/types';

const IarPcBulletin = getIarComponent('PcBulletin');
// 弹层实例
const dialogRef = ref<DialogInstance>();

const {
  announcementRef,
  announcementSdk,
  announcementVisible,
  announcementTitle,
  onTitleChange,
  setAnnouncementVisible,
  onShowDetailFromSocket,
  onCloseDialog,
  onHasBulletin,
} = useAnnouncement();
const layoutStore = useLayoutStore();
/** 弹层渲染节点 */
const dialogMountEl = computed(() => {
  return layoutStore.isFullscreen ? PC_PLAYER_FULL_SCREEN_SELECTOR : '';
});

const positionComputedElem = computed(() => {
  return layoutStore.isFullscreen ? PC_PLAYER_FULL_SCREEN_SELECTOR : PC_MAIN_PLAYER_SELECTOR;
});
watch(
  () => layoutStore.isFullscreen,
  () => {
    nextTick(() => {
      if (dialogRef.value) {
        dialogRef.value.setMountEl();
        dialogRef.value.handleDocumentEventToReset();
      }
    });
  },
);
</script>
