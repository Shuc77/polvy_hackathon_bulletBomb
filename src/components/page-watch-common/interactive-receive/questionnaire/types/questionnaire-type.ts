/** 所有问卷状态 */
export enum AllQuestionnaireStatus {
  /** 正在显示答题中的问卷 */
  isShowQuestion = 'isShowQuestion',
  /** 正在显示问卷结果 */
  isShowResult = 'isShowResult',
  /** 正在显示问卷答案 */
  isShowAnswer = 'isShowAnswer',
  /** 正在显示问卷排行榜 */
  isShowResultRank = 'isShowResultRank',
  /** 正在展示问卷列表 */
  isShowQuestionnaireList = 'isShowQuestionnaireList',
}

/**
 * 互动接收端-问卷 vue 实例类型
 */
export interface IarQuestionnaireInstance {
  /** 组件内的问卷状态 */
  status: AllQuestionnaireStatus | null;
  /** 显示问卷列表 */
  showList: () => void;
}
