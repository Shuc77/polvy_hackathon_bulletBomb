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
  </div>
</template>

<script setup lang="ts">
import { useInviteStore } from '@/store/use-invite-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import MobileInvitePosterEntry from '@/components/page-watch-common/invite/mobile-invite-poster-entry/mobile-invite-poster-entry.vue';
import { TAB_NAME_QA } from '@/assets/constants/tab-name';

const { mobileWatchInvitePendantVisible } = storeDefinitionToRefs(useInviteStore);

const { mobileMenuCurrentName } = storeDefinitionToRefs(useLayoutStore);
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
</style>
