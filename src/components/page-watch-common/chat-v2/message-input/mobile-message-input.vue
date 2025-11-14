<!-- 移动端聊天室输入框 -->
<template>
  <div class="c-mobile-chat-message-input">
    <viewer-input-control>
      <template #suffix>
        <!-- 更多 -->
        <mobile-more-entrance />

        <!-- 打赏 -->
        <mobile-donate-entrance />

        <!-- 商品库入口 -->
        <mobile-product-pendant v-if="interactSetting.productEnabled && iarSdkLoaded" />

        <!-- 点赞 -->
        <mobile-chat-like v-if="likeFeatureEnabled" />
      </template>
    </viewer-input-control>
  </div>
</template>

<script setup lang="ts">
import MobileChatLike from '@/components/page-watch-common/chat-v2/chat-like/index.vue';
import MobileDonateEntrance from '@/components/page-watch-common/donate/donate-entrance/mobile-donate-entrance.vue';
import MobileMoreEntrance from '@/components/page-watch-common/more-popup/mobile-more-entrance/mobile-more-entrance.vue';
import MobileProductPendant from '@/components/page-watch-common/product/product-pendant/mobile-product-pendant.vue';
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const PolyvChatUI = getChatUIV2Pkg();

const { ViewerInputControl } = PolyvChatUI;

const { likeFeatureEnabled } = storeDefinitionToRefs(useChatStore);

const { interactSetting, iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);
</script>

<style lang="scss">
.c-mobile-chat-message-input {
  padding: 12px 12px 24px;
}
</style>
