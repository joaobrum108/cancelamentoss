<template>
  <v-container>

    <apexchart 
      type="donut" 
      height="350" 
      :options="chartOptions" 
      :series="series"
    />
  </v-container>
</template>

<script setup>
import VueApexCharts from "vue3-apexcharts";
const apexchart = VueApexCharts;

const mockData = [
  { motivo_cancelamento: "Mudança de residência" },
  { motivo_cancelamento: "Qualidade do serviço" },
  { motivo_cancelamento: "Concorrência" },
  { motivo_cancelamento: "Inadimplência" },
  { motivo_cancelamento: "Concorrência" },
  { motivo_cancelamento: "Qualidade do serviço" }
];

function agruparPorMotivo(dados) {
  const counts = {};
  dados.forEach(item => {
    counts[item.motivo_cancelamento] = (counts[item.motivo_cancelamento] || 0) + 1;
  });
  return counts;
}

const agrupado = agruparPorMotivo(mockData);

const series = Object.values(agrupado);

const chartOptions = {
  labels: Object.keys(agrupado),
  colors: ["#DB0E35", "#FF6F61", "#FFB347", "#FFC300"], 
  title: {
    text: "Motivos de Cancelamento",
    align: "center"
  },
  legend: {
    position: "bottom"
  }
};
</script>

<style scoped>
</style>
