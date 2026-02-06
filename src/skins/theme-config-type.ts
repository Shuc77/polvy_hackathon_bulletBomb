import { CSSProperties } from 'vue';
import { SkinColorMode } from './enum';
import { LikeEffectType } from '@polyv/live-watch-sdk';

export interface WatchThemeStyleConfig {
  mode: SkinColorMode;
  themeColor: string;
  primaryColor: string;
  common: Common;
  mobile: Mobile;
  portrait: Portrait;
}

export interface Common {
  player: Player;
  chat: CommonChat;
  introArea: IntroArea;
  normalBtn: NormalBtn;
  pendant: Pendant;
}

export interface IntroArea {
  bg: string;
}

export interface CommonChat {
  msgInput: MsgInput;
  btn: Btn;
}

export interface Btn {
  donate: {
    iconUrl: string;
  };
  cart: {
    iconUrl: string;
    countVisible: boolean;
  };
  like: {
    iconUrl: string;
    countBg: string;
    countColor: string;
    effectType: LikeEffectType;
  };
  more: {
    iconUrl: string;
  };
}

export interface MsgInput {
  bg: string;
  borderColor: string;
}

export interface NormalBtn {
  bg: string;
  borderColor: string;
  color: string;
}

export interface Pendant {
  pushCardForQrCode: string;
  pushCardForNormal: string;
  coupon: string;
  feedback: string;
  lottery: string;
  conditionLottery: string;
  luckyLottery: string;
  invitePoster: string;
  redPacketRain: string;
  redPacketPwd: string;
  redPacket: string;
  taskPrizeEn: string;
  taskPrizeZh: string;
  topicPk: string;
  vote: string;
}

export interface SubscribeArea {
  bg: string;
  style: CSSProperties;
  countBg: string;
  countColor: string;
}

export interface Style {
  'border-image-slice': string;
  'border-image-width': string;
}

export interface Mobile {
  splash: MobileSplash;
  menu: Menu;
  chat: MobileChat;
}

interface MobileSplash {
  subscribeArea: SubscribeArea;
}

export interface Portrait {
  chat: MobileChat;
}
export interface MobileChat {
  bgUrl: string;
}

export interface Menu {
  bg: string;
  item: {
    fontColor: string;
  };
  activeItem: {
    bg: string;
    borderColor: string;
    icon: string;
    fontColor: string;
    underline: boolean;
  };
}

export interface Player {
  cover: string;
}

export function getDefaultWatchThemeConfig() {
  const defaultWatchThemeStyleConfig: WatchThemeStyleConfig = {
    mode: SkinColorMode.Dark,
    themeColor: '#202127',
    primaryColor: '#3F76FC',
    common: {
      player: {
        cover: '',
      },
      chat: {
        msgInput: {
          bg: '',
          borderColor: '',
        },
        btn: {
          donate: {
            iconUrl: '',
          },
          cart: {
            iconUrl: '',
            countVisible: true,
          },
          like: {
            iconUrl: '',
            countBg: '',
            countColor: '',
            effectType: LikeEffectType.System,
          },
          more: {
            iconUrl: '',
          },
        },
      },
      normalBtn: {
        bg: '',
        borderColor: '',
        color: '',
      },
      introArea: {
        bg: '',
      },
      pendant: {
        pushCardForQrCode: '',
        pushCardForNormal: '',
        coupon: '',
        feedback: '',
        lottery: '',
        conditionLottery: '',
        luckyLottery: '',
        invitePoster: '',
        redPacketRain: '',
        redPacketPwd: '',
        redPacket: '',
        taskPrizeEn: '',
        taskPrizeZh: '',
        topicPk: '',
        vote: '',
      },
    },
    mobile: {
      splash: {
        subscribeArea: {
          bg: '',
          style: {},
          countBg: '',
          countColor: '',
        },
      },
      menu: {
        bg: '',
        item: {
          fontColor: '',
        },
        activeItem: {
          bg: '',
          borderColor: '',
          icon: '',
          fontColor: '',
          underline: true,
        },
      },
      chat: {
        bgUrl: '',
      },
    },
    portrait: {
      chat: {
        bgUrl: '',
      },
    },
  };

  return defaultWatchThemeStyleConfig;
}
