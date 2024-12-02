<template>
  <div v-if="player" class="ai-player" :class="{ 'current-player': isCurrentPlayer }">
    <h2>{{ player.nickname }} (AI)</h2>
    <p>筹码: {{ player.chips }}</p>
    <div class="hand">
      <Card v-for="card in player.handCards" :key="card.id" :card="card" :faceDown="!player.isMingPai" />
    </div>
    <br>
    <p>当前下注: {{ player.currentBet }}</p>
    <p v-if="player.isFold">已弃牌</p>
    <p v-if="player.isBluffing">正在诈唬</p>
    <p v-if="!player.isMingPai">闷牌中</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import Card from './Card.vue';

const props = defineProps({
  player: {
    type: Object,
    required: true
  }
});

const store = useStore();
const isCurrentPlayer = computed(() => {
  const currentPlayerId = store.state.currentPlayerId;
  return props.player && currentPlayerId && props.player.playerId === currentPlayerId;
});
</script>

<style scoped>
.ai-player {
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
}

.current-player {
  border-color: #4CAF50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.hand {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
</style>

