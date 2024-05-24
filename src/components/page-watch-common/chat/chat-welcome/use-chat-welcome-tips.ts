/**
 * @file 欢迎语相关 hook
 */
import { translate } from '@/assets/lang';
import { getWatchCore } from '@/core/watch-sdk';
import { useChatStore } from '@/store/use-chat-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLangStore } from '@/store/use-lang-store';
import {
  ChatEvents,
  ChatEventsRelations,
  ChatMessageUser,
  InteractReceiveEvents,
  InteractReceiveEventsRelations,
  ProductLinkJumpTipDetail,
  IarProductType,
} from '@polyv/live-watch-sdk';
import { computed, onBeforeUnmount, onMounted, ref, unref, watchEffect } from 'vue';

/** 欢迎语类型，user-用户登录，position-点击职位 */
export type WelcomeTextType = 'user' | 'position';

export interface WelcomeController {
  /** 设置欢迎语文本 */
  setWelcomeText(text: string, type: WelcomeTextType, time: number): void;
  /** 设置显示事件，单位：ms */
  setVisibleTime(time: number): void;
}

/** 最大显示数量 */
const maxCount = 10;
/** 文案上最大显示数量 */
const maxShowCount = 3;

export const useWelcomeUserLoginTips = (controller: WelcomeController, enabled = true) => {
  const chatStore = useChatStore();
  const langStore = useLangStore();
  const visibleTime = 3000;

  /** 当前正在显示的观众 */
  const showingUsers = ref<ChatMessageUser[]>([]);
  /** 等待显示的观众 */
  const waitingUsers = ref<ChatMessageUser[]>([]);

  /** 清空显示中的观众 */
  function clearShowingUsers() {
    showingUsers.value = [];
  }

  /** 刷新用户登录欢迎文本 */
  function refreshUserWelcomeText() {
    const len = unref(showingUsers).length;
    if (len === 0) {
      return;
    }

    let text = '';
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
      // eslint-disable-next-line prettier/prettier
      text = `${translate('welcome.text')} ${text} ${translate('welcome.wait')}${len}${translate('welcome.peopleJoin')}`;
    } else {
      text = `${translate('welcome.text')} ${text} ${translate('welcome.join')}`;
    }

    controller.setWelcomeText(text, 'user', visibleTime);
  }

  /** 重置显示的用户 */
  function setUserWelcomeText() {
    const surplusCount = maxCount - showingUsers.value.length;
    if (surplusCount <= 0) {
      return;
    }

    const joinUsers = waitingUsers.value.splice(0, surplusCount);
    if (joinUsers.length) {
      showingUsers.value.push(...joinUsers);
      refreshUserWelcomeText();
    }
  }

  /** 处理聊天室登录事件 */
  function onUserLoginEvent(event: ChatEventsRelations[ChatEvents.ChatUserLogin]) {
    const user = event.user;
    if (!user) return;

    // 正在两个列表中的用户不再插入
    const showIndex = showingUsers.value.findIndex(_user => _user.userId === user.userId);
    const waitIndex = waitingUsers.value.findIndex(_user => _user.userId === user.userId);
    if (showIndex !== -1 || waitIndex !== -1) return;

    waitingUsers.value.push(user);

    setUserWelcomeText();
  }

  onMounted(() => {
    const watchCore = getWatchCore();
    if (enabled && chatStore.chatSetting.welcomeEnabled) {
      watchCore.chat.eventEmitter.on(ChatEvents.ChatUserLogin, onUserLoginEvent);
    }
  });

  onBeforeUnmount(() => {
    const watchCore = getWatchCore();
    if (enabled && chatStore.chatSetting.welcomeEnabled) {
      watchCore.chat.eventEmitter.off(ChatEvents.ChatUserLogin, onUserLoginEvent);
    }
  });

  function onWelcomeHidden() {
    clearShowingUsers();
    setUserWelcomeText();
  }

  return {
    onWelcomeHidden,
  };
};

export const usePositionClickTips = (controller: WelcomeController, enabled = true) => {
  const interactReceiveStore = useInteractReceiveStore();
  const visibleTime = 2000;
  const watchCore = getWatchCore();

  function onProductClickEvent(
    data: InteractReceiveEventsRelations[InteractReceiveEvents.ProductClick],
  ) {
    const productLinkJumpTipDetail = watchCore.interactReceive.getProductLinkJumpTipDetail();

    let text;

    if (productLinkJumpTipDetail) {
      text = getWelcomeTextByProductType(data, productLinkJumpTipDetail);
    } else if (data.type === 'delivery' || data.type === IarProductType.Job) {
      // 兼容旧版type
      text = getDefaultWelcomeText(data.nickname, data.name);
    }

    text && controller.setWelcomeText(text, 'position', visibleTime);
  }

  function getWelcomeTextByProductType(
    data: InteractReceiveEventsRelations[InteractReceiveEvents.ProductClick],
    productLinkJumpTipDetail: ProductLinkJumpTipDetail,
  ) {
    // 获取与产品类型相对应的提示语
    let templateText: string | undefined;
    switch (data.type) {
      case IarProductType.Finance:
        templateText = productLinkJumpTipDetail.financialProductTip;
        break;
      case IarProductType.Job:
        templateText = productLinkJumpTipDetail.jobProductTip;
        break;
      case IarProductType.Normal:
        templateText = productLinkJumpTipDetail.ordinaryProductTip;
        break;
    }

    // 如果找到了对应的提示语且不为空，则进行模板替换；否则，使用默认欢迎文字
    if (templateText) {
      return replaceProductTip(templateText, data.nickname, data.name);
    } else {
      return getDefaultWelcomeText(data.nickname, data.name);
    }
  }

  function getDefaultWelcomeText(nickName: string, name: string) {
    return `${nickName}${translate('welcome.deliver')}${name}`;
  }

  function replaceProductTip(templateText: string, nickName: string, productName: string) {
    const nickNameReg = /{{nickName}}/g;
    const productReg = /{{productName}}/g;

    return templateText.replace(nickNameReg, nickName).replace(productReg, productName);
  }

  onMounted(() => {
    const watchCore = getWatchCore();
    if (enabled && interactReceiveStore.interactSetting.productLinkJumpTipEnabled) {
      watchCore.interactReceive.eventEmitter.on(
        InteractReceiveEvents.ProductClick,
        onProductClickEvent,
      );
    }
  });

  onBeforeUnmount(() => {
    const watchCore = getWatchCore();
    if (enabled && interactReceiveStore.interactSetting.productLinkJumpTipEnabled) {
      watchCore.interactReceive.eventEmitter.off(
        InteractReceiveEvents.ProductClick,
        onProductClickEvent,
      );
    }
  });

  function onWelcomeHidden() {}

  return {
    onWelcomeHidden,
  };
};

/** 欢迎语提示 hook */
export const useChatWelcomeTips = () => {
  const welcomeController: WelcomeController = {
    setWelcomeText,
    setVisibleTime,
  };

  const { onWelcomeHidden: onWelcomeUserLoginHidden } = useWelcomeUserLoginTips(welcomeController);
  const { onWelcomeHidden: onProductClickHidden } = usePositionClickTips(welcomeController);

  /** 显示的欢迎文案 */
  const welcomeText = ref('');

  /** 欢迎语类型 */
  const welcomeTextType = ref<WelcomeTextType>();

  /** 设置欢迎语文本 */
  function setWelcomeText(text: string, type: WelcomeTextType, time: number) {
    setVisibleTime(time);
    welcomeText.value = text;
    welcomeTextType.value = type;
  }

  /** 清空欢迎语文本 */
  function clearWelcomeText() {
    welcomeText.value = '';
    welcomeTextType.value = undefined;
  }

  /** 欢迎语是否显示 */
  const welcomeVisible = computed<boolean>(() => !!welcomeText.value);

  /** 隐藏定时器 */
  let hideTimer: number | undefined;

  /** 毫秒级别 */
  let visibleTime = 3000;

  function setVisibleTime(time: number) {
    visibleTime = time;
  }

  /** 设置隐藏定时器 */
  function setHideTimer() {
    clearHideTimer();
    hideTimer = window.setTimeout(() => {
      clearWelcomeText();
      clearHideTimer();

      onWelcomeUserLoginHidden();
      onProductClickHidden();
    }, visibleTime);
  }
  /** 清空隐藏定时器 */
  function clearHideTimer() {
    clearTimeout(hideTimer);
    hideTimer = undefined;
  }

  watchEffect(() => {
    if (welcomeText.value) {
      setHideTimer();
    } else {
      clearHideTimer();
    }
  });

  onBeforeUnmount(() => {
    clearHideTimer();
  });

  return {
    welcomeText,
    welcomeTextType,
    welcomeVisible,
  };
};
