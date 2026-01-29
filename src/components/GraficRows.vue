<template>
  <v-container fluid class="pa-4">
    <v-card class="chart-card elevation-2">
      <v-card-title class="chart-title">
        <v-icon icon="mdi-chart-line" class="mr-2"></v-icon>
        <span>Evolução de Cancelamentos por Ano</span>
      </v-card-title>
      <v-card-text>
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-label">Total de Cancelamentos</div>
            <div class="stat-value">{{ totalCancelamentos.toLocaleString('pt-BR') }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Média Anual</div>
            <div class="stat-value">{{ mediaCancelamentos.toLocaleString('pt-BR') }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Tendência</div>
            <div class="stat-value" :class="tendenciaClass">
              <v-icon :icon="tendenciaIcon" size="small" class="mr-1"></v-icon>
              {{ tendenciaTexto }}
            </div>
          </div>
        </div>
        <v-divider class="my-4"></v-divider>
        <div class="chart-wrapper">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const dadosCancelamentos = ref([]);

const totalCancelamentos = computed(() => {
  return dadosCancelamentos.value.reduce((sum, item) => sum + item.qtd_cancelamentos, 0);
});

const mediaCancelamentos = computed(() => {
  if (dadosCancelamentos.value.length === 0) return 0;
  return Math.round(totalCancelamentos.value / dadosCancelamentos.value.length);
});

const tendenciaTexto = computed(() => {
  if (dadosCancelamentos.value.length < 2) return 'N/A';
  const primeiro = dadosCancelamentos.value[dadosCancelamentos.value.length - 1].qtd_cancelamentos;
  const ultimo = dadosCancelamentos.value[0].qtd_cancelamentos;
  
  if (ultimo > primeiro) return 'Crescente';
  if (ultimo < primeiro) return 'Decrescente';
  return 'Estável';
});

const tendenciaClass = computed(() => {
  if (tendenciaTexto.value === 'Crescente') return 'tendencia-alta';
  if (tendenciaTexto.value === 'Decrescente') return 'tendencia-baixa';
  return 'tendencia-estavel';
});

const tendenciaIcon = computed(() => {
  if (tendenciaTexto.value === 'Crescente') return 'mdi-trending-up';
  if (tendenciaTexto.value === 'Decrescente') return 'mdi-trending-down';
  return 'mdi-minus';
});

const chartData = computed(() => ({
  labels: dadosCancelamentos.value.map(item => item.ano).reverse(),
  datasets: [
    {
      label: 'Quantidade de Cancelamentos',
      data: dadosCancelamentos.value.map(item => item.qtd_cancelamentos).reverse(),
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: 'rgb(255, 99, 132)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      yAxisID: 'y',
    },
    {
      label: 'Porcentagem (%)',
      data: dadosCancelamentos.value.map(item => parseFloat(item.porcentagem_cancelamentos)).reverse(),
      borderColor: 'rgb(54, 162, 235)',
      backgroundColor: 'rgba(54, 162, 235, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: 'rgb(54, 162, 235)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      yAxisID: 'y1',
    }
  ]
}));

// Opções do gráfico
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 13,
          weight: '600'
        }
      }
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
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            if (context.datasetIndex === 0) {
              label += context.parsed.y.toLocaleString('pt-BR');
            } else {
              label += context.parsed.y.toFixed(2) + '%';
            }
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        font: {
          size: 12
        },
        callback: function(value) {
          return value.toLocaleString('pt-BR');
        }
      },
      title: {
        display: true,
        text: 'Quantidade',
        font: {
          size: 13,
          weight: 'bold'
        }
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      beginAtZero: true,
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        font: {
          size: 12
        },
        callback: function(value) {
          return value.toFixed(1) + '%';
        }
      },
      title: {
        display: true,
        text: 'Porcentagem (%)',
        font: {
          size: 13,
          weight: 'bold'
        }
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 12,
          weight: '600'
        }
      }
    }
  }
});

// Buscar dados da API
const fetchDados = async () => {
  try {
    // Substitua pela sua chamada de API real
    // const response = await suaFuncaoAPI();
    // dadosCancelamentos.value = response.data.data;
    
    // Dados de exemplo (remova quando integrar com API)
    dadosCancelamentos.value = [
      {
        "ano": "2026",
        "qtd_cancelamentos": 2028,
        "porcentagem_cancelamentos": "2.32"
      },
      {
        "ano": "2025",
        "qtd_cancelamentos": 21168,
        "porcentagem_cancelamentos": "24.20"
      },
      {
        "ano": "2024",
        "qtd_cancelamentos": 17272,
        "porcentagem_cancelamentos": "19.75"
      },
      {
        "ano": "2023",
        "qtd_cancelamentos": 14607,
        "porcentagem_cancelamentos": "16.70"
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
  border-radius: 12px;
  overflow: hidden;
  max-width: 1200px;
  margin: 0 auto;
}

.chart-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
  padding: 18px 24px;
  display: flex;
  align-items: center;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  flex: 1;
  min-width: 150px;
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tendencia-alta {
  color: #f44336;
}

.tendencia-baixa {
  color: #4caf50;
}

.tendencia-estavel {
  color: #ff9800;
}

.chart-wrapper {
  height: 400px;
  padding: 20px 10px;
}

@media (max-width: 768px) {
  .chart-wrapper {
    height: 350px;
  }
  
  .stats-row {
    flex-direction: column;
  }
  
  .stat-item {
    min-width: 100%;
  }
}
</style>