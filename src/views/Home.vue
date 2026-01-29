<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-row justify="center" align="center">
      <v-col cols="12" md="9">
          <List />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import List from '../components/List.vue'
</script>

<style scoped>
.fill-height {
  min-height: 100vh; 
}
</style>
