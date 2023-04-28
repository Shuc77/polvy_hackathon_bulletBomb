<!-- @file 置顶公告 -->
<template>
  <iar-bulletin-top
    class="c-announcement-top"
    :announcement-sdk="announcementSdk"
    @show-detail="onShowDetail"
  />
</template>

<script setup lang="ts">
import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

const IarBulletinTop = getIarComponent('BulletinTop');

const watchCore = getWatchCore();
/** 公告 SDK 实例 */
const announcementSdk = watchCore.interactReceive.getAnnouncement();

function onShowDetail(data: unknown) {
  eventBus.$emit(appEvents.interaction.OpenAnnouncementDetail, data);
}
</script>
