<template>
  <v-container fluid class="pa-4">
    <v-card class="chart-card elevation-2">
      <v-card-title class="chart-title">
        <span>Top Bairros com Mais Cancelamentos</span>
        <v-chip color="primary" size="small" class="ml-2">
          Motivo: {{ motivoCancelamento }}
        </v-chip>
      </v-card-title>
      <v-card-text>
        <div class="chart-wrapper">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const dadosCancelamentos = ref([]);
const motivoCancelamento = ref(22);

const chartData = computed(() => ({
  labels: dadosCancelamentos.value.map(item => item.bairro),
  datasets: [
    {
      label: 'Quantidade de Cancelamentos',
      data: dadosCancelamentos.value.map(item => item.qtd_cancelamentos),
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 2,
      borderRadius: 6,
    }
  ]
}));

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 13
      },
      callbacks: {
        label: function(context) {
          return `Cancelamentos: ${context.parsed.x}`;
        }
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        font: {
          size: 12
        }
      }
    },
    y: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 12
        }
      }
    }
  }
});

const fetchDados = async () => {
  try {
    dadosCancelamentos.value = [
      {
        "bairro": "Vila Nova Bonsucesso",
        "motivo_cancelamento": 22,
        "qtd_cancelamentos": 487
      },
      {
        "bairro": "Jardim Presidente Dutra",
        "motivo_cancelamento": 22,
        "qtd_cancelamentos": 413
      },
      {
        "bairro": "PARQUE PAULISTANO",
        "motivo_cancelamento": 22,
        "qtd_cancelamentos": 399
      },
      {
        "bairro": "Cidade Soberana",
        "motivo_cancelamento": 22,
        "qtd_cancelamentos": 297
      },
      {
        "bairro": "Jardim Ponte Alta I",
        "motivo_cancelamento": 22,
        "qtd_cancelamentos": 294
      },
      {
        "bairro": "Vila Seabra",
        "motivo_cancelamento": 22,
        "qtd_cancelamentos": 284
      }
    ];
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
};

onBeforeMount(() => {
  fetchDados();
});
</script>

<style scoped>
.chart-card {
  border-radius: 8px;
  overflow: hidden;
  max-width: 1200px;
  margin: 0 auto;
}

.chart-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 16px 20px;
  display: flex;
  align-items: center;
}

.chart-wrapper {
  height: 400px;
  padding: 20px 10px;
}

@media (max-width: 768px) {
  .chart-wrapper {
    height: 350px;
  }
}
</style>