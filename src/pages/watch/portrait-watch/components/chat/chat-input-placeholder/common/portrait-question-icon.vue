<!-- @file 竖屏输入框提问icon -->
<template>
  <!-- 提问 -->
  <div
    class="c-portrait-question"
    v-if="askMenuData.visible"
  >
    <mobile-icon-question
      v-show="portraitChatTab === PortraitChatTabType.Chat"
      class="c-portrait-question__emotion"
      @click="updatePortraitChatTabType(PortraitChatTabType.Ask)"
    />
    <mobile-icon-question-active
      v-show="portraitChatTab === PortraitChatTabType.Ask"
      class="c-portrait-question__emotion"
      @click="updatePortraitChatTabType(PortraitChatTabType.Chat)"
    />
    <mobile-icon-news
      v-if="portraitAskHasNews"
      class="c-portrait-question__news"
      size="38"
      @click.native="updatePortraitChatTabType(PortraitChatTabType.Ask)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  MobileIconQuestion,
  MobileIconQuestionActive,
  MobileIconNews,
} from '@/components/component-icons/mobile/map';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePortraitLayoutStore, PortraitChatTabType } from '@/store/use-portrait-layout-store';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';

const props = defineProps({
  fontSize: PropUtils.number.def(24),
});

const iconFontSize = computed(() => `${props.fontSize}px`);

const { updatePortraitChatTabType } = usePortraitLayoutStore();
const { askMenuData } = useChannelMenuStore();
const { portraitAskHasNews, portraitChatTab } = storeDefinitionToRefs(usePortraitLayoutStore);
</script>

<style lang="scss">
.c-portrait-question {
  position: relative;
  display: flex;
  align-items: center;
}
.c-portrait-question__emotion {
  display: flex;
  align-items: center;
  /* stylelint-disable-next-line */
  font-size: v-bind(iconFontSize);
  color: $--color-white;
}
.c-portrait-question__news {
  position: absolute;
  top: -25px;
  right: -24px;
}
</style>
