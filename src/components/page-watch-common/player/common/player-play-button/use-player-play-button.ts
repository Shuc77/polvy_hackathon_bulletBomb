import { PropUtils } from '@/assets/utils/vue-utils/props-utils';

export enum PlayButtonMode {
  /** 三角形的播放按钮 */
  Default = 'default',
  /** 文字提示型的播放按钮 */
  Text = 'text',
}

export const usePlayerPlayButtonProps = () => ({
  mode: PropUtils.enum<PlayButtonMode>().def(PlayButtonMode.Default),
});
