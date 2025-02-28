import { IarAnswerQuestionTypes } from '@polyv/live-watch-sdk';

/** 所有答题卡状态 */
export enum AllAnswerCardStatus {
  /** 正在显示答题中的问题 */
  IsShowQuestion = 'isShowQuestion',
  /** 正在显示问卷结果 */
  IsShowResult = 'isShowResult',
  /** 正在显示问卷答案 */
  IsShowAnswer = 'isShowAnswer',
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
