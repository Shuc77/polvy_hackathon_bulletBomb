<!-- @file 置顶公告 -->
<template>
  <iar-bulletin-top
    class="c-announcement-top"
    :announcement-sdk="announcementSdk"
    @show-detail="onShowDetail"
  />
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useGlobalInject } from '@/app/use-global-inject';

const IarBulletinTop = getIarComponent('BulletinTop');

const { getEmitter, getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();
/** 公告 SDK 实例 */
const announcementSdk = watchCore.interactReceive.getAnnouncement();

function onShowDetail(data: unknown) {
  getEmitter().emit(appEvents.interaction.OpenAnnouncementDetail, data);
}
</script>
