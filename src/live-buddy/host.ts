interface LiveTermEvent {
  /** 省略时由宿主按当前页面补全，避免字幕模块重复拼场次 ID */
  sessionId?: string;
  term: string;
  translation?: string;
  explanation?: string;
  timestamp?: number;
  /** 同一术语在一句字幕里出现的次数 */
  occurrences?: number;
  source?: 'subtitle' | 'manual';
}

interface LiveQuestionEvent {
  sessionId: string;
  id?: string;
  title: string;
  options?: Array<{ key: string; text: string }>;
  correctAnswers?: string[];
  explanation?: string;
  status?: 'open' | 'closed' | 'unknown';
  answerVisible?: boolean;
  submittedAnswers?: string[];
  source?: 'answer-card' | 'manual';
  askedAt?: number;
}

interface LiveContextEvent {
  sessionId?: string;
  text: string;
  timestamp?: number;
}

type LiveBuddyHostMessage =
  | { type: 'live-buddy:term'; detail: LiveTermEvent }
  | { type: 'live-buddy:question'; detail: LiveQuestionEvent }
  | { type: 'live-buddy:context'; detail: LiveContextEvent }
  | { type: 'live-buddy:ask'; question: string }
  | { type: 'live-buddy:open' }
  | { type: 'live-buddy:close' };

declare global {
  interface Window {
    LiveBuddy?: {
      injectTerm: (event: LiveTermEvent) => void;
      injectQuestion: (event: LiveQuestionEvent) => void;
      setLiveContext: (event: LiveContextEvent) => void;
      /** 一句话把问题送进小助手：自动展开面板、切到「问 AI」并发送 */
      ask: (question: string) => void;
      openPanel: () => void;
      closePanel: () => void;
    };
    __liveBuddyWidgetFrame?: HTMLIFrameElement;
  }
}

const FRAME_ID = 'live-buddy-widget-frame';
const DRAG_STATE_MESSAGE = 'live-buddy:drag-state';
const FRAME_TRANSITION =
  'width 260ms cubic-bezier(0.22, 0.8, 0.26, 1), height 260ms cubic-bezier(0.22, 0.8, 0.26, 1), left 260ms cubic-bezier(0.22, 0.8, 0.26, 1), top 260ms cubic-bezier(0.22, 0.8, 0.26, 1)';
type WidgetLayout = 'closed' | 'quick' | 'panel';
type DockAction = 'quick' | 'note' | 'panel';

function getDockMessageType(action: DockAction) {
  if (action === 'quick') return 'live-buddy:quick';
  if (action === 'note') return 'live-buddy:note';
  return 'live-buddy:open';
}

interface HostPageContext {
  channelId: string;
  playbackVid: string;
  sessionId: string;
  mode: 'demo' | 'live';
  apiUrl: string;
}

/**
 * 观看页与 iframe 必须拿到同一个场次 ID，否则 widget 会丢弃术语事件。
 * 这里集中算一次，URL 与 window.LiveBuddy 注入共用。
 */
function readPageContext(): HostPageContext {
  const pageQuery = new URLSearchParams(window.location.search);
  const channelId = pageQuery.get('channelId') || '';
  const playbackVid =
    pageQuery.get('playBackVid') || pageQuery.get('vid') || pageQuery.get('videoId') || '';
  return {
    channelId,
    playbackVid,
    sessionId:
      pageQuery.get('targetSessionId') ||
      pageQuery.get('sessionId') ||
      `playback-${channelId}-${playbackVid || 'live'}`,
    // 接入真实观看页后默认走真实模式；只有显式 liveBuddyMode=demo 才加载演示数据
    mode: pageQuery.get('liveBuddyMode') === 'demo' ? 'demo' : 'live',
    // 本机访问落到 127.0.0.1；手机/其他电脑经局域网访问时必须指向开发机的 IP，
    // 否则 127.0.0.1 在对方设备上指向它自己，会直接 ERR_FAILED。
    apiUrl:
      pageQuery.get('liveBuddyApiUrl') ||
      `http://${window.location.hostname || '127.0.0.1'}:8787/api/chat`,
  };
}

function createWidgetUrl(context: HostPageContext): string {
  const pageQuery = new URLSearchParams(window.location.search);
  const widgetUrl = new URL('/live-buddy/widget.html', window.location.origin);
  widgetUrl.searchParams.set('embed', '1');
  widgetUrl.searchParams.set('mode', context.mode);
  widgetUrl.searchParams.set('channelId', context.channelId);
  widgetUrl.searchParams.set('sessionId', context.sessionId);
  widgetUrl.searchParams.set('targetSessionId', context.sessionId);
  widgetUrl.searchParams.set('appId', pageQuery.get('appId') || 'hmpc5skuwx');
  widgetUrl.searchParams.set('playbackVid', context.playbackVid);
  widgetUrl.searchParams.set('apiUrl', context.apiUrl);
  if (context.mode === 'demo') widgetUrl.searchParams.set('seed', 'demo');
  return widgetUrl.toString();
}

function postToWidget(frame: HTMLIFrameElement, message: LiveBuddyHostMessage) {
  frame.contentWindow?.postMessage(message, window.location.origin);
}

// live-buddy/src/widget.css 把嵌入态宠物按钮固定为 122×122、right 16、bottom 42；
// 快捷态则把整个宠物移到 iframe 顶部居中。透明拖拽手柄按这两种内部布局定位。
const PET_BUTTON_SIZE = 122;
const PET_BUTTON_HALF = 61;
const PET_BUTTON_TOP = 34;

function getWidgetSize(layout: WidgetLayout) {
  const mobile = window.innerWidth <= 640;
  const margin = mobile ? 8 : 12;
  const availableWidth = window.innerWidth - margin * 2;
  const availableHeight = window.innerHeight - margin * 2;

  if (layout === 'panel') {
    if (mobile) {
      return {
        width: Math.min(320, availableWidth),
        height: Math.min(480, availableHeight),
      };
    }
    return {
      width: Math.min(380, availableWidth),
      height: Math.min(600, availableHeight),
    };
  }
  if (layout === 'quick') {
    return { width: mobile ? availableWidth : 368, height: mobile ? 212 : 222 };
  }
  return { width: 154, height: 198 };
}

export function setupLiveBuddyHost() {
  const pageQuery = new URLSearchParams(window.location.search);
  if (pageQuery.get('liveBuddy') === '0') return;

  const hostContext = readPageContext();
  let widgetReady = false;
  const pendingMessages: LiveBuddyHostMessage[] = [];

  document.getElementById(FRAME_ID)?.remove();

  const frame = document.createElement('iframe');
  frame.id = FRAME_ID;
  frame.title = '直播小伙伴 AI 学习宠物';
  frame.src = createWidgetUrl(hostContext);
  frame.allow = 'clipboard-write';
  frame.setAttribute('aria-label', '直播小伙伴 AI 学习宠物');
  frame.style.position = 'fixed';
  frame.style.zIndex = '2147483000';
  frame.style.border = '0';
  frame.style.background = 'transparent';
  frame.style.colorScheme = 'light';
  frame.style.transition = FRAME_TRANSITION;

  const dragHandle = document.createElement('div');
  dragHandle.id = 'live-buddy-drag-handle';
  dragHandle.setAttribute('role', 'button');
  dragHandle.setAttribute('tabindex', '0');
  dragHandle.setAttribute('aria-label', '拖动直播小伙伴，左键挠痒');
  dragHandle.style.position = 'fixed';
  dragHandle.style.zIndex = '2147483001';
  dragHandle.style.width = '154px';
  dragHandle.style.height = '198px';
  dragHandle.style.cursor = 'grab';
  dragHandle.style.touchAction = 'none';
  dragHandle.style.borderRadius = '44%';

  const dragShield = document.createElement('div');
  dragShield.setAttribute('aria-hidden', 'true');
  dragShield.style.position = 'fixed';
  dragShield.style.zIndex = '2147483002';
  dragShield.style.inset = '0';
  dragShield.style.display = 'none';
  dragShield.style.cursor = 'grabbing';
  dragShield.style.touchAction = 'none';

  const panelDragHandle = document.createElement('div');
  panelDragHandle.id = 'live-buddy-panel-drag-handle';
  panelDragHandle.setAttribute('role', 'button');
  panelDragHandle.setAttribute('tabindex', '0');
  panelDragHandle.setAttribute('aria-label', '拖动直播小伙伴主界面');
  panelDragHandle.style.position = 'fixed';
  panelDragHandle.style.zIndex = '2147483001';
  panelDragHandle.style.display = 'none';
  panelDragHandle.style.cursor = 'move';
  panelDragHandle.style.touchAction = 'none';

  let layout: WidgetLayout = pageQuery.get('liveBuddyOpen') === '1' ? 'panel' : 'closed';
  let petCenterX = window.innerWidth - 196;
  let petTop = window.innerHeight - 200;
  let panelOffset = { x: 0, y: 0 };
  /** 面板未叠加拖动偏移时的基准位置，用于把拖动换算成绝对偏移 */
  let panelBase = { left: 0, top: 0 };
  let dragStart:
    | { screenX: number; screenY: number; petCenterX: number; petTop: number }
    | undefined;
  let dockAction: DockAction | undefined;
  let dragDirection: 'left' | 'right' | null = null;
  let pendingDragOffset = { x: 0, y: 0 };
  let dragFrameId: number | undefined;
  let transitionRestoreId: number | undefined;
  let panelDragStart:
    | {
        screenX: number;
        screenY: number;
        offsetX: number;
        offsetY: number;
        left: number;
        top: number;
        baseLeft: number;
        baseTop: number;
        width: number;
        height: number;
      }
    | undefined;
  let panelDragFrameId: number | undefined;
  let pendingPanelOffset = { x: 0, y: 0 };

  const setFrameState = (nextLayout: WidgetLayout) => {
    const previousLayout = layout;
    layout = nextLayout;
    if (nextLayout === 'panel' && previousLayout !== 'panel') panelOffset = { x: 0, y: 0 };
    if (nextLayout !== 'panel') panelOffset = { x: 0, y: 0 };
    const mobile = window.innerWidth <= 640;
    const margin = mobile ? 8 : 12;
    const size = getWidgetSize(nextLayout);
    const safeCenterInset = mobile ? window.innerWidth / 2 : 184;
    petCenterX = Math.max(
      margin + safeCenterInset,
      Math.min(window.innerWidth - margin - safeCenterInset, petCenterX),
    );
    petTop = Math.max(margin, Math.min(window.innerHeight - margin - 188, petTop));

    let left: number;
    let top: number;

    if (nextLayout === 'panel') {
      // 面板 iframe 只有 380px 宽，widget 内部按移动端样式把宠物隐藏、面板铺满；
      // 所以这里仍按“面板独立定位”放在宠物原位置旁边。
      const panelGap = 16;
      const petHalfWidth = 61;
      const petLeft = petCenterX - petHalfWidth;
      const petRight = petCenterX + petHalfWidth;
      const canOpenPanelRight = petRight + panelGap + size.width <= window.innerWidth - margin;
      left = canOpenPanelRight
        ? petRight + panelGap
        : Math.max(margin, petLeft - panelGap - size.width);
      top = petTop + petHalfWidth - size.height / 2;
      left = Math.max(margin, Math.min(window.innerWidth - size.width - margin, left));
      top = Math.max(margin, Math.min(window.innerHeight - size.height - margin, top));
      panelBase = { left, top };
      left = Math.max(
        margin,
        Math.min(window.innerWidth - size.width - margin, left + panelOffset.x),
      );
      top = Math.max(
        margin,
        Math.min(window.innerHeight - size.height - margin, top + panelOffset.y),
      );
    } else {
      // 折叠态按钮在右下角，快捷态按钮在顶部居中（见 widget.css），
      // 两种布局都以 petCenterX 为水平中心、petTop 为按钮顶部。
      left = petCenterX - size.width / 2;
      top = petTop - PET_BUTTON_TOP;
      left = Math.max(margin, Math.min(window.innerWidth - size.width - margin, left));
      top = Math.max(margin, Math.min(window.innerHeight - size.height - margin, top));
    }

    frame.classList.toggle('is-open', nextLayout === 'panel');
    frame.classList.toggle('is-quick', nextLayout === 'quick');
    frame.style.width = `${size.width}px`;
    frame.style.height = `${size.height}px`;
    frame.style.left = `${left}px`;
    frame.style.top = `${top}px`;
    frame.style.right = 'auto';
    frame.style.bottom = 'auto';

    if (nextLayout === 'panel') {
      panelDragHandle.style.display = 'block';
      panelDragHandle.style.left = `${left + 8}px`;
      panelDragHandle.style.top = `${top + 8}px`;
      panelDragHandle.style.width = `${Math.max(80, size.width - 64)}px`;
      panelDragHandle.style.height = '54px';
    } else {
      panelDragHandle.style.display = 'none';
    }

    // 面板态下 widget 会把宠物隐藏，不要再放透明手柄，避免挡住面板内容。
    const showPetHandle = nextLayout !== 'panel';
    dragHandle.style.display = showPetHandle ? 'block' : 'none';
    if (showPetHandle) {
      if (nextLayout === 'closed') {
        dragHandle.style.width = '154px';
        dragHandle.style.height = '198px';
        dragHandle.style.left = `${left}px`;
        dragHandle.style.top = `${top}px`;
      } else {
        dragHandle.style.width = `${PET_BUTTON_SIZE}px`;
        dragHandle.style.height = `${PET_BUTTON_SIZE}px`;
        dragHandle.style.left = `${left + size.width / 2 - PET_BUTTON_HALF}px`;
        dragHandle.style.top = `${top + PET_BUTTON_TOP}px`;
      }
    }
  };

  setFrameState(layout);
  document.body.appendChild(dragHandle);
  document.body.appendChild(panelDragHandle);
  document.body.appendChild(dragShield);
  document.body.appendChild(frame);
  window.__liveBuddyWidgetFrame = frame;

  const postWidgetMessage = (message: Record<string, unknown>) => {
    frame.contentWindow?.postMessage(message, window.location.origin);
  };

  const readPlaybackTime = () => {
    const video = Array.from(document.querySelectorAll('video')).sort(
      (a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight,
    )[0];
    return Number.isFinite(video?.currentTime) ? video.currentTime : undefined;
  };

  const handleDragStart = (event: PointerEvent) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const rect = dragHandle.getBoundingClientRect();
    if (layout === 'closed' && event.clientY >= rect.bottom - 54) {
      const horizontalRatio = (event.clientX - rect.left) / rect.width;
      dockAction = horizontalRatio < 0.38 ? 'quick' : horizontalRatio < 0.64 ? 'note' : 'panel';
      dragHandle.setPointerCapture(event.pointerId);
      return;
    }
    dragStart = {
      screenX: event.screenX,
      screenY: event.screenY,
      petCenterX,
      petTop,
    };
    dragShield.style.display = 'block';
    dragHandle.style.cursor = 'grabbing';
    dragHandle.style.willChange = 'transform';
    frame.style.willChange = 'transform';
    frame.style.transition = 'none';
    dragHandle.style.transition = 'none';
    postWidgetMessage({ type: DRAG_STATE_MESSAGE, dragging: true, direction: null });
  };

  const handleDragMove = (event: PointerEvent) => {
    if (panelDragStart) return;
    if (!dragStart && !dockAction) {
      const rect = dragHandle.getBoundingClientRect();
      dragHandle.style.cursor =
        layout === 'closed' && event.clientY >= rect.bottom - 54 ? 'pointer' : 'grab';
    }
    if (dockAction) return;
    if (!dragStart) return;
    const margin = window.innerWidth <= 640 ? 8 : 12;
    const safeCenterInset = window.innerWidth <= 640 ? window.innerWidth / 2 : 184;
    const nextPetCenterX = Math.max(
      margin + safeCenterInset,
      Math.min(
        window.innerWidth - margin - safeCenterInset,
        dragStart.petCenterX + event.screenX - dragStart.screenX,
      ),
    );
    const nextPetTop = Math.max(
      margin,
      Math.min(
        window.innerHeight - margin - 188,
        dragStart.petTop + event.screenY - dragStart.screenY,
      ),
    );
    pendingDragOffset = {
      x: nextPetCenterX - dragStart.petCenterX,
      y: nextPetTop - dragStart.petTop,
    };

    const nextDirection =
      Math.abs(pendingDragOffset.x) < 2
        ? dragDirection
        : pendingDragOffset.x < 0
        ? 'left'
        : 'right';
    if (nextDirection !== dragDirection) {
      dragDirection = nextDirection;
      postWidgetMessage({
        type: DRAG_STATE_MESSAGE,
        dragging: true,
        direction: dragDirection,
      });
    }

    if (dragFrameId !== undefined) return;
    dragFrameId = window.requestAnimationFrame(() => {
      dragFrameId = undefined;
      const transform = `translate3d(${pendingDragOffset.x}px, ${pendingDragOffset.y}px, 0)`;
      frame.style.transform = transform;
      dragHandle.style.transform = transform;
    });
  };

  const finishDockAction = (event: PointerEvent): boolean => {
    if (dockAction) {
      const action = dockAction;
      dockAction = undefined;
      dragHandle.style.cursor = 'grab';
      if (event.button === 0) {
        postWidgetMessage({ type: getDockMessageType(action) });
        if (action === 'note') {
          postWidgetMessage({
            type: 'live-buddy:note-context',
            timestamp: readPlaybackTime(),
          });
        }
      }
      return true;
    }
    return false;
  };

  const commitDraggedPosition = (event: PointerEvent): boolean => {
    if (!dragStart) return false;
    const moved =
      Math.hypot(event.screenX - dragStart.screenX, event.screenY - dragStart.screenY) > 4;
    if (!moved) return false;
    const margin = window.innerWidth <= 640 ? 8 : 12;
    const safeCenterInset = window.innerWidth <= 640 ? window.innerWidth / 2 : 184;
    petCenterX = Math.max(
      margin + safeCenterInset,
      Math.min(
        window.innerWidth - margin - safeCenterInset,
        dragStart.petCenterX + event.screenX - dragStart.screenX,
      ),
    );
    petTop = Math.max(
      margin,
      Math.min(
        window.innerHeight - margin - 188,
        dragStart.petTop + event.screenY - dragStart.screenY,
      ),
    );
    return true;
  };

  const handlePanelDragStart = (event: PointerEvent) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const rect = frame.getBoundingClientRect();
    // rect 已经包含上一次提交的 panelOffset；拖动期间帧的 left/top 不变，
    // transform 只能叠加本次指针位移，否则累计偏移会被重复应用，越拖越偏。
    const offsetX = rect.left - panelBase.left;
    const offsetY = rect.top - panelBase.top;
    panelDragStart = {
      screenX: event.screenX,
      screenY: event.screenY,
      offsetX,
      offsetY,
      left: rect.left,
      top: rect.top,
      baseLeft: panelBase.left,
      baseTop: panelBase.top,
      width: rect.width,
      height: rect.height,
    };
    pendingPanelOffset = { x: offsetX, y: offsetY };
    dragShield.style.display = 'block';
    dragShield.style.cursor = 'move';
    dragShield.setPointerCapture(event.pointerId);
    frame.style.transition = 'none';
    frame.style.willChange = 'transform';
    // 拖动期间让 widget 关掉面板的大面积 backdrop-filter，减少重绘卡顿
    postWidgetMessage({ type: DRAG_STATE_MESSAGE, dragging: true, direction: null });
  };

  const handlePanelDragMove = (event: PointerEvent) => {
    const start = panelDragStart;
    if (!start) return;
    const margin = window.innerWidth <= 640 ? 8 : 12;
    const nextLeft = Math.max(
      margin,
      Math.min(
        window.innerWidth - margin - start.width,
        start.left + event.screenX - start.screenX,
      ),
    );
    const nextTop = Math.max(
      margin,
      Math.min(
        window.innerHeight - margin - start.height,
        start.top + event.screenY - start.screenY,
      ),
    );
    pendingPanelOffset = {
      x: nextLeft - start.baseLeft,
      y: nextTop - start.baseTop,
    };
    if (panelDragFrameId !== undefined) return;
    panelDragFrameId = window.requestAnimationFrame(() => {
      panelDragFrameId = undefined;
      // pendingPanelOffset 始终是最新一次指针位置，避免回调用到上一帧的旧坐标
      frame.style.transform = `translate3d(${pendingPanelOffset.x - start.offsetX}px, ${
        pendingPanelOffset.y - start.offsetY
      }px, 0)`;
    });
  };

  const handlePanelDragEnd = (event: PointerEvent) => {
    if (!panelDragStart) return;
    if (panelDragFrameId !== undefined) {
      cancelAnimationFrame(panelDragFrameId);
      panelDragFrameId = undefined;
    }
    panelOffset = pendingPanelOffset;
    panelDragStart = undefined;
    dragShield.style.display = 'none';
    dragShield.style.cursor = 'grabbing';
    frame.style.transform = 'none';
    frame.style.willChange = 'auto';
    setFrameState('panel');
    postWidgetMessage({ type: DRAG_STATE_MESSAGE, dragging: false, direction: null });
    if (transitionRestoreId !== undefined) cancelAnimationFrame(transitionRestoreId);
    transitionRestoreId = window.requestAnimationFrame(() => {
      transitionRestoreId = undefined;
      frame.style.transition = FRAME_TRANSITION;
    });
    if (dragShield.hasPointerCapture(event.pointerId)) {
      dragShield.releasePointerCapture(event.pointerId);
    }
  };

  const handleDragEnd = (event: PointerEvent) => {
    if (!dockAction && !dragStart) return;
    if (dragShield.hasPointerCapture(event.pointerId)) {
      dragShield.releasePointerCapture(event.pointerId);
    }
    if (finishDockAction(event)) return;
    const hadDragStart = Boolean(dragStart);
    const moved = commitDraggedPosition(event);
    if (dragFrameId !== undefined) {
      cancelAnimationFrame(dragFrameId);
      dragFrameId = undefined;
    }
    dragStart = undefined;
    dragHandle.style.cursor = 'grab';
    dragHandle.style.willChange = 'auto';
    dragShield.style.display = 'none';
    frame.style.willChange = 'auto';
    frame.style.transform = 'none';
    dragHandle.style.transform = 'none';
    setFrameState(layout);
    if (transitionRestoreId !== undefined) cancelAnimationFrame(transitionRestoreId);
    transitionRestoreId = window.requestAnimationFrame(() => {
      transitionRestoreId = undefined;
      frame.style.transition = FRAME_TRANSITION;
      dragHandle.style.transition = FRAME_TRANSITION;
    });
    if (hadDragStart) {
      dragDirection = null;
      postWidgetMessage({
        type: DRAG_STATE_MESSAGE,
        dragging: false,
        direction: null,
      });
    }
    if (!moved && event.button === 0) postWidgetMessage({ type: 'live-buddy:poke' });
  };

  dragHandle.addEventListener('pointerdown', handleDragStart);
  dragHandle.addEventListener('pointermove', handleDragMove);
  dragHandle.addEventListener('pointerup', handleDragEnd);
  dragHandle.addEventListener('pointercancel', handleDragEnd);
  panelDragHandle.addEventListener('pointerdown', handlePanelDragStart);
  dragShield.addEventListener('pointermove', handleDragMove);
  dragShield.addEventListener('pointermove', handlePanelDragMove);
  dragShield.addEventListener('pointerup', handleDragEnd);
  dragShield.addEventListener('pointerup', handlePanelDragEnd);
  dragShield.addEventListener('pointercancel', handleDragEnd);
  dragShield.addEventListener('pointercancel', handlePanelDragEnd);
  dragHandle.addEventListener('mouseenter', () =>
    postWidgetMessage({ type: 'live-buddy:hover', hover: true }),
  );
  dragHandle.addEventListener('mouseleave', () =>
    postWidgetMessage({ type: 'live-buddy:hover', hover: false }),
  );
  dragHandle.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      postWidgetMessage({ type: 'live-buddy:poke' });
    }
  });
  dragHandle.addEventListener('contextmenu', event => event.preventDefault());

  window.addEventListener(
    'pointerdown',
    event => {
      if (layout !== 'quick') return;
      if (
        event.target === frame ||
        event.target === dragHandle ||
        event.target === panelDragHandle
      ) {
        return;
      }
      postWidgetMessage({ type: 'live-buddy:close-quick' });
    },
    true,
  );

  window.addEventListener('resize', () => setFrameState(layout));

  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow || event.origin !== window.location.origin) {
      return;
    }
    if (event.data?.type === 'live-buddy:resize') {
      setFrameState(event.data.layout as WidgetLayout);
    }
    if (event.data?.type === 'live-buddy:drag-start') {
      dragStart = {
        screenX: Number(event.data.screenX),
        screenY: Number(event.data.screenY),
        petCenterX,
        petTop,
      };
    }
    if (event.data?.type === 'live-buddy:drag' && dragStart) {
      const margin = window.innerWidth <= 640 ? 8 : 12;
      const safeCenterInset = window.innerWidth <= 640 ? window.innerWidth / 2 : 184;
      petCenterX = Math.max(
        margin + safeCenterInset,
        Math.min(
          window.innerWidth - margin - safeCenterInset,
          dragStart.petCenterX + Number(event.data.screenX) - dragStart.screenX,
        ),
      );
      petTop = Math.max(
        margin,
        Math.min(
          window.innerHeight - margin - 188,
          dragStart.petTop + Number(event.data.screenY) - dragStart.screenY,
        ),
      );
      setFrameState(layout);
    }
    if (event.data?.type === 'live-buddy:drag-end') {
      dragStart = undefined;
    }
  });

  const forward = (message: LiveBuddyHostMessage) => {
    if (!widgetReady) {
      pendingMessages.push(message);
      return;
    }
    postToWidget(frame, message);
  };

  // 场次 ID 由宿主统一补全：字幕模块只关心术语本身，避免两处拼字符串拼出不一致
  const withSession = <T extends { sessionId?: string }>(detail: T): T => ({
    ...detail,
    sessionId: hostContext.sessionId,
  });

  window.LiveBuddy = {
    injectTerm: detail => forward({ type: 'live-buddy:term', detail: withSession(detail) }),
    injectQuestion: detail => forward({ type: 'live-buddy:question', detail: withSession(detail) }),
    setLiveContext: detail => forward({ type: 'live-buddy:context', detail: withSession(detail) }),
    ask: question => {
      const clean = question.trim();
      if (clean) forward({ type: 'live-buddy:ask', question: clean });
    },
    openPanel: () => forward({ type: 'live-buddy:open' }),
    closePanel: () => forward({ type: 'live-buddy:close' }),
  };

  window.addEventListener('live-buddy:term', event => {
    const detail = (event as CustomEvent<LiveTermEvent>).detail;
    if (detail) forward({ type: 'live-buddy:term', detail: withSession(detail) });
  });
  window.addEventListener('live-buddy:question', event => {
    const detail = (event as CustomEvent<LiveQuestionEvent>).detail;
    if (detail) forward({ type: 'live-buddy:question', detail: withSession(detail) });
  });
  window.addEventListener('live-buddy:context', event => {
    const detail = (event as CustomEvent<LiveContextEvent>).detail;
    if (detail) forward({ type: 'live-buddy:context', detail: withSession(detail) });
  });

  frame.addEventListener(
    'load',
    () => {
      widgetReady = true;
      pendingMessages.splice(0).forEach(message => postToWidget(frame, message));

      const postNoteContext = () =>
        postWidgetMessage({
          type: 'live-buddy:note-context',
          timestamp: readPlaybackTime(),
        });

      postNoteContext();
      window.setInterval(postNoteContext, 1000);
      if (pageQuery.get('liveBuddyOpen') === '1') {
        forward({ type: 'live-buddy:open' });
      }
    },
    { once: true },
  );
}
