import { createStore } from 'vuex';
import { createDeck, dealCards, compareHands } from '../services/gameService';
import { saveGameState, loadGameState } from '../services/storageService';

export default createStore({
  state: {
    players: [],
    deck: [],
    gameState: 'waiting',
    currentPlayerId: null,
    winnerId: null,
    currentBet: 0,
    pot: 0,
    round: 0,
    gameHistory: [],
    actionHistory: [],
    settings: {
      initialChips: 1000,
      playerCount: 3
    },
    currentStake: 0,
    initialFee: 50,
  },
  getters: {
    currentPlayer: (state) => {
      return state.players.find(player => player.playerId === state.currentPlayerId);
    },
    winner: (state) => {
      return state.players.find(player => player.playerId === state.winnerId);
    },
    activePlayers: (state) => {
      return state.players.filter(player => !player.isFold);
    },
    humanPlayer: (state) => {
      return state.players.find(player => !player.isAi);
    }
  },
  mutations: {
    setPlayers(state, players) {
      state.players = players;
    },
    setDeck(state, deck) {
      state.deck = deck;
    },
    setGameState(state, gameState) {
      state.gameState = gameState;
    },
    setCurrentPlayerId(state, playerId) {
      state.currentPlayerId = playerId;
    },
    setWinnerId(state, playerId) {
      state.winnerId = playerId;
    },
    setCurrentBet(state, amount) {
      state.currentBet = amount;
    },
    setPot(state, amount) {
      state.pot = amount;
    },
    setRound(state, round) {
      state.round = round;
    },
    addToGameHistory(state, record) {
      state.gameHistory.push(record);
    },
    setActionHistory(state, actions) {
      state.actionHistory = actions;
    },
    addAction(state, action) {
      state.actionHistory.push(action);
    },
    updateSettings(state, settings) {
      state.settings = { ...state.settings, ...settings };
    },
    setCurrentStake(state, amount) {
      state.currentStake = amount;
    },
    setInitialFee(state, amount) {
      state.initialFee = amount;
    },
  },
  actions: {
    async initializeGame({ commit, dispatch }) {
      const savedState = await loadGameState();
      if (savedState) {
        Object.keys(savedState).forEach(key => {
          if (typeof commit[`set${key.charAt(0).toUpperCase() + key.slice(1)}`] === 'function') {
            commit(`set${key.charAt(0).toUpperCase() + key.slice(1)}`, savedState[key]);
          }
        });
      } else {
        commit('setGameState', 'waiting');
        commit('setPlayers', []);
        commit('setDeck', []);
        commit('setCurrentPlayerId', null);
        commit('setWinnerId', null);
        commit('setCurrentBet', 0);
        commit('setPot', 0);
        commit('setRound', 0);
        commit('setActionHistory', []);
      }
    },
    async startGame({ commit, state, dispatch }) {
      const deck = createDeck();
      const hands = dealCards(deck, state.settings.playerCount);
      commit('setCurrentStake', state.initialFee);
      const updatedPlayers = Array(state.settings.playerCount).fill().map((_, index) => ({
        playerId: `player${index + 1}`,
        nickname: `玩家${index + 1}`,
        isAi: false, 
        handCards: hands[index],
        isFold: false,
        isMingPai: false,
        currentBet: state.initialFee,
        chips: state.settings.initialChips - state.initialFee,
      }));
      commit('setPlayers', updatedPlayers);
      commit('setDeck', deck);
      commit('setGameState', 'inProgress');
      commit('setCurrentPlayerId', updatedPlayers[0].playerId);
      commit('setWinnerId', null);
      commit('setCurrentBet', state.initialFee);
      commit('setPot', state.settings.playerCount * state.initialFee);
      commit('setRound', 1);
      commit('setActionHistory', []);
      await saveGameState(state);
      dispatch('startPlayerTurn');
    },
    startPlayerTurn({ state, dispatch }) {
      // AI logic can be implemented here if needed
    },
    playerBet({ commit, state, dispatch }, { playerId, amount }) {
      const playerIndex = state.players.findIndex(p => p.playerId === playerId);
      if (playerIndex !== -1) {
        const player = state.players[playerIndex];
        const updatedPlayers = [...state.players];
        updatedPlayers[playerIndex] = {
          ...player,
          chips: player.chips - amount,
          currentBet: player.currentBet + amount
        };
        commit('setPlayers', updatedPlayers);
        commit('setPot', state.pot + amount);
        commit('addAction', { type: 'bet', playerId, amount });
        
        if (!player.isMingPai) {
          commit('setCurrentStake', amount * 2);
        } else {
          commit('setCurrentStake', amount);
        }
        
        dispatch('nextTurn');
      }
    },
    playerFold({ commit, state, dispatch }, playerId) {
      const playerIndex = state.players.findIndex(p => p.playerId === playerId);
      if (playerIndex !== -1) {
        const updatedPlayers = [...state.players];
        updatedPlayers[playerIndex] = {
          ...updatedPlayers[playerIndex],
          isFold: true
        };
        commit('setPlayers', updatedPlayers);
        commit('addAction', { type: 'fold', playerId });
        dispatch('nextTurn');
      }
    },
    playerReveal({ commit, state }, playerId) {
      const playerIndex = state.players.findIndex(p => p.playerId === playerId);
      if (playerIndex !== -1) {
        const updatedPlayers = [...state.players];
        updatedPlayers[playerIndex] = {
          ...updatedPlayers[playerIndex],
          isMingPai: true
        };
        commit('setPlayers', updatedPlayers);
        commit('addAction', { type: 'reveal', playerId });
      }
    },
    playerCompare({ commit, state, dispatch }, { playerId, targetPlayerId }) {
      const player = state.players.find(p => p.playerId === playerId);
      const targetPlayer = state.players.find(p => p.playerId === targetPlayerId);
      if (player && targetPlayer) {
        const updatedPlayers = state.players.map(p => {
          if (p.playerId === playerId) {
            return {
              ...p,
              chips: p.chips - state.currentStake,
              currentBet: p.currentBet + state.currentStake
            };
          }
          return p;
        });
        commit('setPlayers', updatedPlayers);
        commit('setPot', state.pot + state.currentStake);

        const result = compareHands(player.handCards, targetPlayer.handCards);
        const loserIndex = state.players.findIndex(p => p.playerId === (result > 0 ? targetPlayerId : playerId));
        if (loserIndex !== -1) {
          const newUpdatedPlayers = [...updatedPlayers];
          newUpdatedPlayers[loserIndex] = {
            ...newUpdatedPlayers[loserIndex],
            isFold: true
          };
          commit('setPlayers', newUpdatedPlayers);
          commit('addAction', { 
            type: 'compare', 
            playerId, 
            targetPlayerId, 
            result: result > 0 ? 'win' : 'lose',
            amount: state.currentStake
          });
          dispatch('nextTurn');
        }
      }
    },
    nextTurn({ commit, state, dispatch }) {
      const activePlayers = state.players.filter(p => !p.isFold);
      if (activePlayers.length === 1) {
        dispatch('endRound', activePlayers[0].playerId);
      } else {
        const currentPlayerIndex = state.players.findIndex(p => p.playerId === state.currentPlayerId);
        let nextPlayerIndex = (currentPlayerIndex + 1) % state.players.length;
        while (state.players[nextPlayerIndex].isFold) {
          nextPlayerIndex = (nextPlayerIndex + 1) % state.players.length;
        }
        commit('setCurrentPlayerId', state.players[nextPlayerIndex].playerId);
      }
    },
    endRound({ commit, state }, winnerId) {
      const winner = state.players.find(p => p.playerId === winnerId);
      if (winner) {
        commit('setWinnerId', winnerId);
        const updatedPlayers = state.players.map(player =>
          player.playerId === winnerId
            ? { ...player, chips: player.chips + state.pot }
            : player
        );
        commit('setPlayers', updatedPlayers);
        commit('addToGameHistory', {
          round: state.round,
          winner: winner.nickname,
          amount: state.pot
        });
        commit('setGameState', 'roundEnd');
        commit('setPot', 0);
        commit('setCurrentStake', state.initialFee);
      }
    },
    updateSettings({ commit }, settings) {
      commit('updateSettings', settings);
    },
    startNextRound({ commit, state, dispatch }) {
      const previousChips = {};
      state.players.forEach(player => {
        previousChips[player.playerId] = player.chips;
      });

      const newDeck = createDeck();
      commit('setDeck', newDeck);
      const validPlayers = state.players.filter(player => player.chips - state.initialFee >= 0);
      if (validPlayers.length < 2) {
        commit('setGameState', 'finished');
        return;
      }
      let updatedPlayers = validPlayers.map(player => ({
        ...player,
        isFold: false,
        isMingPai: false,  // 重置为闷牌状态
        currentBet: state.initialFee,
        chips: player.chips - state.initialFee,
        handCards: dealCards(newDeck, 1)[0],
      }));

      updatedPlayers = updatedPlayers.map(player => ({
        ...player,
        chipsWon: player.chips - previousChips[player.playerId]
      }));

      commit('setPlayers', updatedPlayers);
      commit('setPot', updatedPlayers.length * state.initialFee);
      commit('setCurrentPlayerId', updatedPlayers[0].playerId);
      commit('setRound', state.round + 1);
      commit('setGameState', 'inProgress');
      commit('setWinnerId', null);
      commit('setCurrentStake', state.initialFee);

      const roundWinner = updatedPlayers.reduce((a, b) => a.chipsWon > b.chipsWon ? a : b);
      commit('addToGameHistory', {
        round: state.round,
        winner: roundWinner.nickname,
        amount: roundWinner.chipsWon
      });

      dispatch('startPlayerTurn');
    },
  }
});

