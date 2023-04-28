<!-- @file PC 端输入栏更多面板 -->
<template>
  <div class="c-pc-chat-input-controller__more-panel pws-pc-more-panel">
    <!-- 只看我和讲师 -->
    <div
      v-if="!filterManagerMsgEnabled"
      class="c-pc-chat-input-controller__more-panel__item pws-pc-more-panel-item"
      @click="onClickSpecialMsg"
    >
      <pc-form-checkbox :checked="onlySpecialMsg">
        {{ $lang('chat.onlyHost') }}
      </pc-form-checkbox>
    </div>

    <!-- 屏蔽特效 -->
    <div
      v-if="showDonateGifts"
      class="c-pc-chat-input-controller__more-panel__item pws-pc-more-panel-item"
      @click="onClickDonateAnimation"
    >
      <pc-form-checkbox :checked="!donateAnimationVisible">
        {{ $lang('donate.hideAnimation') }}
      </pc-form-checkbox>
    </div>

    <!-- 设置昵称 -->
    <div
      v-if="canSetNick"
      class="c-pc-chat-input-controller__more-panel__item pws-pc-more-panel-item"
      @click="onClickSetNick"
    >
      <pc-icon-set-nick class="c-pc-chat-input-controller__more-panel__icon" />
      {{ $lang('chat.setNick') }}
    </div>

    <!-- 投诉反馈 -->
    <div
      v-if="watchFeedbackEnabled"
      class="c-pc-chat-input-controller__more-panel__item pws-pc-more-panel-item"
      @click="onClickFeedback"
    >
      <pc-icon-feedback class="c-pc-chat-input-controller__more-panel__icon" />
      {{ $lang('interact.feedBack.title') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { PcIconFeedback, PcIconSetNick } from '@/components/component-icons/pc/map';
import PcFormCheckbox from '@/components/common-base/form/form-checkbox/pc-form-checkbox.vue';
import { useChatStore } from '@/store/use-chat-store';
import { useDonateStore } from '@/store/use-donate-store';
import { storeToRefs } from 'pinia';
import { appEvents, eventBus } from '@/app/app-events';
import { emitFunc } from '@/assets/utils/vue-utils/emit-utils';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useViewerStore } from '@/store/use-viewer-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const emit = defineEmits({
  /** 关闭 */
  close: emitFunc<void>(),
});

const donateStore = useDonateStore();
const { donateAnimationVisible, showDonateGifts } = storeToRefs(donateStore);

const chatStore = useChatStore();
const { onlySpecialMsg, filterManagerMsgEnabled } = storeToRefs(chatStore);

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

const { watchFeedbackEnabled } = storeDefinitionToRefs(useInteractReceiveStore);

function onClickSpecialMsg() {
  chatStore.toggleOnlySpecialMsg();
}

function onClickDonateAnimation() {
  donateStore.toggleDonateAnimationVisible();
}

function onClickSetNick() {
  eventBus.$emit(appEvents.chat.OpenSetNick, true);
  emit('close');
}

function onClickFeedback() {
  eventBus.$emit(appEvents.interaction.OpenFeedBack, true);
  emit('close');
}
</script>

<style lang="scss">
.c-pc-chat-input-controller__more-panel {
  box-sizing: border-box;
  width: 140px;
  padding: 0 16px;
}

.c-pc-chat-input-controller__more-panel__item {
  display: flex;
  align-items: center;
  height: 40px;
  line-height: 40px;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: #78a7ed;
  }
}

.c-pc-chat-input-controller__more-panel__icon {
  display: flex;
  margin-right: 6px;
  font-size: 16px !important;
}
</style>
