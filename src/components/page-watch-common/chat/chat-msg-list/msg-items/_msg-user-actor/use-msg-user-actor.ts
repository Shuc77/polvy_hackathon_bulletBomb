import { ChatUserType } from '@polyv/live-watch-sdk';
import { computed, unref } from 'vue';
import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';

export const msgUserActorProps = () => ({
  actor: PropUtils.string.def(''),
  userType: PropUtils.enum<ChatUserType>().def(ChatUserType.Viewer),
});

export const useMsgUserActor = (options: { props: VueProps<typeof msgUserActorProps> }) => {
  const { props } = options;

  /** 头衔的颜色关系 */
  const actorColors = {
    [ChatUserType.Manager]: '#33BBC5',
    [ChatUserType.Assistant]: '#598FE5',
    [ChatUserType.Teacher]: '#F09343',
    [ChatUserType.Guest]: '#EB6165',
    [ChatUserType.Dummy]: '#F09343',
  };

  const msgUserType = computed(() => props.userType);

  const msgUserActor = computed(() => props.actor);

  /** 头衔标签的颜色 */
  const actorLabelColor = computed<string | undefined>(() => {
    const userType = unref(msgUserType);
    if (!userType) {
      return undefined;
    }

    return actorColors[userType as keyof typeof actorColors];
  });

  return {
    msgUserActor,
    msgUserType,
    actorLabelColor,
  };
};
