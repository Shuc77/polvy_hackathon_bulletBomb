<!-- @file 竖屏输入框提问icon -->
<template>
  <div
    v-if="askMenuData.visible"
    class="c-portrait-ask-icon"
  >
    <template v-if="currentLang === LangType.ZH_CN">
      <mobile-origin-icon-question
        v-show="portraitMessageTabCurrentName === PortraitChatTabName.Chat"
        class="c-portrait-ask-icon__emotion"
        @click="onClickIcon(PortraitChatTabName.Ask)"
      />
      <mobile-origin-icon-question-active
        v-show="portraitMessageTabCurrentName === PortraitChatTabName.Ask"
        class="c-portrait-ask-icon__emotion"
        @click="onClickIcon(PortraitChatTabName.Chat)"
      />
    </template>
    <template v-else>
      <mobile-origin-icon-question-en
        v-show="portraitMessageTabCurrentName === PortraitChatTabName.Chat"
        class="c-portrait-ask-icon__emotion"
        @click="onClickIcon(PortraitChatTabName.Ask)"
      />
      <mobile-origin-icon-question-en-active
        v-show="portraitMessageTabCurrentName === PortraitChatTabName.Ask"
        class="c-portrait-ask-icon__emotion"
        @click="onClickIcon(PortraitChatTabName.Chat)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  MobileOriginIconQuestion,
  MobileOriginIconQuestionActive,
  MobileOriginIconQuestionEn,
  MobileOriginIconQuestionEnActive,
} from '@/components/component-icons/mobile-origin/map';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePortraitLayoutStore, PortraitChatTabName } from '@/store/use-portrait-layout-store';
import { PropUtils } from '@polyv/vue-components';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useLangStore } from '@/store/use-lang-store';
import { LangType } from '@/assets/lang/lang-enum';

const props = defineProps({
  fontSize: PropUtils.number.def(24),
});

const iconFontSize = computed(() => `${props.fontSize}px`);

const { askMenuData, chatMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const portraitLayoutStore = usePortraitLayoutStore();

const { portraitMessageTabCurrentName } = storeDefinitionToRefs(usePortraitLayoutStore);

const { currentLang } = storeDefinitionToRefs(useLangStore);

function onClickIcon(name: PortraitChatTabName) {
  if (name === PortraitChatTabName.Chat && !chatMenuData.value.visible) {
    return;
  }

  portraitLayoutStore.$patch({
    portraitMessageTabCurrentName: name,
  });
}
</script>

<style lang="scss">
.c-portrait-ask-icon {
  position: relative;
  display: flex;
  align-items: center;
}
.c-portrait-ask-icon__emotion {
  display: flex;
  align-items: center;
  /* stylelint-disable-next-line */
  font-size: v-bind(iconFontSize) !important;
  color: $--color-white;
}
</style>
