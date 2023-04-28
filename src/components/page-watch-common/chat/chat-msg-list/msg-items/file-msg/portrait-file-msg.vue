<!-- @file 竖屏端聊天室文件分享消息 -->
<template>
  <portrait-msg-container
    class="c-portrait-file-msg"
    hide-user-info
    @click-container="toDownloadFile"
  >
    <div
      ref="textWrapRef"
      class="c-portrait-file-msg__content-wrap"
    >
      <div
        ref="textContentRef"
        class="c-portrait-file-msg__content-inner"
        :class="{
          'c-portrait-file-msg__content-inner--block': needBlock,
        }"
      >
        <portrait-msg-user-info />
        <div
          v-if="needBlock"
          class="c-portrait-file-msg__content-suffix"
        >
          {{ fileSuffix }}
        </div>
        <span>{{ fileName }}</span>
      </div>
    </div>

    <template #msg-right>
      <div
        class="c-portrait-file-msg__icon g-img-cover"
        :class="{
          'c-portrait-file-msg__icon--doc': ['doc', 'docx'].includes(fileSuffix),
          'c-portrait-file-msg__icon--ppt': ['ppt', 'pptx'].includes(fileSuffix),
          'c-portrait-file-msg__icon--xls': ['xls', 'xlsx'].includes(fileSuffix),
          'c-portrait-file-msg__icon--pdf': ['pdf'].includes(fileSuffix),
        }"
      ></div>
    </template>
  </portrait-msg-container>
</template>

<script setup lang="ts">
import PortraitMsgUserInfo from '../_msg-user-info/portrait-msg-user-info.vue';
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';
import { useFileMsg, useFileNameBlock } from './use-file-msg';

const { fileName, fileSuffix, toDownloadFile } = useFileMsg();

const { textWrapRef, textContentRef, needBlock } = useFileNameBlock();
</script>

<style lang="scss">
$--file-icon-height: 38px;

.c-portrait-file-msg {
  line-height: 18px;
}

.c-portrait-file-msg__content-wrap {
  max-height: $--file-icon-height;
  overflow: hidden;
}

.c-portrait-file-msg__content-inner--block::before {
  float: right;
  height: 19px;
  content: '';
}

.c-portrait-file-msg__content-suffix {
  float: right;
  margin-left: -4px;
  clear: both;
  &::before {
    content: '....';
  }
}

.c-portrait-file-msg__icon {
  flex-shrink: 0;
  width: 32px;
  height: $--file-icon-height;
  margin-right: -5px;
  margin-left: 5px;
}
.c-portrait-file-msg__icon--doc {
  background-image: url(./imgs/icon_doc.svg);
}
.c-portrait-file-msg__icon--ppt {
  background-image: url(./imgs/icon_ppt.svg);
}
.c-portrait-file-msg__icon--xls {
  background-image: url(./imgs/icon_xls.svg);
}
.c-portrait-file-msg__icon--pdf {
  background-image: url(./imgs/icon_pdf.svg);
}
</style>
