<template>
  <v-dialog v-model="dialog" max-width="400px">
    <v-card>
      <v-card-title class="headline">游戏结束</v-card-title>
      <v-card-text>
        <p v-if="winner">获胜者: {{ winner.nickname }}</p>
        <p v-else>没有足够的玩家继续游戏</p>
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
    default: null
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

