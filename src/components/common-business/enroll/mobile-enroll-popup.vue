<!-- @file 移动端报名观看表单弹层 -->
<template>
  <mobile-popup
    class="c-pc-enroll-dialog"
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    :backable="dialogModel === 'login'"
    @click-back="onClickBack"
  >
    <!-- 报名观看表单填写 -->
    <mobile-enroll-form
      v-if="dialogModel === 'form'"
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

defineExpose(enrollDialogInstance);
</script>
