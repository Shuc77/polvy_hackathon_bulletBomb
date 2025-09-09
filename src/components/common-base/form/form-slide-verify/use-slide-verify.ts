/**
 * @file 滑块验证码 hook
 */

import { loadAliAwsc } from '@/plugins/external-lib-loaders/load-ali-awsc';
import { randomStr } from '@utils-ts/string';
import { onMounted } from 'vue';
import { useLangStore } from '@/store/use-lang-store';
import { LangType } from '@/assets/lang/lang-enum';
import { PropUtils, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';
import { useGlobalInject } from '@/app/use-global-inject';

export interface SlideVerifyData {
  sessionId: string;
  sig: string;
  token: string;
  scene: string;
}

export const formSlideVerifyProps = () => ({
  /** 绑定的验证值 */
  value: PropUtils.object<SlideVerifyData>(),
});

export const formSlideVerifyEmits = () => ({
  input: emitFunc<SlideVerifyData>(),
  'verify-success': emitFunc<SlideVerifyData>(),
  'verify-fail': emitFunc<string>(),
  'verify-error': emitFunc<string>(),
});

export const useSlideVerify = (options: {
  props: VueProps<typeof formSlideVerifyProps>;
  emit: VueEmit<typeof formSlideVerifyEmits>;
}) => {
  const { emit } = options;
  const langStore = useLangStore();

  const { getWatchCore } = useGlobalInject();

  const id = randomStr(8);
  const scene = 'nc_register_h5';

  // 语言配置
  const langConfig = {
    cn: {
      SLIDE: '按住滑块，拖动到最右',
    },
  };

  /** 初始化验证码 */
  async function initSlideVerify() {
    const AWSC = await loadAliAwsc();

    // https://help.aliyun.com/zh/captcha/captcha1-0/user-guide/custom-ui-and-language-settings
    const language =
      {
        [LangType.ZH_CN]: 'cn',
        [LangType.ZH_TW]: 'tw',
        [LangType.English]: 'en',
        [LangType.Japanese]: 'ja_JP',
        [LangType.Korean]: 'ko_KR',
        [LangType.Russian]: 'ru_RU',
      }[langStore.currentLang] || 'en';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AWSC.use('nc', (state: unknown, module: any) => {
      const watchCore = getWatchCore();
      module.init({
        // 应用类型标识。它和使用场景标识（scene字段）一起决定了滑动验证的业务场景与后端对应使用的策略模型。您可以在阿里云验证码控制台的配置管理页签找到对应的appkey字段值，请务必正确填写。
        appkey: watchCore.utils.getAliSliderAppKey(),
        // 使用场景标识。它和应用类型标识（appkey字段）一起决定了滑动验证的业务场景与后端对应使用的策略模型。您可以在阿里云验证码控制台的配置管理页签找到对应的scene值，请务必正确填写。
        scene,
        // 声明滑动验证需要渲染的目标ID。
        renderTo: `#${id}`,
        // 配置语言
        language,
        // 更新多语言配置
        upLang: langConfig,
        // 前端滑动验证通过时会触发该回调参数。您可以在该回调参数中将会话ID（sessionId）、签名串（sig）、请求唯一标识（token）字段记录下来，随业务请求一同发送至您的服务端调用验签。
        success: (data: SlideVerifyData) => {
          const slideData = {
            sessionId: data.sessionId,
            sig: data.sig,
            token: data.token,
            scene,
          };

          emit('input', slideData);
          emit('verify-success', slideData);
        },
        // 滑动验证失败时触发该回调参数。
        fail: (failCode: string) => {
          emit('verify-fail', failCode);
        },
        // 验证码加载出现异常时触发该回调参数。
        error: (errorCode: string) => {
          emit('verify-error', errorCode);
        },
      });
    });
  }

  onMounted(() => {
    initSlideVerify();
  });

  return {
    id,
    initSlideVerify,
  };
};
