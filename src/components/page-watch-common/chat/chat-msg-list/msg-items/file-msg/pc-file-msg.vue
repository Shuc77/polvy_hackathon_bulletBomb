<!-- @file PC 端聊天室文件分享消息 -->
<template>
  <pc-msg-container
    class="c-pc-file-msg"
    :min-width="150"
  >
    <div
      class="c-pc-file-msg__content"
      @click="toDownloadFile"
    >
      <div
        ref="textWrapRef"
        class="c-pc-file-msg__content__name"
        :class="{
          'c-pc-file-msg__content__name--block': needBlock,
        }"
      >
        <div
          v-if="needBlock"
          class="c-pc-file-msg__content__name__suffix"
        >
          {{ fileSuffix }}
        </div>
        <div
          ref="textContentRef"
          class="c-pc-file-msg__content__name__text"
        >
          {{ fileName }}
        </div>
      </div>
      <div
        class="c-pc-file-msg__content__icon g-img-cover"
        :class="{
          'c-pc-file-msg__content__icon--doc': ['doc', 'docx'].includes(fileSuffix),
          'c-pc-file-msg__content__icon--ppt': ['ppt', 'pptx'].includes(fileSuffix),
          'c-pc-file-msg__content__icon--xls': ['xls', 'xlsx'].includes(fileSuffix),
          'c-pc-file-msg__content__icon--pdf': ['pdf'].includes(fileSuffix),
        }"
      ></div>
    </div>
  </pc-msg-container>
</template>

<script setup lang="ts">
import { TAB_NAME_CHAT } from '@/assets/constants/tab-name';
import { useLayoutStore } from '@/store/use-layout-store';
import { nextTick, watch } from 'vue';
import PcMsgContainer from '../_msg-container/pc-msg-container.vue';
import { useFileMsg, useFileNameBlock } from './use-file-msg';

const layoutStore = useLayoutStore();

const { fileName, fileSuffix, toDownloadFile } = useFileMsg();

const { textWrapRef, textContentRef, needBlock, checkNeedBlock } = useFileNameBlock();

watch(
  () => layoutStore.pcAsideTabCurrentName,
  async () => {
    if (layoutStore.pcAsideTabCurrentName === TAB_NAME_CHAT) {
      await nextTick();
      checkNeedBlock();
    }
  },
);
</script>

<style lang="scss">
$--file-icon-height: 38px;

.c-pc-file-msg__content {
  display: flex;
  align-items: center;
  padding: 4px;
  cursor: pointer;
}

.c-pc-file-msg__content__icon {
  flex-shrink: 0;
  width: 32px;
  height: $--file-icon-height;
  margin-left: 12px;
}

.c-pc-file-msg__content__name {
  flex: 1;
  max-height: $--file-icon-height;
  overflow: hidden;
  font-size: 14px;
}

.c-pc-file-msg__content__name__text {
  line-height: 19px;
}

.c-pc-file-msg__content__name--block::before {
  float: right;
  height: 19px;
  content: '';
}
.c-pc-file-msg__content__name__suffix {
  float: right;
  margin-left: -4px;
  clear: both;
  &::before {
    content: '....';
  }
}

.c-pc-file-msg__content__icon--doc {
  background-image: url(./imgs/icon_doc.svg);
}
.c-pc-file-msg__content__icon--ppt {
  background-image: url(./imgs/icon_ppt.svg);
}
.c-pc-file-msg__content__icon--xls {
  background-image: url(./imgs/icon_xls.svg);
}
.c-pc-file-msg__content__icon--pdf {
  background-image: url(./imgs/icon_pdf.svg);
}

// @media (max-width: 1280px) {
// }
</style>
