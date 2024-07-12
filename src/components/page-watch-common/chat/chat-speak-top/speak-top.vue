<template>
  <div class="c-chat-speak-top">
    <div class="c-chat-speak-top__header">
      <div>
        <img
          class="c-chat-speak-top__avatar"
          :src="user.pic"
          alt="avatar"
        />
        <span class="c-chat-speak-top__title">{{ user.nick }}</span>
      </div>
      <button
        class="c-chat-speak-top__close"
        @click="closeHandler"
      >
        ×
      </button>
    </div>
    <div
      class="c-chat-speak-top__content"
      v-html="content"
    ></div>
  </div>
</template>

<script setup>
defineProps({
  content: {
    type: String,
    required: true,
  },
  user: {
    type: Object,
    required: true,
    default: () => ({
      nick: '',
      pic: '',
      actor: '',
    }),
  },
});

const emit = defineEmits(['close']);

const closeHandler = () => {
  emit('close');
};
</script>

<style scoped lang="scss">
.c-chat-speak-top {
  position: relative;
  box-sizing: border-box;
  width: 311px;
  padding: 12px;
  color: white;
  background: rgba(29, 33, 41, 0.48);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.c-chat-speak-top__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.c-chat-speak-top__avatar {
  width: 24px;
  height: 24px;
  margin-right: 10px;
  border-radius: 50%;
}

.c-chat-speak-top__title {
  margin-right: 10px;
  font-size: 12px;
}

.c-chat-speak-top__role {
  margin-right: auto;
  font-size: 14px;
  color: #a0a0a0;
}

.c-chat-speak-top__close {
  font-size: 20px;
  color: white;
  cursor: pointer;
  background: none;
  border: none;
}

.c-chat-speak-top__content {
  display: -webkit-box;
  overflow: hidden;
  font-size: 14px;
  line-height: 1.5;
  text-overflow: ellipsis;
  word-break: break-all;
  white-space: normal;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>

<style>
.c-chat-speak-top__content a {
  color: #fff !important;
}
</style>
