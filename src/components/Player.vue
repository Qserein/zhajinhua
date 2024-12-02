<template>
  <v-card :class="{ 'current-player': isCurrentPlayer, 'folded-player': player.isFold && !isNewRound }" ref="playerCard">
    <v-card-title>
      {{ player.nickname }}
      <v-chip v-if="player.isMingPai" color="primary" small class="ml-2">看牌</v-chip>
      <v-chip v-else color="primary" small class="ml-2">闷牌</v-chip>
    </v-card-title>
    <v-card-text>
      <p>
        筹码: {{ player.chips }}
        <span class="ml-2">本轮下注: {{ player.currentBet }}</span>
      </p>
      <div class="hand">
        <Card 
          v-for="(card, index) in player.handCards" 
          :key="card.id" 
          :card="card" 
          :faceDown="shouldHideCard(index)"
          @click="revealCard(index)"
        />
      </div>
      <br>
      <v-chip v-if="player.isFold && !isNewRound" color="error" small>已弃牌</v-chip>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { defineProps, ref, computed, watch } from 'vue';
import Card from './Card.vue';

const props = defineProps({
  player: {
    type: Object,
    required: true
  },
  isCurrentPlayer: {
    type: Boolean,
    default: false
  },
  isCurrentPlayerTurn: {
    type: Boolean,
    required: true
  },
  isNewRound: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['reveal']);

const revealedCards = ref([false, false, false]);

const hasRevealedAnyCard = computed(() => revealedCards.value.some(revealed => revealed));

const shouldHideCard = (index) => {
  if (!props.isCurrentPlayer) {
    return true;
  }
  return !revealedCards.value[index];
};

const revealCard = (index) => {
  if (props.isCurrentPlayer && !props.player.isFold) {
    revealedCards.value[index] = !revealedCards.value[index];
    if (hasRevealedAnyCard.value && !props.player.isMingPai) {
      emit('reveal');
    }
  }
};

watch(() => props.isNewRound, (newValue) => {
  if (newValue) {
    revealedCards.value = [false, false, false];
  }
});

const playerCard = ref(null);

defineExpose({ playerCard });
</script>

<style scoped>
.current-player {
  border: 2px solid #4CAF50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.folded-player {
  opacity: 0.5;
}

.hand {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
</style>

