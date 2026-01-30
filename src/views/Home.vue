<template>
  <v-main class="fill-height" style="background-color: #f2f4f8;">
    <v-container class="d-flex align-center justify-center">
      <v-row justify="center" align="center">
        <v-col cols="12" md="10">
          <v-col>
            <Header />
          </v-col>

          <v-col class="my-4">
            <v-card elevation="0" style="background-color: #f5f5f5;">
              <v-tabs
                v-model="tab"
                bg-color="transparent"
                color="#b22222"
                slider-color="#b22222"
              >
                <v-tab value="overview">Visão Geral</v-tab>
                <v-tab value="analytics">Análises</v-tab>
                <v-tab value="reports">Relatórios</v-tab>
              </v-tabs>
              
              <v-card-text>
                <v-window v-model="tab">
                  <v-window-item value="overview">
                    <GraficSmall />
                  </v-window-item>
                  <v-window-item value="analytics">
                    <GraficByBairro />
                    <br>
                    <GraficBarras />
                  </v-window-item>
                  <v-window-item value="reports">
                    <List />
                  </v-window-item>
                </v-window>
              </v-card-text>
            </v-card>
          </v-col>

        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref } from 'vue';
import GraficSmall from '../components/GraficSmall.vue';
import GraficBarras from '../components/GraficBarras.vue';
import Header from '../components/Header.vue';
import List from '../components/List.vue';
import GraficByBairro from '../components/GraficByBairro.vue';

const tab = ref('overview');
</script>

<style scoped>
.fill-height {
  min-height: 100vh; 
  background-color: #f5f5f5 !important;
}
</style>