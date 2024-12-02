<template>
  <v-card>
    <v-card-title>历史</v-card-title>
    <v-card-text>
      <v-list dense>
        <v-list-item v-for="(record, index) in history" :key="index">
          回合 {{ record.round }}: {{ record.winner }} 赢得 {{ record.amount }} 筹码
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  history: {
    type: Array,
    required: true
  }
});
</script>

