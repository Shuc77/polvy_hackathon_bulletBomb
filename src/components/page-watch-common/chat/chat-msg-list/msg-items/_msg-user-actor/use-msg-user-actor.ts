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
    [ChatUserType.Manager]: 'linear-gradient(270deg, #818CF0 0%, #716AF7 100%)',
    [ChatUserType.Assistant]: 'linear-gradient(278deg, #14D0B2 1%, #04B888 96%)',
    [ChatUserType.Teacher]: 'linear-gradient(270deg, #57B7FF 0%, #2987FF 100%)',
    [ChatUserType.Guest]: 'linear-gradient(90deg, #FF8165 -1%, #FEB235 100%)',
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
