<!-- @file PC 端输入栏更多面板 -->
<template>
  <div class="c-pc-chat-input-controller__more-panel pws-pc-more-panel">
    <!-- 只看我和讲师 -->
    <div
      v-if="onlySpecialMsgWidgetVisible"
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

    <!-- 绑定手机号 -->
    <div
      v-if="bindMobileVisible"
      class="c-pc-chat-input-controller__more-panel__item pws-pc-more-panel-item"
      @click="onClickBindMobile"
    >
      <pc-icon-bind-mobile class="c-pc-chat-input-controller__more-panel__icon" />
      {{ $lang('identityInfo.bindMobile') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { appEvents, eventBus } from '@/app/app-events';
import { emitFunc } from '@/assets/utils/vue-utils/emit-utils';
import PcFormCheckbox from '@/components/common-base/form/form-checkbox/pc-form-checkbox.vue';
import { PcIconSetNick, PcIconBindMobile } from '@/components/component-icons/pc/map';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useIdentityStore } from '@/store/use-identity-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { storeToRefs } from 'pinia';

const emit = defineEmits({
  /** 关闭 */
  close: emitFunc<void>(),
});

const donateStore = useDonateStore();
const { donateAnimationVisible, showDonateGifts } = storeToRefs(donateStore);

const chatStore = useChatStore();
const { onlySpecialMsg, onlySpecialMsgWidgetVisible } = storeToRefs(chatStore);

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

const { bindMobileVisible } = storeDefinitionToRefs(useIdentityStore);

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

function onClickBindMobile() {
  eventBus.$emit(appEvents.global.OpenBindIdentityInfoDialog);
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
