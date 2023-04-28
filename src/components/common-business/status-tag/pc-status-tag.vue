<template>
  <div
    class="c-pc-status-tag"
    :class="['pws-pc-live-status-tag-' + liveStatus]"
  >
    {{ statusTagText }}
  </div>
</template>

<script setup lang="ts">
import { statusTagProps, useStatusTag } from './use-status-tag';

const props = defineProps(statusTagProps());

const { statusTagText, liveStatus } = useStatusTag({
  props,
});
</script>

<style lang="scss">
.c-pc-status-tag {
  display: inline-block;
  flex-shrink: 0;
  padding: 0 4px;
  font-size: 14px;
  font-style: normal;
  line-height: 18px;
  white-space: nowrap;
  border: 1px solid;
  border-radius: 2px;
}
</style>
