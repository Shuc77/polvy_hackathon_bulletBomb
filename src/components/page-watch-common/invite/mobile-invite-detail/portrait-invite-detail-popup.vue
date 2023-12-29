<!-- @file 移动端竖屏-邀请明细弹层 -->

<template>
  <mobile-popup
    class="c-portrait-invite-detail-popup"
    :title="$lang('invite.detail.popup.title')"
    :visible.sync="popupVisible"
    backable
    :closable="false"
    append-to-body
    ignore-content-max-height
    :content-percent-height="0.784"
    @click-back="handleClosePopup"
    @body-scroll="handleScroll"
  >
    <div class="c-portrait-invite-detail-popup__content">
      <div class="c-portrait-invite-detail-popup__content__title">
        <span>{{ $lang('invite.detail.viewer.name') }}</span>
        <span>{{ $lang('invite.detail.viewer.accessTime') }}</span>
      </div>
      <div
        v-for="item in totalInviteDetailList"
        :key="item.openId"
        class="c-portrait-invite-detail-popup__content__list__item"
      >
        <!-- 头像 -->
        <img
          :src="item.avatar || plvDefaultResource.defaultViewerAvatar"
          :alt="item.nickname"
          class="c-portrait-invite-detail-popup__content__list__item__avatar"
        />
        <!-- 昵称 -->
        <p class="c-portrait-invite-detail-popup__content__list__item__nick g-singleline">
          {{ item.nickname }}
        </p>
        <!-- 进入时间 -->
        <div class="c-portrait-invite-detail-popup__content__list__item__access-time">
          {{ formatDate(item.createdTime, 'YYYY.MM.DD hh:mm:ss') }}
        </div>
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { appEvents, useEventBusListener } from '@/app/app-events';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { useInviteDetail } from './use-invite-detail';
import { formatDate } from '@polyv/utils/es/date';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useCommonStore } from '@/store/use-common-store';

const { plvDefaultResource } = storeDefinitionToRefs(useCommonStore);

const {
  totalInviteDetailList,

  initInviteDetail,
  handleScroll,
} = useInviteDetail();

const popupVisible = ref(false);
useEventBusListener(appEvents.invite.OpenInviteDetail, async () => {
  popupVisible.value = true;
  initInviteDetail();
});

function handleClosePopup() {
  popupVisible.value = false;
}
</script>

<style lang="scss">
.c-portrait-invite-detail-popup {
  width: 100%;
}

.c-portrait-invite-detail-popup__content__title {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  margin-top: 12px;
  font-size: 12px;
  color: #adadc0;
}

.c-portrait-invite-detail-popup__content__list__item {
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: 0 16px;
  color: #adadc0;
}

.c-portrait-invite-detail-popup__content__list__item__avatar {
  width: 32px;
  height: 32px;
  margin-right: 16px;
  border: 2px solid transparent;
  border-radius: 50%;
}

.c-portrait-invite-detail-popup__content__list__item__nick {
  flex: 1;
  margin-right: 16px;
  font-size: 16px;
  line-height: 56px;
  color: #333333;
}

.c-portrait-invite-detail-popup__content__list__item__access-time {
  font-size: 12px;
}
</style>
