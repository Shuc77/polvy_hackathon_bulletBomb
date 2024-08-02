<template>
  <div
    class="c-mobile-status-tag"
    :class="['pws-mobile-live-status-tag-' + liveStatus]"
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
.c-mobile-status-tag {
  box-sizing: border-box;
  display: inline-block;
  padding: 2px 3px;
  font-size: 12px;
  font-style: normal;
  line-height: 1;
  border: 1px solid;
  border-radius: 2px;
  transform: scale(0.833);
}
</style>
