<template>
  <v-card>
    <v-card-title>下注</v-card-title>
    <v-card-text>
      <v-slider
        v-model="betAmount"
        :min="minBet"
        :max="maxBet"
        :step="25"
        thumb-label="always"
      ></v-slider>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="confirmBet">确认</v-btn>
      <v-btn color="error" @click="cancel">取消</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  minBet: {
    type: Number,
    required: true
  },
  maxBet: {
    type: Number,
    required: true
  },
  currentPlayer: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const betAmount = ref(props.minBet);

watch(() => props.minBet, (newMinBet) => {
  betAmount.value = Math.max(newMinBet, betAmount.value);
});

const confirmBet = () => {
  emit('confirm', betAmount.value);
};

const cancel = () => {
  emit('cancel');
};
</script>

