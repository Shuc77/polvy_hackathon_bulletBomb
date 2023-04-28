<!-- @file PC 端公告弹层 -->
<template>
  <pc-dialog
    class="c-pc-announcement-dialog"
    draggable
    :visible.sync="announcementVisible"
    :title="announcementTitle"
    :mask="false"
    :position-computed-elem="PC_MAIN_PLAYER_SELECTOR"
    @closed="onCloseDialog"
  >
    <iar-pc-bulletin
      ref="announcementRef"
      :announcement-sdk="announcementSdk"
      @show-detail-from-socket="onShowDetailFromSocket"
      @hide="setAnnouncementVisible(false)"
      @title-change="onTitleChange"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import { PC_MAIN_PLAYER_SELECTOR } from '@/assets/constants/selector';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useAnnouncement } from './hooks/use-announcement';

const IarPcBulletin = getIarComponent('PcBulletin');

const {
  announcementRef,
  announcementSdk,
  announcementVisible,
  announcementTitle,
  onTitleChange,
  setAnnouncementVisible,
  onShowDetailFromSocket,
  onCloseDialog,
} = useAnnouncement();
</script>
