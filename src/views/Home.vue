<template>
  <v-main class="fill-height" style="background-color: #f2f4f8;">
    <v-container class=" d-flex align-center justify-center">
    <v-row justify="center" align="center" >
      <v-col cols="12" md="9">
        <List />
      </v-col>
    </v-row>
  </v-container>
  </v-main>
</template>

<script setup>
import List from '../components/List.vue'
</script>

<style scoped>
.fill-height {
  min-height: 100vh; 
}
</style>
