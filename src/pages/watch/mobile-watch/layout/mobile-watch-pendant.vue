<!-- @file 移动端页面常驻挂件 -->
<template>
  <div
    class="c-mobile-watch-pendant"
    :class="{
      'c-mobile-watch-pendant--qa': mobileMenuCurrentName === TAB_NAME_QA,
      'c-mobile-watch-pendant--seat': mobileMenuCurrentName === TAB_NAME_SEAT,
    }"
  >
    <!-- 邀请海报 -->
    <mobile-invite-poster-entry
      v-if="mobileWatchInvitePendantVisible"
      class="c-mobile-watch-pendant__item"
    />

    <!-- 更多 -->
    <div
      v-if="morePendantVisible"
      class="c-mobile-watch-pendant__item c-mobile-watch-pendant__item--more pws-mobile-more-button"
      @click="showMorePopup"
    ></div>

    <!-- 云席挂件 -->
    <mobile-seat-table-pendant
      v-if="mobileMenuCurrentName === TAB_NAME_SEAT"
      class="c-mobile-watch-pendant__item"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, unref } from 'vue';
import { appEvents, eventBus } from '@/app/app-events';

import { useInviteStore } from '@/store/use-invite-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import MobileSeatTablePendant from '@/components/page-watch-common/interactive-receive/seat-table/seat-table-pendant/mobile-seat-table-pendant.vue';
import MobileInvitePosterEntry from '@/components/page-watch-common/invite/mobile-invite-poster-entry/mobile-invite-poster-entry.vue';

import { TAB_NAME_QA, TAB_NAME_SEAT } from '@/assets/constants/tab-name';

const { mobileWatchInvitePendantVisible } = storeDefinitionToRefs(useInviteStore);

const { mobileMenuCurrentName } = storeDefinitionToRefs(useLayoutStore);

const { chatMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const morePendantVisible = computed(() => {
  return !unref(chatMenuData).visible;
});

function showMorePopup() {
  eventBus.$emit(appEvents.global.OpenMobileMorePopup, true);
}
</script>

<style lang="scss">
.c-mobile-watch-pendant {
  position: absolute;
  right: 16px;
  bottom: 86px;
  z-index: $--zIndex-pendant;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.c-mobile-watch-pendant--qa {
  bottom: 128px;
}

.c-mobile-watch-pendant--seat {
  bottom: 48px;
}

.c-mobile-watch-pendant {
  margin-top: 12px;
}

.c-mobile-watch-pendant__item + .c-mobile-watch-pendant__item {
  margin-top: 12px;
}

.c-mobile-watch-pendant__item--more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;

  &::after {
    width: 20px;
    height: 20px;
    content: '';
    background-size: 100% 100%;
  }
}
</style>
