import { tupleString } from '@/assets/utils/array';

export const SessionListItemSizeList = tupleString(
  'normal',
  'large',
  'large_auto',
  'medium',
  'medium_auto',
  'small',
  'detail_list',
  'detail_list_horizontal',
);

export type SessionListItemSize = typeof SessionListItemSizeList[number];

export enum ChannelNameDisplayType {
  Hide = 'hide',
  OneRow = 'oneRow',
  TwoRow = 'twoRow',
}
