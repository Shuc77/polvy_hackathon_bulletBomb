/**
 * @file 欢迎语相关 hook
 */
import { translate } from '@/assets/lang';
import { getWatchCore } from '@/core/watch-sdk';
import { useChatStore } from '@/store/use-chat-store';
import { useLangStore } from '@/store/use-lang-store';
import { ChatEvents, ChatMessageUser, UserLoginMsgType } from '@polyv/live-watch-sdk';
import { computed, onBeforeUnmount, onMounted, ref, unref } from 'vue';

/** 最大显示数量 */
const maxCount = 10;
/** 文案上最大显示数量 */
const maxShowCount = 3;

/** 欢迎语提示 hook */
export const useChatWelcomeTips = () => {
  const chatStore = useChatStore();
  const langStore = useLangStore();

  /** 当前正在显示的观众 */
  const showingUsers = ref<ChatMessageUser[]>([]);
  /** 等待显示的观众 */
  const waitingUsers = ref<ChatMessageUser[]>([]);

  /** 显示的欢迎文案 */
  const welcomeText = ref('');

  function setWelcomeText() {
    let text = '';

    const len = unref(showingUsers).length;
    const nicks: string[] = [];

    unref(showingUsers)
      .reverse()
      .forEach((user, index) => {
        if (index < maxShowCount) {
          nicks.push(langStore.translateNick(user.nick));
        }
      });

    text = nicks.join('、');

    if (len > maxShowCount) {
      text = `${text} ${translate('welcome.wait')}${len}${translate('welcome.peopleJoin')}`;
    } else {
      text = `${text} ${translate('welcome.join')}`;
    }

    welcomeText.value = text;
  }

  /** 欢迎语是否显示 */
  const welcomeVisible = computed(() => showingUsers.value.length !== 0);

  /** 隐藏定时器 */
  let hideTimer: number | undefined;

  /** 设置隐藏定时器 */
  function setHideTimer() {
    hideTimer = window.setTimeout(() => {
      showingUsers.value = [];
      clearHideTimer();
      resetShowUser();
    }, 3000);
  }
  /** 清空隐藏定时器 */
  function clearHideTimer() {
    clearTimeout(hideTimer);
    hideTimer = undefined;
  }

  /** 重置显示的用户 */
  function resetShowUser() {
    clearHideTimer();

    const surplusCount = maxCount - showingUsers.value.length;
    const joinUsers = waitingUsers.value.splice(0, surplusCount);

    if (joinUsers.length) {
      showingUsers.value.push(...joinUsers);
      setWelcomeText();
    }

    if (showingUsers.value.length) {
      setHideTimer();
    }
  }

  /** 处理聊天室登录事件 */
  function onUserLoginEvent(event: { userLoginMsg: UserLoginMsgType }) {
    const user = event.userLoginMsg.user;
    if (!user) return;

    // 正在两个列表中的用户不再插入
    const showIndex = showingUsers.value.findIndex(_user => _user.userId === user.userId);
    const waitIndex = waitingUsers.value.findIndex(_user => _user.userId === user.userId);
    if (showIndex !== -1 || waitIndex !== -1) return;

    // 显示中的数量小于 10，直接显示否则进入等待队列
    if (showingUsers.value.length < maxCount) {
      showingUsers.value.push(user);
    } else {
      waitingUsers.value.push(user);
    }

    resetShowUser();
    setWelcomeText();
  }

  onMounted(() => {
    if (chatStore.welcomeEnabled) {
      const watchCore = getWatchCore();
      watchCore.chat.eventEmitter.on(ChatEvents.ChatUserLogin, onUserLoginEvent);
    }
  });

  onBeforeUnmount(() => {
    if (chatStore.welcomeEnabled) {
      const watchCore = getWatchCore();
      watchCore.chat.eventEmitter.off(ChatEvents.ChatUserLogin, onUserLoginEvent);
    }
    clearHideTimer();
  });

  return {
    showingUsers,
    welcomeText,
    welcomeVisible,
  };
};
