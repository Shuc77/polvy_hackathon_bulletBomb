<!-- @file 竖屏问答弹层 -->
<template>
  <mobile-popup
    class="c-portrait-question-answer-popup"
    :visible.sync="visible"
    fill-body-section
    hide-header-border
    :title="qaMenuData.label"
  >
    <mobile-question-answer
      theme="white"
      :question-answer-sdk="questionAnswerSdk"
      @preview="onPreviewImage"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import MobileQuestionAnswer from './mobile-question-answer.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useQuestionAnswer } from './hooks/use-question-answer';

const { visible, setVisible } = useSimpleVisible();

const { qaMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const { questionAnswerSdk, onPreviewImage } = useQuestionAnswer();

useEventBusListener(appEvents.interaction.OpenQuestionAnswer, (_visible = true) => {
  setVisible(_visible);
});
</script>

<style lang="scss">
.c-portrait-question-answer-popup {
  .plv-ia-qa--mob {
    .plv-ia-qa-ask__entry {
      background-color: transparent;
      background-image: url(./imgs/icon-btn-edit.png);
      background-size: contain;
    }
    .plv-ia-multiline__expand-btn {
      color: #ffa611;
    }

    .plv-ia-multiline__expand-btn__wrap {
      background-color: #fff;
    }

    .plv-ia-multiline__expand-btn__arrow {
      border-color: #ffa611;
    }

    .plv-ia-qa-news {
      width: 108px;
      height: 28px;
      line-height: 28px;
      background: rgba(#ffa611, 0.8);
    }

    .plv-ia-qa-select__options__bg,
    .plv-ia-qa-select__options__wrap {
      z-index: 100;
    }
  }
  .plv-ia-qa--white.plv-ia-qa--mob {
    &.plv-ia-qa {
      background: rgba(0, 0, 0, 0.04);
    }
    .plv-ia-qa-filter,
    .plv-ia-qa-answer__item,
    .plv-ia-qa-question {
      background-color: #fff;
    }
    .plv-ia-qa-question__main {
      font-size: 16px;
    }
    .plv-ia-qa-answer-info,
    .plv-ia-qa-list-tips,
    .plv-ia-qa-question-info {
      color: #999;
    }
    .plv-ia-qa-ask__ctrl {
      background: #ebebeb;
    }
    .plv-ia-qa-ask-input {
      background: #fff;
    }
    .plv-ia-qa-ask-send {
      font-size: 14px;
      color: #ffa611;
    }
    .plv-ia-qa-ask-emotion {
      background-image: url(./imgs/icon-emotion-black.png);
      &::before {
        content: '';
      }
    }
    .plv-ia-multiline__expand-btn__ellipsis {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0), #fff);
    }
  }
}
.pws-iar-icon-qa-ask-emotion-icon {
  path {
    fill: black;
  }
}
</style>
