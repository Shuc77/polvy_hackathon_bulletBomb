<!-- @file PC 端报名观看表单弹层 -->
<template>
  <pc-dialog
    class="c-pc-enroll-dialog"
    :visible.sync="dialogVisible"
    :title="dialogTitle"
  >
    <!-- 报名观看表单填写 -->
    <pc-enroll-form
      v-if="dialogModel === 'form'"
      @click-cancel="closeEnrollDialog"
      @click-enrolled="onClickEnrolled"
      @close-dialog="closeEnrollDialog"
    />
    <!-- 报名观看登录 -->
    <pc-enroll-login
      v-if="dialogModel === 'login'"
      @click-cancel="closeEnrollDialog"
      @close-dialog="closeEnrollDialog"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import PcEnrollForm from './pc-enroll-form.vue';
import PcEnrollLogin from './pc-enroll-login.vue';

import { useEnrollDialog } from './hooks/use-enroll-dialog';

const {
  dialogModel,
  dialogVisible,
  dialogTitle,
  enrollDialogInstance,
  closeEnrollDialog,
  onClickEnrolled,
} = useEnrollDialog();

defineExpose(enrollDialogInstance);
</script>
