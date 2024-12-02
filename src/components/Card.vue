<template>
  <v-card class="card" :class="{ 'face-down': faceDown }">
    <v-card-text v-if="!faceDown" :class="{ 'red--text': isRed }">
      <div class="value">{{ card.value }}</div>
      <div class="suit">{{ card.suit }}</div>
    </v-card-text>
    <v-card-text v-else class="card-back"></v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  faceDown: {
    type: Boolean,
    default: false
  }
});

const isRed = computed(() => ['♥', '♦'].includes(props.card.suit));
</script>

<style scoped>
.card {
  width: 60px;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-weight: bold;
  margin: 0 5px;
}

.value {
  font-size: 18px;
  text-wrap-mode: nowrap;
}

.suit {
  font-size: 24px;
}

.face-down {
  background-color: #1E88E5;
  background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px);
}

.card-back {
  width: 100%;
  height: 100%;
}
.red--text {
    color: red;
}
</style>

