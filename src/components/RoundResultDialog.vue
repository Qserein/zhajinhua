<template>
  <v-dialog v-model="dialog" max-width="400px">
    <v-card>
      <v-card-title class="headline">回合结果</v-card-title>
      <v-card-text>
        <p>{{ winner.nickname }} 赢得了这一轮！</p>
        <p>赢得筹码: {{ winningAmount }}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="close">关闭</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  winner: {
    type: Object,
    required: true
  },
  winningAmount: {
    type: Number,
    required: true
  },
  show: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close']);

const dialog = ref(false);

watch(() => props.show, (newValue) => {
  dialog.value = newValue;
});

const close = () => {
  emit('close');
};
</script>

