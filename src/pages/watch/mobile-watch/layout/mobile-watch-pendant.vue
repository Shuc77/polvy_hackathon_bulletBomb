<!-- @file 移动端页面常驻挂件 -->
<template>
  <div
    class="c-mobile-watch-pendant"
    :class="{
      'c-mobile-watch-pendant--qa': mobileMenuCurrentName === TAB_NAME_QA,
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
  </div>
</template>

<script setup lang="ts">
import { useInviteStore } from '@/store/use-invite-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import MobileInvitePosterEntry from '@/components/page-watch-common/invite/mobile-invite-poster-entry/mobile-invite-poster-entry.vue';
import { TAB_NAME_QA } from '@/assets/constants/tab-name';
import { computed, unref } from 'vue';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { appEvents, eventBus } from '@/app/app-events';

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
}

.c-mobile-watch-pendant--qa {
  bottom: 128px;
}

.c-mobile-watch-pendant {
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
