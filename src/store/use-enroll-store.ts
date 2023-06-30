import { translate } from '@/assets/lang';
import { getWatchCore } from '@/core/watch-sdk';
import {
  EnrollAuthType,
  EnrollFieldItem,
  EnrollFieldItemMobile,
  EnrollFieldType,
  EnrollFillTime,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { ComputedRef, Ref, computed, ref, unref } from 'vue';

export interface EnrollStoreState {
  /** 报名观看开关 */
  enrollEnabled: Ref<boolean>;
  /** 报名审核开关 */
  auditEnabled: Ref<boolean>;
  /** 是否已有报名记录 */
  hasEnrolled: Ref<boolean>;
  /** 是否已审核通过 */
  hasAudited: Ref<boolean>;
  /** 填写时机 */
  fillTime: Ref<EnrollFillTime>;
  /** 报名表单字段 */
  enrollFields: Ref<EnrollFieldItem[]>;
  /** 验证方式 */
  enrollAuthType: Ref<EnrollAuthType>;
  /** 是否需要短信验证 */
  smsVerifyEnabled: Ref<boolean>;
  /** 验证字段对象 */
  enrollAuthField: ComputedRef<EnrollFieldItemMobile | undefined>;
  /** 验证字段名称 */
  enrollAuthName: ComputedRef<string>;
  /** 验证字段提示 */
  enrollAuthTips: ComputedRef<string>;
  /** 当前已有报名记录但未通过 */
  auditNotPass: ComputedRef<boolean>;
  /** 需要在入口中进行报名观看 */
  needEnrollByEnter: ComputedRef<boolean>;
  /** 需要在互动前进行报名观看 */
  needEnrollByChat: ComputedRef<boolean>;
  /** 入口文本 */
  entranceText: ComputedRef<string>;
  /** 报名观看标题 */
  enrollTitle: Ref<string>;
  /** banner 头图片 */
  enrollBanner: Ref<string | undefined>;
  /** 是否使用报名观看姓名作为昵称 */
  enrollNickEnabled: Ref<boolean>;
}

export interface EnrollStoreAction {
  /** 同步报名观看信息 */
  syncEnrollInfo: () => void;
}

export interface EnrollStore extends EnrollStoreState, EnrollStoreAction {}

/**
 * 报名观看 store
 */
export const useEnrollStore = defineStore<'enroll', EnrollStore>('enroll', () => {
  /** 报名观看开关 */
  const enrollEnabled = ref(false);

  /** 报名审核开关 */
  const auditEnabled = ref(false);

  /** 是否已有报名记录 */
  const hasEnrolled = ref(false);

  /** 是否已审核通过 */
  const hasAudited = ref(false);

  /** 填写时机 */
  const fillTime = ref<EnrollFillTime>(EnrollFillTime.BeforeEnter);

  /** 报名表单字段 */
  const enrollFields = ref<EnrollFieldItem[]>([]);

  /** 验证方式 */
  const enrollAuthType = ref<EnrollAuthType>(EnrollAuthType.Mobile);

  /** 是否需要短信验证 */
  const smsVerifyEnabled = ref(false);

  /** 验证字段对象 */
  const enrollAuthField = computed<EnrollFieldItemMobile | undefined>(() => {
    const fields = unref(enrollFields);
    const mobileIndex = fields.findIndex(fieldItem => fieldItem.type === EnrollFieldType.Mobile);

    return fields[mobileIndex] as EnrollFieldItemMobile;
  });

  /** 验证字段名称 */
  const enrollAuthName = computed<string>(() => {
    const fieldItem = unref(enrollAuthField);

    return fieldItem?.name ?? '';
  });

  /** 验证字段提示 */
  const enrollAuthTips = computed<string>(() => {
    const fieldItem = unref(enrollAuthField);

    return fieldItem?.tips ?? '';
  });

  /** 当前已有报名记录但未通过 */
  const auditNotPass = computed<boolean>(
    () => unref(hasEnrolled) && unref(auditEnabled) && !unref(hasAudited),
  );

  /** 需要在入口中进行报名观看 */
  const needEnrollByEnter = computed<boolean>(() => {
    return (
      // 需要开启报名观看
      unref(enrollEnabled) &&
      // 填写时间是“进入直播前”
      unref(fillTime) === EnrollFillTime.BeforeEnter &&
      // [没有报名记录]或者[有记录但未通过]
      (!unref(hasEnrolled) || unref(auditNotPass))
    );
  });

  /** 需要在互动前进行报名观看 */
  const needEnrollByChat = computed<boolean>(
    () =>
      // 需要开启报名观看
      unref(enrollEnabled) &&
      // 填写时间是“进入直播前”
      unref(fillTime) === EnrollFillTime.BeforeChat &&
      // 没有报名记录
      !unref(hasEnrolled),
  );

  /** 入口原始文本 */
  const entranceOriginText = ref('');

  /** 入口文本 */
  const entranceText = computed<string>(() => {
    const text = unref(entranceOriginText) ?? translate('enroll.text');
    return text === '报名观看' ? translate('enroll.text') : text;
  });

  /** 报名观看标题 */
  const enrollTitle = ref('');

  /** banner 头部图 */
  const enrollBanner = ref('');

  /** 是否使用报名观看姓名作为昵称 */
  const enrollNickEnabled = ref(false);

  /** 同步信息 */
  function syncEnrollInfo() {
    const watchCore = getWatchCore();
    const enrollInfo = watchCore.enroll.getEnrollInfo();

    enrollEnabled.value = enrollInfo.enrollEnabled;
    auditEnabled.value = enrollInfo.auditEnabled;
    hasEnrolled.value = enrollInfo.hasEnrolled;
    hasAudited.value = enrollInfo.hasAudited;
    fillTime.value = enrollInfo.fillTime;
    entranceOriginText.value = enrollInfo.entranceText;
    enrollTitle.value = enrollInfo.enrollTitle;
    enrollBanner.value = enrollInfo.enrollBanner;
    enrollFields.value = enrollInfo.enrollFields;
    enrollAuthType.value = enrollInfo.enrollAuthType;
    smsVerifyEnabled.value = enrollInfo.smsVerifyEnabled;
    enrollNickEnabled.value = enrollInfo.enrollNickEnabled;
  }

  return {
    enrollEnabled,
    auditEnabled,
    hasEnrolled,
    hasAudited,
    fillTime,
    enrollFields,
    enrollAuthType,
    smsVerifyEnabled,

    enrollAuthField,
    enrollAuthName,
    enrollAuthTips,
    auditNotPass,
    needEnrollByEnter,
    needEnrollByChat,
    entranceText,
    enrollTitle,
    enrollBanner,
    enrollNickEnabled,

    syncEnrollInfo,
  };
});
