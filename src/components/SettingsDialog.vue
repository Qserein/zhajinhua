<template>
  <v-card>
    <v-card-title>设置</v-card-title>
    <v-card-text>
      <v-text-field
        v-model.number="localSettings.initialChips"
        label="初始筹码"
        type="number"
        min="100"
        step="100"
      ></v-text-field>
      <v-text-field
        v-model.number="localSettings.playerCount"
        label="玩家数量"
        type="number"
        min="2"
        max="6"
        step="1"
      ></v-text-field>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="save">保存设置</v-btn>
      <v-btn color="error" @click="cancel">取消</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  settings: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['save', 'cancel']);

const localSettings = ref({ ...props.settings });

const save = () => {
  emit('save', localSettings.value);
};

const cancel = () => {
  emit('cancel');
};
</script>

