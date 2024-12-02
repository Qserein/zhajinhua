<template>
  <v-container fluid class="game">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 text-center">炸JH</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <p>回合: {{ round }}</p>
            <p>奖池: {{ pot }}</p>
            <p>当前注: {{ currentStake }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6" md="4" v-for="player in players" :key="player.playerId">
        <Player 
          :player="player" 
          :isCurrentPlayer="currentPlayer && currentPlayer.playerId === player.playerId" 
          :isCurrentPlayerTurn="!!currentPlayer" 
          :isNewRound="gameState === 'roundEnd' || gameState === 'waiting'"
          @reveal="revealCards(player.playerId)"
          ref="playerRefs"
        />
        <v-card v-if="gameState === 'inProgress' && currentPlayer && currentPlayer.playerId === player.playerId" class="mt-2">
          <v-card-actions>
            <v-btn @click="openBetDialog" color="primary">下注</v-btn>
            <v-btn @click="openCompareDialog" color="warning">比牌</v-btn>
            <v-btn @click="fold" color="error">弃牌</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="gameState === 'waiting'">
      <v-col cols="12">
        <v-btn @click="openSettings" color="primary">设置</v-btn>
        <v-btn @click="startGame" color="success" class="ml-2">开始</v-btn>
        <v-btn @click="restartGame" color="secondary" class="ml-2">重新开始</v-btn>
      </v-col>
    </v-row>
    <v-row v-if="winner && gameState === 'roundEnd'">
      <v-col cols="12">
        <v-btn @click="startNextRound" color="success">开始下一轮</v-btn>
      </v-col>
    </v-row>
    <v-row v-if="gameState === 'finished'">
      <v-col cols="12">
        <v-btn @click="restartGame" color="primary">重新开始</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <GameHistory :history="gameHistory" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <ActionHistory :actions="actionHistory" />
      </v-col>
    </v-row>
    <!-- 新增背景音乐控制 -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>背景音乐</v-card-title>
          <v-card-text>
            <v-btn-toggle v-model="currentBgMusic" mandatory>
              <v-btn value="bg1">音乐 1</v-btn>
              <v-btn value="bg2">音乐 2</v-btn>
              <v-btn value="bg3">音乐 3</v-btn>
              <v-btn value="bg4">音乐 4</v-btn>
            </v-btn-toggle>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="showBetDialog" max-width="300px">
      <BetDialog :minBet="minBet" :maxBet="1000" @confirm="confirmBet" @cancel="cancelBet" :players="players" :currentPlayer="currentPlayer" />
    </v-dialog>
    <v-dialog v-model="showCompareDialog" max-width="600px">
      <CompareDialog :players="activePlayers.filter(p => p.playerId !== (currentPlayer ? currentPlayer.playerId : ''))" :currentPlayer="currentPlayer" @compare="compareWith" @cancel="cancelCompare" />
    </v-dialog>
    <v-dialog v-model="showSettings" max-width="300px">
      <SettingsDialog :settings="settings" @save="saveSettings" @cancel="closeSettings" />
    </v-dialog>
    <RoundResultDialog 
      :winner="winner || {}" 
      :winningAmount="winningAmount" 
      :show="showRoundResult" 
      @close="closeRoundResult" 
    />
    <GameOverDialog 
      :winner="getWinner" 
      :show="showGameOver" 
      @close="closeGameOver" 
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject, nextTick } from 'vue';
import { useStore } from 'vuex';
import Player from './Player.vue';
import GameHistory from './GameHistory.vue';
import ActionHistory from './ActionHistory.vue';
import BetDialog from './BetDialog.vue';
import CompareDialog from './CompareDialog.vue';
import SettingsDialog from './SettingsDialog.vue';
import RoundResultDialog from './RoundResultDialog.vue';
import GameOverDialog from './GameOverDialog.vue';
import { initSounds, resumeAudioContext } from '../services/audioService';

const store = useStore();
const isMobile = inject('isMobile');

const players = computed(() => store.state.players);
const gameState = computed(() => store.state.gameState);
const currentPlayer = computed(() => store.getters.currentPlayer);
const winner = computed(() => store.getters.winner);
const pot = computed(() => store.state.pot);
const round = computed(() => store.state.round);
const activePlayers = computed(() => store.getters.activePlayers);
const gameHistory = computed(() => store.state.gameHistory);
const actionHistory = computed(() => store.state.actionHistory);

const showBetDialog = ref(false);
const showCompareDialog = ref(false);
const showSettings = ref(false);
const settings = ref({ ...store.state.settings });
const showRoundResult = ref(false);
const showGameOver = ref(false);
const sounds = ref(null);
const currentBgMusic = ref('bg1');

const currentStake = computed(() => store.state.currentStake);

const minBet = computed(() => {
  if (!currentPlayer.value) return 0;
  return currentPlayer.value.isMingPai ? currentStake.value : Math.ceil(currentStake.value / 2);
});

const getWinner = computed(() => {
  return players.value.reduce((winner, player) => {
    if (!winner || player.chips > winner.chips) {
      return player;
    }
    return winner;
  }, null);
});

const winningAmount = computed(() => {
  if (winner.value && winner.value.chipsWon !== undefined) {
    return winner.value.chipsWon;
  }
  return pot.value;
});

const playerRefs = ref([]);

const startGame = async () => {
  if (!sounds.value) {
    initSounds().then(initializedSounds => {
      sounds.value = initializedSounds;
      playBackgroundMusic(currentBgMusic.value);
    });
  } else {
    playBackgroundMusic(currentBgMusic.value);
  }

  resumeAudioContext();
  sounds.value?.playDeal();
  store.dispatch('startGame');
};

const startNextRound = () => {
  resumeAudioContext();
  sounds.value?.playNextRound();
  sounds.value?.playDeal();
  store.dispatch('startNextRound');
};

const openBetDialog = () => {
  showBetDialog.value = true;
};

const confirmBet = (amount) => {
  if (currentPlayer.value) {
    sounds.value?.playBet();
    store.dispatch('playerBet', { playerId: currentPlayer.value.playerId, amount });
  }
  showBetDialog.value = false;
};

const cancelBet = () => {
  showBetDialog.value = false;
};

const fold = () => {
  if (currentPlayer.value) {
    sounds.value?.playFold();
    store.dispatch('playerFold', currentPlayer.value.playerId);
  }
};

const revealCards = (playerId) => {
  sounds.value?.playReveal();
  store.dispatch('playerReveal', playerId);
};

const openCompareDialog = () => {
  showCompareDialog.value = true;
};

const compareWith = (targetPlayerId) => {
  if (currentPlayer.value) {
    const result = store.dispatch('playerCompare', { playerId: currentPlayer.value.playerId, targetPlayerId });
    if (result > 0) {
      sounds.value?.playCompareWin();
    } else {
      sounds.value?.playCompareLose();
    }
  }
  showCompareDialog.value = false;
};

const cancelCompare = () => {
  showCompareDialog.value = false;
};

const openSettings = () => {
  settings.value = { ...store.state.settings };
  showSettings.value = true;
};

const saveSettings = (newSettings) => {
  store.dispatch('updateSettings', newSettings);
  showSettings.value = false;
};

const closeSettings = () => {
  showSettings.value = false;
};

const restartGame = () => {
  store.dispatch('initializeGame');
};

const closeRoundResult = () => {
  showRoundResult.value = false;
};

const closeGameOver = () => {
  showGameOver.value = false;
};

// 新增：播放背景音乐
const playBackgroundMusic = (track) => {
  if (sounds.value) {
    resumeAudioContext();
    sounds.value.playBg1(true);
    sounds.value.playBg2(true);
    sounds.value.playBg3(true);
    sounds.value.playBg4(true);

    switch (track) {
      case 'bg1':
        sounds.value.playBg1();
        break;
      case 'bg2':
        sounds.value.playBg2();
        break;
      case 'bg3':
        sounds.value.playBg3();
        break;
      case 'bg4':
        sounds.value.playBg4();
        break;
    }
  }
};

onMounted(async () => {
  await store.dispatch('initializeGame');
  // 不要在这里自动播放背景音乐，等待用户点击开始游戏
});

watch(currentPlayer, (newPlayer, oldPlayer) => {
  if (newPlayer !== oldPlayer && newPlayer) {
    nextTick(() => {
      const currentPlayerIndex = players.value.findIndex(p => p.playerId === newPlayer.playerId);
      if (currentPlayerIndex !== -1 && playerRefs.value[currentPlayerIndex] && playerRefs.value[currentPlayerIndex].playerCard) {
        playerRefs.value[currentPlayerIndex].playerCard.$el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
});

watch(() => gameState.value, (newState) => {
  if (newState === 'roundEnd') {
    showRoundResult.value = true;
  } else if (newState === 'finished') {
    showGameOver.value = true;
  }
});

// 新增：监听背景音乐变化
watch(currentBgMusic, (newTrack) => {
  playBackgroundMusic(newTrack);
});

</script>

