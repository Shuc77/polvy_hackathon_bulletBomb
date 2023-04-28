import { IarAnswerQuestionTypes } from '@polyv/live-watch-sdk';

/** 所有答题卡状态 */
export enum AllAnswerCardStatus {
  /** 正在显示答题中的问题 */
  isShowQuestion = 'isShowQuestion',
  /** 正在显示问卷结果 */
  isShowResult = 'isShowResult',
  /** 正在显示问卷答案 */
  isShowAnswer = 'isShowAnswer',
}

export interface IarAnswerCardInstance {
  status?: AllAnswerCardStatus;
  /** 返回到结果 */
  backToResult?: () => void;
}

export interface QuestionData {
  /** 问题类型 */
  type?: IarAnswerQuestionTypes;
}
