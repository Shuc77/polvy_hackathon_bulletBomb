import { PropUtils } from '@/assets/utils/vue-utils/props-utils';

export enum PlayButtonMode {
  /** 三角形的播放按钮 */
  Default = 'default',
  /** 文字提示型的播放按钮 */
  Text = 'text',
}

export const usePlayerPlayButtonProps = () => ({
  mode: PropUtils.enum<PlayButtonMode>().def(PlayButtonMode.Default),
  visible: PropUtils.bool.def(false),
  /** 是否使用简单显示模式，使用后按钮根据props.visible状态显示，不依赖store状态 */
  simpleVisibleMode: PropUtils.bool.def(false),
});
