import { translate } from '@/assets/lang';
import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { useChannelStore } from '@/store/use-channel-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { AuthSettingItem, AuthType, LiveStatus } from '@polyv/live-watch-sdk';
import {
  computed,
  getCurrentInstance,
  inject,
  InjectionKey,
  onBeforeUnmount,
  provide,
  unref,
} from 'vue';
import { AuthButtonInject } from '../types/auth-type';

/**
 * 观看页条件按钮 props 配置
 */
export const authButtonProps = () => ({
  authItem: PropUtils.objectType<AuthSettingItem>().isRequired,
});

const AUTH_BUTTON_INJECT_KEY: InjectionKey<AuthButtonInject> = Symbol('authButtonInjectKey');

/**
 * 观看条件按钮注入
 * @param data 注入数据
 */
export const useAuthButtonProvide = (data: AuthButtonInject) => {
  provide(AUTH_BUTTON_INJECT_KEY, data);
};

/**
 * 获取观看条件注入信息
 */
export const useAuthButtonInject = <ItemType extends AuthSettingItem>(
  clickButtonCallback?: AnyFunc,
): AuthButtonInject<ItemType> => {
  const injectData = inject(AUTH_BUTTON_INJECT_KEY) as AuthButtonInject<ItemType>;

  if (clickButtonCallback) {
    injectData.listenClickAuthButton(clickButtonCallback);
  }

  onBeforeUnmount(() => {
    if (clickButtonCallback) {
      injectData.unlistenClickAuthButton(clickButtonCallback);
    }
  });

  return injectData;
};

/**
 * 观看条件按钮 hook
 */
export const useAuthButton = (options: { props: VueProps<typeof authButtonProps> }) => {
  const { props } = options;
  const channelStore = useChannelStore();
  const enrollStore = useEnrollStore();

  const thisInstance = getCurrentInstance()?.proxy;

  useAuthButtonProvide({
    authItem: props.authItem,
    listenClickAuthButton,
    unlistenClickAuthButton,
  });

  /** 当前的观看条件类型 */
  const currentAuthType = computed<AuthType>(() => {
    return props.authItem.authType;
  });

  /** 默认的按钮文本 */
  const defaultButtonText = computed<string>(() => {
    const defaultTexts: Record<AuthType, string> = {
      [AuthType.None]: translate('auth.button.none'),
      [AuthType.Phone]: translate('auth.button.phone'),
      [AuthType.Pay]: translate('auth.button.pay'),
      [AuthType.Info]: translate('auth.button.info'),
      [AuthType.Code]: translate('auth.button.code'),
      [AuthType.Custom]: translate('auth.button.login'),
      [AuthType.External]: translate('auth.button.login'),
      [AuthType.Direct]: translate('auth.button.login'),
      [AuthType.EnterpriseWeChat]: translate('auth.button.workWx'),
      /** @warn 实际上一客一码并不会作为观看条件，而是作为一种单独的授权方式 */
      [AuthType.SaleShare]: translate('auth.button.none'),
    };

    return defaultTexts[unref(currentAuthType)];
  });

  /** 按钮文本 */
  const buttonText = computed<string>(() => {
    const authItem = props.authItem;

    let text = unref(defaultButtonText);

    // 白名单观看入口文本
    if (
      authItem.authType === AuthType.Phone &&
      authItem.whiteListEntryText &&
      !['会员观看', '会员入口'].includes(authItem.whiteListEntryText)
    ) {
      text = authItem.whiteListEntryText;
    }

    // 付费观看入口文本
    if (
      authItem.authType === AuthType.Pay &&
      authItem.payEntryText &&
      !['付费观看'].includes(authItem.payEntryText)
    ) {
      text = authItem.payEntryText;
    }

    // 验证码观看入口文本
    if (
      authItem.authType === AuthType.Code &&
      authItem.codeEntryText &&
      !['验证码观看'].includes(authItem.codeEntryText)
    ) {
      text = authItem.codeEntryText;
    }

    // 登记观看入口文本
    if (
      authItem.authType === AuthType.Info &&
      authItem.infoEntryText &&
      !['登记观看'].includes(authItem.infoEntryText)
    ) {
      text = authItem.infoEntryText;
    }

    // 外部授权入口文本
    if (authItem.authType === AuthType.External && authItem.externalEntryText) {
      text = authItem.externalEntryText;
    }

    // 无条件入口文本
    if (authItem.authType === AuthType.None && channelStore.liveStatus === LiveStatus.Playback) {
      text = translate('auth.button.playback');
    }

    return text;
  });

  /** 按钮是否显示 */
  const buttonVisible = computed<boolean>(() => {
    const authItem = props.authItem;

    // 如果仅无条件且需要在入口处进行报名观看，则不显示按钮
    if (authItem.authType === AuthType.None && enrollStore.needEnrollByEnter) {
      return false;
    }

    return true;
  });

  /** 点击时回调的事件 */
  const clickCallbackEvent = 'click-auth-button';
  /** 处理点击观看条件按钮 */
  function onClickAuthButton(): void {
    thisInstance?.$emit(clickCallbackEvent);
  }
  /** 监听点击按钮事件 */
  function listenClickAuthButton(callback: AnyFunc): void {
    thisInstance?.$on(clickCallbackEvent, callback);
  }
  /** 取消监听事件 */
  function unlistenClickAuthButton(callback: AnyFunc): void {
    thisInstance?.$off(clickCallbackEvent, callback);
  }

  return {
    currentAuthType,
    defaultButtonText,
    buttonText,
    buttonVisible,
    onClickAuthButton,
  };
};
