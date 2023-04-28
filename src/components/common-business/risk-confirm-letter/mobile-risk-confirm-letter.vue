<template>
  <mobile-dialog
    class="c-mobile-risk-confirm-letter"
    :visible="dialogVisible"
    :title="dialogTitle"
    :show-header="isShowDialogHeader"
    :content-style="dialogContentStyle"
    :close-on-click-mask="false"
    :closable="false"
  >
    <!-- 预览协议 -->
    <template v-if="riskConfirmLetterRenderMode === RiskConfirmLetterRenderMode.PREVIEW_AGREEMENT">
      <section
        class="c-mobile-risk-confirm-letter__content__preview-agreement"
        :style="contentWrapperStyle"
      >
        <iframe
          allow="*"
          scrolling="auto"
          class="c-mobile-risk-confirm-letter__content__preview-agreement-pdf"
          :src="curPreviewAgreement.src"
        ></iframe>
      </section>
      <div
        slot="footer"
        class="c-mobile-risk-confirm-letter__button-wrapper"
      >
        <div
          class="c-mobile-risk-confirm-letter__button c-mobile-risk-confirm-letter__button--back"
          @click="resetRiskConfirmLetterRenderMode"
        >
          返回
        </div>
      </div>
    </template>
    <!-- "不同意"的提示 -->
    <template v-else-if="riskConfirmLetterRenderMode === RiskConfirmLetterRenderMode.DISAGREE_TIPS">
      <section
        class="c-mobile-risk-confirm-letter__content__disagree-tips"
        :style="contentWrapperStyle"
      >
        <img
          src="./img/no-agree.png"
          alt=""
        />
        <div class="c-mobile-risk-confirm-letter__content__disagree-tips-text">
          为了您有更好的观看体验
        </div>
        <div class="c-mobile-risk-confirm-letter__content__disagree-tips-text">
          请同意协议后进入直播间
        </div>
      </section>
      <div
        slot="footer"
        class="c-mobile-risk-confirm-letter__button-wrapper"
      >
        <div
          class="c-mobile-risk-confirm-letter__button c-mobile-risk-confirm-letter__button--viewAgreement"
          @click="resetRiskConfirmLetterRenderMode"
        >
          {{ $lang('risk.confirm.letter.viewAgreement') }}
        </div>
      </div>
    </template>
    <!-- 默认展示 -->
    <template v-else>
      <div class="c-mobile-risk-confirm-letter__content-wrapper">
        <section
          class="c-mobile-risk-confirm-letter__content"
          :style="contentWrapperStyle"
          v-if="viewerRiskConfirmInfo"
        >
          <div class="c-mobile-risk-confirm-letter__content-text">
            欢迎您进入
            <span
              v-if="viewerRiskConfirmInfo.channelName"
              class="c-mobile-risk-confirm-letter__content-text--channelName"
            >
              {{ viewerRiskConfirmInfo.channelName }}
            </span>
            直播间，为更好地保护您的权益，根据国家相关法律法规规定，请您观看直播前，务必认真阅读并充分理解
            <span v-show="viewerRiskConfirmInfo.agreements.length">
              我们的
              <a
                v-for="(agreement, index) in viewerRiskConfirmInfo.agreements"
                :key="`${agreement.agreementTitle}#${agreement.agreementUrl}`"
                href="javascript:;"
                class="c-mobile-risk-confirm-letter__content-text-href"
                @click.stop="handlePreviewAgreement(agreement)"
              >
                《{{ agreement.agreementTitle }}》
                <i v-if="index !== viewerRiskConfirmInfo.agreements.length - 1">、</i>
              </a>
              以及
            </span>
            直播平台保利威的
            <a
              href="javascript:;"
              class="c-mobile-risk-confirm-letter__content-text-href"
              @click.stop="handlePreviewDefaultAgreement('服务协议')"
            >
              《服务协议》
            </a>
            和
            <a
              href="javascript:;"
              class="c-mobile-risk-confirm-letter__content-text-href"
              @click.stop="handlePreviewDefaultAgreement('隐私协议')"
              >《隐私协议》
            </a>
            。
            <p>您点击同意，即表示您已阅读、理解且接受全部的协议条款，确认同意后即可进入直播间。</p>
          </div>
        </section>
        <div class="c-mobile-risk-confirm-letter__bottom-line"></div>
      </div>

      <div
        slot="footer"
        class="c-mobile-risk-confirm-letter__button-wrapper"
      >
        <div
          class="c-mobile-risk-confirm-letter__button c-mobile-risk-confirm-letter__button--disagree"
          @click="handleDisagreeRiskConfirm"
        >
          {{ $lang('risk.confirm.letter.disagree') }}
        </div>
        <div
          class="c-mobile-risk-confirm-letter__button c-mobile-risk-confirm-letter__button--agree"
          @click="handleAgreeRiskConfirm"
        >
          {{ $lang('risk.confirm.letter.agree') }}
        </div>
      </div>
    </template>
  </mobile-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import MobileDialog from '@/components/common-base/dialog/mobile-dialog/mobile-dialog.vue';
import { useRiskConfirmLetterHook, RiskConfirmLetterRenderMode } from './use-risk-confirm-letter';

const {
  dialogVisible,
  viewerRiskConfirmInfo,
  curPreviewAgreement,

  riskConfirmLetterRenderMode,
  contentWrapperStyle,

  resetRiskConfirmLetterRenderMode,
  handlePreviewAgreement,
  handlePreviewDefaultAgreement,
  handleAgreeRiskConfirm,
  handleDisagreeRiskConfirm,
} = useRiskConfirmLetterHook();

const dialogContentStyle = computed(() => {
  return {
    width: `${document.body.clientWidth - 36}px`,
  };
});

const dialogTitle = computed(() => {
  if (riskConfirmLetterRenderMode.value === RiskConfirmLetterRenderMode.PREVIEW_AGREEMENT) {
    return curPreviewAgreement.title;
  }

  if (riskConfirmLetterRenderMode.value === RiskConfirmLetterRenderMode.DISAGREE_TIPS) {
    return '';
  }

  return viewerRiskConfirmInfo.value?.popupTitle || '欢迎进入直播间';
});

const isShowDialogHeader = computed(() => {
  return riskConfirmLetterRenderMode.value !== RiskConfirmLetterRenderMode.DISAGREE_TIPS;
});
</script>

<style lang="scss">
// 预览协议
.c-mobile-risk-confirm-letter__content__preview-agreement {
  padding: 0 20px;
  margin: 16px 4px;
}
.c-mobile-risk-confirm-letter__content__preview-agreement-pdf {
  width: 100%;
  height: 400px;
  border: 0;
}

// "不同意"的提示
.c-mobile-risk-confirm-letter__content__disagree-tips {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 72px 20px 16px 20px;
  margin: 0 4px;
  img {
    width: 120px;
    height: 120px;
  }
}
.c-mobile-risk-confirm-letter__content__disagree-tips-text {
  font-size: 14px;
  line-height: 1.5;
  color: #9e9e9e;
  text-align: center;
  word-break: break-all;
}

// 默认展示
.c-mobile-risk-confirm-letter__content-wrapper {
  position: relative;
}
.c-mobile-risk-confirm-letter__content {
  padding: 0 20px 16px;
  margin: 16px 4px;
  overflow: auto;
  cursor: default;
}
.c-mobile-risk-confirm-letter__content-text {
  font-size: 14px;
  line-height: 1.5;
  color: #757575;
  word-break: break-all;
}
.c-mobile-risk-confirm-letter__content-text--channelName {
  color: $--font-color-primary;
}
.c-mobile-risk-confirm-letter__content-text-href {
  color: $--finance-primary-text-color;
  text-decoration: none;
  cursor: pointer;
}
// 分割线
.c-mobile-risk-confirm-letter__bottom-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 16px;
  background: linear-gradient(0deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%);
}

// 共用按钮
.c-mobile-risk-confirm-letter__button-wrapper {
  display: flex;
  justify-content: center;
  background: $--color-white;
}
.c-mobile-risk-confirm-letter__button {
  box-sizing: border-box;
  padding: 13px 48px;
  font-size: 14px;
  color: $--color-white;

  text-align: center;
  cursor: pointer;
  background: $--finance-primary-bg-color;
  border-radius: 455.23px;
}
.c-mobile-risk-confirm-letter__button--disagree {
  padding: 13px 21px;
  margin-right: 16px;
  color: $--font-color-primary;
  background: $--color-white;
  border: 1px solid rgba(51, 51, 51, 0.2);
}
.c-mobile-risk-confirm-letter__button--back,
.c-mobile-risk-confirm-letter__button--viewAgreement {
  padding: 13px 70px;
}
</style>
