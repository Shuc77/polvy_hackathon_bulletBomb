<!-- @file 移动端报名观看表单弹层 -->
<template>
  <mobile-popup
    class="c-mobile-enroll-popup"
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    :backable="dialogModel === 'login'"
    force-show-body-scrollbar
    @click-back="onClickBack"
    @body-scroll-near-bottom="setIsNearBottom"
  >
    <!-- 报名观看表单填写 -->
    <mobile-enroll-form
      v-if="dialogModel === 'form'"
      :is-near-bottom="isNearBottom"
      @click-cancel="closeEnrollDialog"
      @click-enrolled="onClickEnrolled"
      @close-dialog="closeEnrollDialog"
    />
    <!-- 报名观看登录 -->
    <mobile-enroll-login
      v-if="dialogModel === 'login'"
      @click-cancel="closeEnrollDialog"
      @close-dialog="closeEnrollDialog"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import MobileEnrollForm from './mobile-enroll-form.vue';
import MobileEnrollLogin from './mobile-enroll-login.vue';

import { useEnrollDialog } from './hooks/use-enroll-dialog';

const {
  dialogModel,
  dialogVisible,
  dialogTitle,
  enrollDialogInstance,
  closeEnrollDialog,
  onClickEnrolled,
  onClickBack,
} = useEnrollDialog();

/** 是否接近底部 */
const isNearBottom = ref(false);

function setIsNearBottom(bodyScrollNearBottom: boolean) {
  isNearBottom.value = bodyScrollNearBottom;
}

defineExpose(enrollDialogInstance);
</script>
