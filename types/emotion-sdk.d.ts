declare module '@polyv/emotion-sdk' {
  /**
   * 把指定内容中的表情占位符替换为表情图片。
   * @param content 指定内容。
   * @param mode 解析模式，默认：1：
   *   1 为 HTML 模式，即替换为 img 标签；
   *   2 为弹幕模式，即替换为两个中括号括起的图片地址。
   */
  export function parseEmotions(content: string, mode?: number): string;

  /**
   * 移除表情
   * @param content 指定内容
   */
  export function removeEmotions(content: string): string;

  /**
   * 获取 dom 节点列表
   */
  export function genDOMList(): HTMLUListElement;
}
