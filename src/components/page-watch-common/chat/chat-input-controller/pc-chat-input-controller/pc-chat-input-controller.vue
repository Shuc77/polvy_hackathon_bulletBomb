<!-- @file PC 端聊天室底部输入框区域 -->
<template>
  <div class="c-pc-chat-input-controller">
    <pc-msg-input-wrap
      ref="msgInputWrapRef"
      :placeholder="chatInputPlaceholder"
      :disabled-input="chatInputDisabled"
      :disabled-emotion-picker="chatInputDisabled"
      :send-image-enabled="chatSetting.viewerSendImgEnabled"
      :disabled-send-image="chatInputDisabled"
      :image-paste-input-enabled="imagePasteInputEnabled"
      :face-emotion-enabled="chatSetting.faceEmotionEnabled"
      :image-emotion-enabled="chatSetting.imageEmotionEnabled"
      @system-msg="onSendSystemMsg"
      @submit="onSubmitMessage"
      @click-send-image="onClickSendImage"
      @click-input-wrap="checkNeedRealNameAuth"
      @click-image-emotion-enter="checkNeedRealNameAuth"
      @click-send-image-enter="checkNeedRealNameAuth"
    >
      <!-- 面板区插槽 -->
      <template #panel-suffix>
        <!-- 打赏面板 -->
        <div
          v-if="showDonateFunction"
          v-show="donateVisible"
          ref="donatePanelRef"
          class="c-pc-chat-input-controller__donate-panel"
        >
          <pc-donate-panel @donate-finish="hideDonatePanel" />
        </div>

        <!-- 更多面板 -->
        <div
          v-show="moreVisible"
          ref="morePanelRef"
          class="c-pc-chat-input-controller__more-panel-wrap"
        >
          <pc-more-panel @close="hideMorePanel" />
        </div>
      </template>

      <!-- 图标区插槽 -->
      <template #icon-suffix>
        <!-- 公告 -->
        <div
          v-if="announcementFunctionVisible"
          class="c-pc-msg-input-wrap__icons__item pws-pc-msg-bottom-input-wrap-item"
          @click="onClickAnnouncement"
        >
          <pc-icon-bulletin class="c-pc-msg-input-wrap__icons__item__icon" />
        </div>

        <div style="margin-left: auto"></div>

        <!-- 我的奖励 -->
        <div
          class="c-pc-msg-input-wrap__icons__item c-pc-chat-input-controller__personal-reward-button"
          @click="onClickPersonalReward"
        ></div>

        <!-- 打赏 -->
        <div
          v-if="showDonateFunction"
          class="c-pc-msg-input-wrap__icons__item c-pc-chat-input-controller__donate-button pws-pc-msg-bottom-input-wrap-item"
          data-donate
          @click="onClickDonateEnter"
        ></div>

        <!-- 更多 -->
        <div
          class="c-pc-msg-input-wrap__icons__item c-pc-chat-input-controller__more pws-pc-msg-bottom-input-wrap-item"
          data-more
          @click="toggleMorePanel"
        >
          {{ $lang('base.more') }}
          <span>...</span>
        </div>
      </template>
    </pc-msg-input-wrap>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { appEvents, useEventBusListener } from '@/app/app-events';
import { isIE } from '@/assets/utils/browser';

import { useGlobalInject } from '@/app/use-global-inject';
import { PcIconBulletin } from '@/components/component-icons/pc/map';
import PcDonatePanel from '@/components/page-watch-common/donate/donate-panel/pc-donate-panel/pc-donate-panel.vue';
import PcMsgInputWrap from '@/components/page-watch-common/msg-input-wrap/pc-msg-input-wrap/pc-msg-input-wrap.vue';
import { usePanelVisible } from '@/hooks/behaviors/use-panel-visible';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useChatInputController } from '../hooks/use-chat-input-controller';
import PcMorePanel from './input-more-panel.vue';

const viewerStore = useViewerStore();
const checkNeedRealNameAuth = viewerStore.checkNeedRealNameAuth;

const { getEmitter } = useGlobalInject();

const {
  msgInputWrapRef,
  focusMsgInput,

  onSendSystemMsg,
  onSubmitMessage,
  onClickSendImage,
} = useChatInputController();

useEventBusListener(appEvents.chat.FocusToChatInput, () => {
  focusMsgInput();
});

const { chatInputPlaceholder, chatInputDisabled, chatSetting } =
  storeDefinitionToRefs(useChatStore);

/** 是否使用图片粘贴输入框 */
const imagePasteInputEnabled = computed(() => {
  if (isIE) return false;
  return chatSetting.value.viewerSendImgEnabled;
});

const { showDonateFunction } = storeDefinitionToRefs(useDonateStore);

// 打赏面板显示交互
const donatePanelRef = ref<HTMLDivElement>();
const {
  visible: donateVisible,
  togglePanel: toggleDonatePanel,
  showPanel: showDonatePanel,
  hidePanel: hideDonatePanel,
} = usePanelVisible([donatePanelRef, '[data-donate]']);

useEventBusListener(appEvents.donate.OpenDonatePopup, showDonatePanel);

function onClickDonateEnter() {
  const result = checkNeedRealNameAuth();
  if (result) {
    return;
  }

  toggleDonatePanel();
}

// 点击我的奖励
function onClickPersonalReward() {
  getEmitter().emit(appEvents.global.OpenPersonalRewardDialog);
}

// 更多面板显示交互
const morePanelRef = ref<HTMLDivElement>();
const {
  visible: moreVisible,
  togglePanel: toggleMorePanel,
  hidePanel: hideMorePanel,
} = usePanelVisible([morePanelRef, '[data-more]']);

const { announcementFunctionVisible } = storeDefinitionToRefs(useInteractReceiveStore);

// 公告交互
function onClickAnnouncement() {
  getEmitter().emit(appEvents.interaction.OpenAnnouncementList, true);
}
</script>

<style lang="scss">
.c-pc-chat-input-controller {
  position: relative;
  z-index: 20;
}
.c-pc-chat-input-controller__donate-panel {
  height: 232px;
}
.c-pc-chat-input-controller__donate-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;

  &::after {
    display: block;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    content: '';
    background-image: url(../imgs/icon-reward.png);
    background-size: 100% 100%;
  }

  &:hover::after {
    animation: scale-animation 0.35s ease-in;
  }
  &:active::after {
    transition: all 0.05s ease-in;
    transform: scale(1.2);
  }
}

.c-pc-chat-input-controller__personal-reward-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;

  &::after {
    display: block;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    content: '';
    background-image: url(../imgs/icon-task-activity.svg);
    background-size: 100% 100%;
  }

  &:hover::after {
    animation: scale-animation 0.35s ease-in;
  }
  &:active::after {
    transition: all 0.05s ease-in;
    transform: scale(1.2);
  }
}

@media screen and (max-width: 1680px) {
  .c-pc-chat-input-controller__donate-button {
    margin-right: 12px;
    margin-left: 2px;
  }
}

.c-pc-chat-input-controller__more {
  margin-right: -10px;
  user-select: none;

  span {
    display: inline-block;
    transform: rotate(90deg);
  }
}

.c-pc-chat-input-controller__more-panel-wrap {
  position: absolute;
  right: 0;
  bottom: 0;
  background: inherit;
}

.c-pc-chat-input-controller__file-button {
  width: 20px;
  height: 20px;
  font-size: 20px;
}
</style>
