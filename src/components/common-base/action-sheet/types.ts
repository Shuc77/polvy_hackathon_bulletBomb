export type ActionSheetValue = string | number;

export interface ActionSheetItem {
  /** 名称 */
  name: string;
  /** 选项值 */
  value: ActionSheetValue;
}
