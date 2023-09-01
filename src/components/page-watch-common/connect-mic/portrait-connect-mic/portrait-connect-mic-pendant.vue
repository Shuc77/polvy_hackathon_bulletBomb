<!-- @file 移动端连麦挂件 -->
<template>
  <div
    ref="wrapRef"
    class="c-portrait-connect-mic-pendant"
    :style="{
      width: `${pendantWidth}px`,
      top: `${top}px`,
    }"
  >
    <div
      ref="contentRef"
      class="c-portrait-connect-mic-pendant__content"
    >
      <!-- 申请连麦 -->
      <div
        v-if="connectMicStatus === ConnectMicStatus.NotConnect"
        class="c-portrait-connect-mic-pendant__button c-portrait-connect-mic-pendant__button--apply"
        @click="openApplyTips"
      ></div>
      <div
        v-if="connectMicStatus === ConnectMicStatus.NotConnect"
        class="c-portrait-connect-mic-pendant__tips"
        @click="openApplyTips"
      >
        {{
          connectMicType === ConnectMicType.Video
            ? $lang('connectMic.applyConnect.videoApply')
            : $lang('connectMic.applyConnect.audioApply')
        }}
      </div>

      <!-- 取消申请 -->
      <div
        v-if="connectMicStatus === ConnectMicStatus.Applying"
        class="c-portrait-connect-mic-pendant__button c-portrait-connect-mic-pendant__button--cut"
        @click="cancelApplyConnectMic"
      ></div>

      <div
        v-if="connectMicStatus === ConnectMicStatus.Applying"
        class="c-portrait-connect-mic-pendant__tips"
        @click="cancelApplyConnectMic"
      >
        {{ $lang('connectMic.applying2') }}...
      </div>

      <!-- 展开挂件 -->
      <div
        v-if="connectMicStatus === ConnectMicStatus.Connected && !pendantOpened"
        class="c-portrait-connect-mic-pendant__button c-portrait-connect-mic-pendant__button--open"
        @click="openPendant"
      ></div>

      <!-- 挂断 -->
      <div
        v-if="
          connectMicStatus === ConnectMicStatus.Publishing ||
          connectMicStatus === ConnectMicStatus.Connected
        "
        class="c-portrait-connect-mic-pendant__button c-portrait-connect-mic-pendant__button--cut"
        @click="handlerEndConnectTip"
      ></div>

      <div
        v-if="connectMicStatus === ConnectMicStatus.Publishing"
        class="c-portrait-connect-mic-pendant__tips"
        @click="endConnectMic"
      >
        {{ $lang('connectMic.applying2') }}...
      </div>

      <!-- 摄像头开关 -->
      <div
        v-if="
          connectMicStatus === ConnectMicStatus.Connected &&
          localConnectMicType === ConnectMicType.Video
        "
        class="c-portrait-connect-mic-pendant__button"
        :class="{
          'c-portrait-connect-mic-pendant__button--video-normal': !localIsVideoMuted,
          'c-portrait-connect-mic-pendant__button--video-muted': localIsVideoMuted,
        }"
        @click="toggleVideo"
      ></div>

      <!-- 麦克风开关 -->
      <div
        v-if="connectMicStatus === ConnectMicStatus.Connected"
        class="c-portrait-connect-mic-pendant__button"
        :class="{
          'c-portrait-connect-mic-pendant__button--audio-normal': !localIsAudioMuted,
          'c-portrait-connect-mic-pendant__button--audio-muted': localIsAudioMuted,
        }"
        @click="toggleAudio"
      ></div>

      <!-- 隐藏 -->
      <div
        v-if="connectMicStatus === ConnectMicStatus.Connected"
        class="c-portrait-connect-mic-pendant__hide"
        @click="closePendant"
      ></div>
    </div>

    <!-- 申请连麦提示弹层 -->
    <mobile-popup
      class="c-portrait-connect-mic-pendant__apply-tips"
      :visible.sync="applyTipsVisible"
      :title="$lang('base.tips')"
    >
      <div class="c-portrait-connect-mic-pendant__apply-tips__content">
        <mobile-icon-video-call
          v-if="connectMicType === ConnectMicType.Video"
          class="c-portrait-connect-mic-pendant__apply-tips__icon"
        />
        <mobile-icon-voice-call
          v-else
          class="c-portrait-connect-mic-pendant__apply-tips__icon"
        />
        <p class="c-portrait-connect-mic-pendant__apply-tips__text">
          <template v-if="connectMicType === ConnectMicType.Video">
            {{ $lang('connectMic.openVideoTips') }}
          </template>
          <template v-else>{{ $lang('connectMic.openAudioTips') }}</template>
          <br />
          {{ $lang('connectMic.agreement') }}
          <br />
          {{ $lang('connectMic.joinConnect') }}
        </p>
        <normal-button
          :text="$lang('connectMic.applyConnect')"
          block
          :type="ButtonType.Portrait"
          :size="ButtonSize.Medium"
          @click="onClickApplyConfirm"
        />
      </div>
    </mobile-popup>

    <mobile-popup
      :visible.sync="endConnectTipVisible"
      :title="$lang('base.tips')"
    >
      <div class="c-portrait-connect-mic-handup-tip">
        <div class="c-portrait-connect-mic-handup-text">
          {{ $lang('connectMic.handup.tips') }}
        </div>
        <normal-button
          :text="$lang('base.confirm')"
          block
          :type="ButtonType.Portrait"
          :size="ButtonSize.Medium"
          @click="handlerEndConnect"
        />
        <normal-button
          :text="$lang('base.cancel')"
          block
          :type="ButtonType.Cancel"
          style="margin-top: 16px"
          :size="ButtonSize.Medium"
          @click="endConnectTipVisible = false"
        />
      </div>
    </mobile-popup>
  </div>
</template>

<script setup lang="ts">
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { MobileIconVideoCall, MobileIconVoiceCall } from '@/components/component-icons/mobile/map';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';

import { ConnectMicStatus, ConnectMicType } from '@polyv/live-watch-sdk';
import { useAppendTo } from '@/hooks/behaviors/use-append-to';
import { nextTick, onMounted, ref, unref, watch } from 'vue';

import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { useConnectMic, useConnectMicApply, useConnectMicControl } from '../hooks/use-connect-mic';
import { useAsideDrag } from '@/hooks/behaviors/use-aside-drag';
import { useLayoutStore } from '@/store/use-layout-store';

/** 外层节点 */
const wrapRef = ref<HTMLDivElement>();
/** 挂件内容节点 */
const contentRef = ref<HTMLDivElement>();
let closeTimer: number;

useAppendTo(wrapRef);

const {
  connectMicStatus,
  connectMicType,
  localIsVideoMuted,
  localIsAudioMuted,
  localConnectMicType,
} = storeDefinitionToRefs(useConnectMicStore);

const { mobileLayoutBottomTop, mobileMenuHeaderHeight } = storeDefinitionToRefs(useLayoutStore);

const { applyConnectMic, cancelApplyConnectMic } = useConnectMicApply();

const { endConnectMic, toggleVideo, toggleAudio } = useConnectMicControl();

useConnectMic();

/** 申请连麦提示弹层显示 */
const applyTipsVisible = ref(false);

const endConnectTipVisible = ref(false);

function handlerEndConnectTip() {
  endConnectTipVisible.value = true;
}

function handlerEndConnect() {
  endConnectMic();
  endConnectTipVisible.value = false;
}
/** 打开申请提示 */
function openApplyTips() {
  applyTipsVisible.value = true;
}

/** 处理点击申请确认 */
function onClickApplyConfirm() {
  applyConnectMic();
  applyTipsVisible.value = false;
  openPendant();
}

/** 挂件是否展开 */
const pendantOpened = ref(true);

/** 展开挂件 */
function openPendant() {
  pendantOpened.value = true;
  autoClosePendant();
}

function autoClosePendant() {
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = window.setTimeout(() => {
    closePendant();
  }, 5000);
}

/** 收起挂件 */
function closePendant() {
  pendantOpened.value = false;
}

onMounted(() => {
  setTimeout(() => {
    if (unref(connectMicStatus) === ConnectMicStatus.NotConnect) {
      closePendant();
    }
  }, 3000);
});

/** 挂件外层宽度 */
const pendantWidth = ref(46);

/** 计算挂件外层宽度 */
async function computePendantWidth() {
  await nextTick();

  let width = 46;
  const contentElem = unref(contentRef);

  if (unref(pendantOpened) && contentElem) {
    width = contentElem.clientWidth;
  }
  pendantWidth.value = width;
}

watch(
  () => [unref(pendantOpened), unref(connectMicStatus)],
  () => computePendantWidth(),
);

onMounted(() => {
  computePendantWidth();
});

const { top } = useAsideDrag({
  targetRef: wrapRef,
  getInitTop: () => {
    return unref(mobileLayoutBottomTop) + unref(mobileMenuHeaderHeight) + 72;
  },
});
</script>

<style lang="scss">
.c-portrait-connect-mic-pendant {
  position: fixed;
  top: 0;
  right: 0;
  z-index: $--zIndex-pendant;
  display: flex;
  overflow: hidden;
  transition: width 0.3s;
}

.c-portrait-connect-mic-pendant__content {
  display: flex;
  align-items: center;
  padding: 8px;
  color: #fff;
  white-space: nowrap;
  background-color: #4e4c5b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-right: 0;
  border-top-left-radius: 25px;
  border-bottom-left-radius: 25px;
  box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.1);
}

.c-portrait-connect-mic-pendant__button {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  overflow: hidden;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
  border-radius: 50%;
}

.c-portrait-connect-mic-pendant__button + .c-portrait-connect-mic-pendant__button {
  margin-left: 8px;
}

.c-portrait-connect-mic-pendant__button--apply {
  background-image: url(../imgs/btn-icon-default.png);
}
.c-portrait-connect-mic-pendant__button--cut {
  background-image: url(../imgs/btn-icon-hangup.png);
}
.c-portrait-connect-mic-pendant__button--video-normal {
  background-image: url(../imgs/btn-video-open.png);
}
.c-portrait-connect-mic-pendant__button--video-muted {
  background-image: url(../imgs/btn-video-close.png);
}
.c-portrait-connect-mic-pendant__button--audio-normal {
  background-image: url(../imgs/btn-audio-open.png);
}
.c-portrait-connect-mic-pendant__button--audio-muted {
  background-image: url(../imgs/btn-audio-close.png);
}
.c-portrait-connect-mic-pendant__button--open {
  background-image: url(../imgs/btn-set.png);
}

.c-portrait-connect-mic-pendant__tips {
  padding: 0 8px;
  font-size: 16px;
  line-height: 32px;
  color: $--color-white;
}

.c-portrait-connect-mic-pendant__hide {
  width: 32px;
  height: 32px;
  margin-left: 8px;
  background-image: url(../imgs/btn-close.png);
  background-repeat: no-repeat;
  background-position: center;
  background-size: 8px 14px;
}

.c-portrait-connect-mic-pendant__apply-tips__content,
.c-portrait-connect-mic-handup-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
}

.c-portrait-connect-mic-pendant__apply-tips__icon {
  display: flex;
  font-size: 120px !important;
  color: #dcdbdf;
}
.c-portrait-connect-mic-pendant__apply-tips__text {
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 22px;
  color: #666;
  text-align: center;
}
.c-portrait-connect-mic-handup-text {
  margin-bottom: 24px;
  font-size: 18px;
  line-height: 22px;
  color: #333;
  text-align: center;
}
</style>
