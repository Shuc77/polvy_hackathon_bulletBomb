/** 所有问卷状态 */
export enum AllQuestionnaireStatus {
  /** 正在显示答题中的问卷 */
  IsShowQuestion = 'isShowQuestion',
  /** 正在显示问卷结果 */
  IsShowResult = 'isShowResult',
  /** 正在显示问卷答案 */
  IsShowAnswer = 'isShowAnswer',
  /** 正在显示问卷排行榜 */
  IsShowResultRank = 'isShowResultRank',
  /** 正在展示问卷列表 */
  IsShowQuestionnaireList = 'isShowQuestionnaireList',
}

/**
 * 互动接收端-问卷 vue 实例类型
 */
export interface IarQuestionnaireInstance {
  /** 组件内的问卷状态 */
  status: AllQuestionnaireStatus | null;
  /** 显示问卷列表 */
  showList: () => void;
  /** 显示单个问卷 */
  showOneQuestionnaire: (questionnaireId: string) => void;
}
