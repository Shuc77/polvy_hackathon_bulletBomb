/**
 * 抽奖结果状态
 */
export enum AllLotteryResultStatus {
  /** 显示中奖结果 */
  isShowLotteryEnd = 'isShowLotteryEnd',
  /** 显示中奖名单 */
  isShowWinnerList = 'isShowWinnerList',
  /** 填写中奖信息 */
  isShowSubmitInfo = 'isShowSubmitInfo',
}

/**
 * 中奖记录数据类型
 */
export interface LotteryRecordData {
  /** 是否已提交 */
  received: boolean;
  /** 是否中奖 */
  isWinner: boolean;
}

export interface LotteryResultInstance {
  /** 返回到结果 */
  toBack?: () => void;
  /** 设置中奖记录 */
  setLottery?: (record: LotteryRecordData) => void;
}
