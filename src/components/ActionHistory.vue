<template>
  <v-card>
    <v-card-title>动作历史</v-card-title>
    <v-card-text>
      <v-list dense>
        <v-list-item v-for="(action, index) in actions" :key="index">
          {{ formatAction(action) }}
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  actions: {
    type: Array,
    required: true
  }
});

const formatAction = (action) => {
  switch (action.type) {
    case 'bet':
      return `${action.playerId} 下注了 ${action.amount} 筹码`;
    case 'fold':
      return `${action.playerId} 弃牌了`;
    case 'reveal':
      return `${action.playerId} 看牌了`;
    case 'compare':
      return `${action.playerId} 与 ${action.targetPlayerId} 比牌，${action.result === 'win' ? '赢了' : '输了'}`;
    default:
      return '';
  }
};
</script>

