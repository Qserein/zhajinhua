<template>
  <v-card class="compare-dialog">
    <v-card-title class="headline">选择要比牌的玩家</v-card-title>
    <v-card-text>
      <v-container>
        <v-row v-if="!selectedPlayer">
          <v-col cols="12" sm="6" md="4" v-for="player in players" :key="player.playerId">
            <v-btn 
              block 
              color="primary" 
              @click="selectPlayer(player)"
              :disabled="player.playerId === currentPlayer.playerId"
            >
              {{ player.nickname }}
              {{ !player.isMingPai ? '（闷牌）' : '（看牌）' }}
            </v-btn>
          </v-col>
        </v-row>
        <v-row v-else>
          <v-col cols="12">
            <h3 class="text-h5 mb-4">比牌结果：</h3>
            <v-row>
              <v-col cols="12">
                <h4 class="text-h6">{{ currentPlayer.nickname }}</h4>
                <div class="d-flex justify-center">
                  <Card v-for="card in currentPlayer.handCards" :key="card.id" :card="card" :faceDown="false" />
                </div>
              </v-col>
              <v-col cols="12">
                <h4 class="text-h6">{{ selectedPlayer.nickname }}</h4>
                <div class="d-flex justify-center">
                  <Card v-for="card in selectedPlayer.handCards" :key="card.id" :card="card" :faceDown="false" />
                </div>
              </v-col>
            </v-row>
            <v-alert
              :color="comparisonResult.includes('赢') ? 'success' : 'error'"
              class="mt-4"
              dense
              outlined
            >
              {{ comparisonResult }}
            </v-alert>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="success" text @click="cancel">关闭</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { compareHands } from '../services/gameService';
import Card from './Card.vue';

const store = useStore();

const props = defineProps({
  players: {
    type: Array,
    required: true
  },
  currentPlayer: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['compare', 'cancel']);

const selectedPlayer = ref(null);
const currentStake = computed(() => store.state.currentStake);

const selectPlayer = (player) => {
  selectedPlayer.value = player;
};

const comparisonResult = computed(() => {
  if (!selectedPlayer.value) return '';
  const result = compareHands(props.currentPlayer.handCards, selectedPlayer.value.handCards);
  return result > 0 
    ? `${props.currentPlayer.nickname} 赢得了比牌！` 
    : `${selectedPlayer.value.nickname} 赢得了比牌！`;
});

const confirmCompare = () => {
  emit('compare', selectedPlayer.value.playerId);
};

const cancel = () => {
  if (selectedPlayer.value) {
    emit('compare', selectedPlayer.value.playerId);
  } else {
    emit('cancel');
  }
};
</script>

<style scoped>
.compare-dialog {
  max-width: 600px;
  margin: auto;
}
</style>

