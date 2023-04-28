<!-- @file PC 端话题 PK -->
<template>
  <iar-pc-topic-pk
    class="c-pc-topic-pk"
    :topic-sdk="topicPkSdk"
  />
</template>

<script setup lang="ts">
import { getIarComponent } from '../load-iar-ui';
import { useTopicPk } from './hook/use-topic-pk';

const IarPcTopicPk = getIarComponent('PcTopic');

const { topicPkSdk } = useTopicPk();
</script>
