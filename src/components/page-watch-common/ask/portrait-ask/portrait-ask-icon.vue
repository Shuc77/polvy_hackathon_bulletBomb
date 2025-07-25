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

    <div
      v-if="askReminderVisible"
      class="c-portrait-ask-icon__news"
      @click.stop="onClickIcon(PortraitChatTabName.Ask)"
    >
      <span>{{ $lang('ask.news') }}</span>
    </div>
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
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useAskStore } from '@/store/use-ask-store';
import { useLangStore } from '@/store/use-lang-store';
import { LangType } from '@/assets/lang/lang-enum';

const props = defineProps({
  fontSize: PropUtils.number.def(24),
});

const iconFontSize = computed(() => `${props.fontSize}px`);

const { askMenuData, chatMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const portraitLayoutStore = usePortraitLayoutStore();

const { portraitMessageTabCurrentName } = storeDefinitionToRefs(usePortraitLayoutStore);

const { askReminderVisible } = storeDefinitionToRefs(useAskStore);

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
  font-size: v-bind(iconFontSize);
  color: $--color-white;
}
.c-portrait-ask-icon__news {
  position: absolute;
  top: -20px;
  left: 30%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  padding: 0 6px;
  font-size: 12px;
  line-height: 18px;
  color: #fff;
  white-space: nowrap;
  background: #ff5252;
  border-radius: 8px 8px 8px 0;
}
</style>
