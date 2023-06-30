import { ref, reactive, unref } from 'vue';
import {
  ChatUserType,
  ChatMessageUser,
  ChatEventsRelations,
  ChatEvents,
  UserEventsRelations,
  UserEvents,
} from '@polyv/live-watch-sdk';
import { useViewerStore } from '@/store/use-viewer-store';
import { getWatchCore } from '@/core/watch-sdk';

/** 新增的成员组类型 */
export enum MemberAdditionalGroupTypes {
  SELF = 'self',
  OTHER = 'other',
}
/** 成员组类型 */
type MemberGroupType = ChatUserType | MemberAdditionalGroupTypes;

/** 成员信息 */
export interface MemberInfo extends ChatMessageUser {
  groupType: MemberGroupType;
}

/** 成员组 */
type MemberGroup = { [groupType in MemberGroupType]: MemberInfo[] };

export const useMemberListHook = () => {
  const watchCore = getWatchCore();

  const viewerStore = useViewerStore();

  /** 页码 */
  const pageNumber = ref(1);

  /** 是否没有更多数据 */
  const isNoMore = ref(false);

  /** 成员组类型(按先后顺序) */
  const memberGroupTypes = ref<MemberGroupType[]>([
    MemberAdditionalGroupTypes.SELF,
    ChatUserType.Host,
    ChatUserType.Manager,
    ChatUserType.Teacher,
    ChatUserType.Guest,
    ChatUserType.Assistant,
    ChatUserType.Attendee,
    ChatUserType.Student,
    ChatUserType.Slice,
    MemberAdditionalGroupTypes.OTHER,
  ]);

  /** 成员组数据 */
  const memberGroupMap = reactive(
    unref(memberGroupTypes).reduce((accu, cur) => {
      accu[cur] = [];
      return accu;
    }, {} as MemberGroup),
  );

  /** 按id记录观众信息，方便移除分类列表中的用户(因为收到的LOGOUT消息只有userId和uid，此处记录整个user信息) */
  const memberIdMap = reactive<{ [userId: string]: MemberInfo }>({});

  /** 新登录的成员队列 */
  let loginMemberQueue: MemberInfo[] = [];
  /** 登出的成员队列 */
  let logoutMemberQueue: MemberInfo[] = [];
  /** 队列处理定时器 */
  const memberQueueTimer = ref<NodeJS.Timer | undefined>(undefined);

  /** 获取下一页用户列表 */
  async function getNextUserList() {
    try {
      /** 首次加载200条 */
      const FIRST_PAGE_SIZE = 200;
      const PAGE_SIZE = 100;
      const isFirstFetch = pageNumber.value === 1;
      const pageSize = isFirstFetch ? FIRST_PAGE_SIZE : PAGE_SIZE;

      const data = await watchCore.chat.getOnlineUserList({
        pageNumber: unref(pageNumber),
        pageSize,
      });
      const userList = data.userlist || [];

      addMembers(userList);
      pageNumber.value += isFirstFetch ? 2 : 1;
      isNoMore.value = userList.length < PAGE_SIZE;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /** 将用户转换为成员 */
  function convertUser2Member(user: ChatMessageUser): MemberInfo {
    const isExistType = unref(memberGroupTypes).includes(user.userType);
    const isSelf = user.userId === viewerStore.viewerId;

    let groupType: MemberGroupType = MemberAdditionalGroupTypes.OTHER;
    if (isExistType) {
      groupType = user.userType;
    }
    if (isSelf) {
      groupType = MemberAdditionalGroupTypes.SELF;
    }

    return {
      ...user,
      groupType,
    };
  }

  /** 将一组成员插入到在线列表进行显示 */
  function addMembers(userList: ChatMessageUser[]) {
    userList.forEach(user => {
      const member = convertUser2Member(user);

      if (!memberIdMap[member.userId]) {
        memberGroupMap[member.groupType].push(member);
        memberIdMap[member.userId] = member;
      }
    });
  }

  /** 移除一组成员 */
  function removeMembers(memberList: MemberInfo[]) {
    memberList
      .filter(member => memberIdMap[member.userId])
      .forEach(member => {
        const targetMemberGroup = memberGroupMap[member.groupType];

        const targetUserId = member.userId;
        const idx = targetMemberGroup.findIndex(item => item.userId === targetUserId);

        delete memberIdMap[targetUserId];
        if (idx > -1) {
          // 已进入到显示列表
          targetMemberGroup.splice(idx, 1);
        } else {
          // 还在待显示队列
          const queueIndex = loginMemberQueue.findIndex(item => item.userId === targetUserId);
          queueIndex > -1 && loginMemberQueue.splice(queueIndex, 1);
        }
      });
  }

  /**
   * 成员队列处理函数
   * 通过定时器 memberQueueTimer 来处理登录和登出用户队列
   * */
  function memberQueueHandler() {
    const POP_COUNT = 20;

    let popMembers: MemberInfo[] = [];

    // 将队列中一部分新登录用户加入到显示的在线列表(最多同时加入20个)
    if (loginMemberQueue.length) {
      if (loginMemberQueue.length > POP_COUNT) {
        popMembers = loginMemberQueue.splice(0, POP_COUNT);
      } else {
        popMembers = loginMemberQueue.splice(0, loginMemberQueue.length);
      }
      addMembers(popMembers);
    }

    // 将已离开的用户队列数据，移除展示
    if (logoutMemberQueue.length) {
      const leftUsers = logoutMemberQueue.splice(0, logoutMemberQueue.length);
      removeMembers(leftUsers);
    }

    // 队列无数据，清除定时器
    if (!loginMemberQueue.length && !logoutMemberQueue.length) {
      clearMemberQueueTimer();
    }
  }

  function clearMemberQueueTimer() {
    clearInterval(memberQueueTimer.value);
    memberQueueTimer.value = undefined;
  }

  function initMemberQueueTimer() {
    memberQueueTimer.value = setInterval(memberQueueHandler, 200);
  }

  /** 处理用户登录 */
  function onUserLogin(event: ChatEventsRelations[ChatEvents.ChatUserLogin]) {
    const user = event.user;
    if (!user) return;

    const member = convertUser2Member(user);
    loginMemberQueue.push(member);

    // 新登入观众，存在于待移除的logout观众队列中，移除该队列对应数据。
    if (logoutMemberQueue.length) {
      const index = logoutMemberQueue.findIndex(item => item.userId === member.userId);
      logoutMemberQueue.splice(index, 1);
    }
    if (!memberQueueTimer.value) {
      initMemberQueueTimer();
    }
  }

  /** 处理用户登出 */
  function onUserLogout(event: ChatEventsRelations[ChatEvents.ChatUserLogout]) {
    const userId = event.userId;
    const member = memberIdMap[userId];
    if (!member) return;

    logoutMemberQueue.push(member);

    // 如果登出的观众存在于待显示的观众队列中，则先移除该队列对应数据。
    if (loginMemberQueue.length) {
      const index = loginMemberQueue.findIndex(item => item.userId === member.userId);
      loginMemberQueue.splice(index, 1);
    }
    if (!memberQueueTimer.value) {
      initMemberQueueTimer();
    }
  }

  /** 处理用户修改名称 */
  function onSetNick({ userId, nickname }: UserEventsRelations[UserEvents.UserSetNick]) {
    let targetMember = memberIdMap[userId];

    if (targetMember) {
      targetMember.nick = nickname;
    } else {
      // 还在待显示队列中
      const targetQueueUserIndex = loginMemberQueue.findIndex(item => item.userId === userId);
      if (targetQueueUserIndex > -1) {
        targetMember = {
          ...loginMemberQueue[targetQueueUserIndex],
          nick: nickname,
        };
      }
    }
  }

  /** 重置成员队列 */
  function resetMemberQueue() {
    loginMemberQueue = [];
    logoutMemberQueue = [];
    clearMemberQueueTimer();
  }

  return {
    isNoMore,
    memberGroupTypes,
    memberGroupMap,

    onUserLogin,
    onUserLogout,
    onSetNick,
    initMemberQueueTimer,
    getNextUserList,
    resetMemberQueue,
  };
};
