<!-- @file 移动端话题 PK -->
<template>
  <iar-mobile-topic-pk
    class="c-mobile-topic-pk"
    :topic-sdk="topicPkSdk"
    @visible-changed="onTopicPKVisibleChanged"
  />
</template>

<script setup lang="ts">
import { getIarComponent } from '../load-iar-ui';
import { useTopicPk } from './hook/use-topic-pk';

const IarMobileTopicPk = getIarComponent('MobileTopic');

const { topicPkSdk, onTopicPKVisibleChanged } = useTopicPk();
</script>
