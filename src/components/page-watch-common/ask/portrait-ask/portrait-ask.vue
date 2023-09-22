<template>
  <div class="c-portrait-ask">
    <ask-comp-portrait
      ref="askCompPortraitRef"
      :slogan="askWelcomeText"
      :ask-sdk="askSdk"
      :lang="currentLang"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLangStore } from '@/store/use-lang-store';
import { useAskStore } from '@/store/use-ask-store';
import { PortraitChatTabName, usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import AskCompPortrait from '@polyv/chat-sdk-ui-ask-question/lib/MobileAskPortrait';
import { useAskReminder, useAskSdk } from '../hooks/use-ask';

const { askSdk } = useAskSdk();

const { askWelcomeText } = storeDefinitionToRefs(useAskStore);

const { currentLang } = storeDefinitionToRefs(useLangStore);

const { updateAskReminderVisible } = useAskReminder({
  onAskMsg: () => {
    const portraitLayoutStore = usePortraitLayoutStore();
    updateAskReminderVisible(
      portraitLayoutStore.portraitMessageTabCurrentName !== PortraitChatTabName.Ask,
    );
  },
});

const askCompPortraitRef = ref();
</script>

<style lang="scss">
.c-portrait-ask {
  width: 100%;
  height: 100%;
  -webkit-mask-image: -webkit-gradient(
    linear,
    center top,
    center bottom,
    color-stop(0, transparent),
    color-stop(0.2, #000)
  );
  mask-image: none;

  // 覆盖内部样式
  .plv-chatroom-aq {
    background-color: transparent;
  }
  .plv-chatroom-aq__bottom {
    display: none;
  }
  .plv-chatroom-aq__new-message {
    left: 0;
  }
  .plv-chatroom-aq__list__main {
    padding: 0;
  }
}
</style>
