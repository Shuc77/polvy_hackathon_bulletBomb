/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POLYV_APP_ID?: string;
  readonly VITE_POLYV_CHANNEL_ID?: string;
  readonly VITE_POLYV_TARGET_SESSION_ID?: string;
  readonly VITE_AI_API_URL?: string;
  readonly VITE_LIVE_BUDDY_SDK_DIR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  LiveBuddy?: {
    injectTerm: (event: import('./types').LiveTermEvent) => void;
    injectQuestion: (event: import('./types').LiveQuestionEvent) => void;
    setLiveContext: (event: import('./types').LiveContextEvent) => void;
    setSession: (sessionId: string) => void;
    setMode: (mode: import('./types').RuntimeMode) => void;
    openPanel: () => void;
    closePanel: () => void;
  };
}
