<template>
  <v-app>
    <v-main>
      <Game />
    </v-main>
  </v-app>
</template>

<script setup>
import { provide } from 'vue';
import { useDisplay } from 'vuetify';
import Game from './components/Game.vue';

const { mobile } = useDisplay();
provide('isMobile', mobile);
</script>

<style>
@import '@mdi/font/css/materialdesignicons.css';
@import './assets/main.css';
</style>

