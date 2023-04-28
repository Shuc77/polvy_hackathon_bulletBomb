<!-- @file 消息用户头衔标签 -->
<template>
  <div
    class="c-msg-user-actor"
    :style="{ background: actorLabelColor }"
  >
    <span class="c-msg-user-actor__content">
      {{ msgUserActor }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useMsgUserActor, msgUserActorProps } from './use-msg-user-actor';

const props = defineProps(msgUserActorProps());

const { msgUserActor, actorLabelColor } = useMsgUserActor({ props });
</script>

<style lang="scss">
.c-msg-user-actor {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  margin-right: 4px;
  line-height: 18px;
  color: $--color-white;
  border-radius: 9px;
}
.c-msg-user-actor__content {
  font-size: 12px;
  white-space: nowrap;
  zoom: 0.83;
  transform: translateY(1px);
}
</style>
