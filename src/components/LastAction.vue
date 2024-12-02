<template>
  <div v-if="action" class="last-action">
    <h3>最后一个动作</h3>
    <p>{{ actionText }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  action: {
    type: Object,
    required: true
  }
});

const actionText = computed(() => {
  if (!props.action) return '';

  switch (props.action.type) {
    case 'bet':
      return `${props.action.playerId} 下注了 ${props.action.amount} 筹码`;
    case 'fold':
      return `${props.action.playerId} 弃牌了`;
    case 'reveal':
      return `${props.action.playerId} 看牌了`;
    case 'compare':
      return `${props.action.playerId} 与 ${props.action.targetPlayerId} 比牌，${props.action.result === 'win' ? '赢了' : '输了'}`;
    default:
      return '';
  }
});
</script>

<style scoped>
.last-action {
  margin-top: 20px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
}
</style>

