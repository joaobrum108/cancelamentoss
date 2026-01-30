<template>
  <v-card class="combo-chart-card ">
    <div class="card-header">
      <div class="header-content">
        <v-icon icon="mdi-chart-bar" size="small" color="white"></v-icon>
        <span class="header-title">Cancelamentos e Taxa Anual</span>
      </div>
      <v-chip size="x-small" color="white" variant="outlined">
        {{ periodoAnos }}
      </v-chip>
    </div>
    
    <div class="stats-combo">
      <div class="stat-combo-item">
        <div class="stat-combo-icon">
          <v-icon icon="mdi-trending-up" color="#b22222"></v-icon>
        </div>
        <div class="stat-combo-content">
          <div class="stat-combo-label">Maior Quantidade</div>
          <div class="stat-combo-value">{{ maiorQuantidade }}</div>
          <div class="stat-combo-subtitle">{{ anoMaiorQtd }}</div>
        </div>
      </div>
      
      <div class="stat-combo-divider"></div>
      
      <div class="stat-combo-item">
        <div class="stat-combo-icon">
          <v-icon icon="mdi-percent" color="#b22222"></v-icon>
        </div>
        <div class="stat-combo-content">
          <div class="stat-combo-label">Maior Taxa</div>
          <div class="stat-combo-value">{{ maiorTaxa }}%</div>
          <div class="stat-combo-subtitle">{{ anoMaiorTaxa }}</div>
        </div>
      </div>
      
      <div class="stat-combo-divider"></div>
      
      <div class="stat-combo-item">
        <div class="stat-combo-icon">
          <v-icon icon="mdi-sigma" color="#b22222"></v-icon>
        </div>
        <div class="stat-combo-content">
          <div class="stat-combo-label">Total Período</div>
          <div class="stat-combo-value">{{ totalFormatado }}</div>
          <div class="stat-combo-subtitle">{{ periodoAnos }}</div>
        </div>
      </div>
    </div>

    <div class="chart-wrapper-combo">
      <Bar v-if="dadosCancelamentos.length > 0" :data="chartData" :options="chartOptions" />
      <div v-else class="loading-state">Carregando dados...</div>
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { analiseTaxaCancelamento } from '../services/api-cancelamentos';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const dadosCancelamentos = ref([]);

const periodoAnos = computed(() => {
  if (dadosCancelamentos.value.length === 0) return '';
  const anos = dadosCancelamentos.value.map(item => Number(item.ano)).sort((a, b) => a - b);
  const anoInicial = anos[0];
  const anoFinal = new Date().getFullYear();
  return `${anoInicial}-${anoFinal}`;
});

const maiorQuantidade = computed(() => {
  if (dadosCancelamentos.value.length === 0) return '0';
  const max = Math.max(...dadosCancelamentos.value.map(item => Number(item.qtd_cancelamentos)));
  return max.toLocaleString('pt-BR');
});

const anoMaiorQtd = computed(() => {
  if (dadosCancelamentos.value.length === 0) return '';
  const itemMax = dadosCancelamentos.value.reduce((prev, current) => 
    (Number(prev.qtd_cancelamentos) > Number(current.qtd_cancelamentos)) ? prev : current
  );
  return itemMax.ano;
});

const maiorTaxa = computed(() => {
  if (dadosCancelamentos.value.length === 0) return '0';
  const max = Math.max(...dadosCancelamentos.value.map(item => parseFloat(item.taxa_cancelamento)));
  return max.toFixed(2);
});

const anoMaiorTaxa = computed(() => {
  if (dadosCancelamentos.value.length === 0) return '';
  const itemMax = dadosCancelamentos.value.reduce((prev, current) => 
    (parseFloat(prev.taxa_cancelamento) > parseFloat(current.taxa_cancelamento)) ? prev : current
  );
  return itemMax.ano;
});

const totalFormatado = computed(() => {
  const total = dadosCancelamentos.value.reduce((acc, item) => acc + Number(item.qtd_cancelamentos), 0);
  return total.toLocaleString('pt-BR');
});

const chartData = computed(() => ({
  labels: dadosCancelamentos.value.map(item => item.ano).reverse(),
  datasets: [
    {
      type: 'bar',
      label: 'Quantidade de Cancelamentos',
      data: dadosCancelamentos.value.map(item => Number(item.qtd_cancelamentos)).reverse(),
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(178, 34, 34, 0.8)');
        gradient.addColorStop(1, 'rgba(178, 34, 34, 0.5)');
        return gradient;
      },
      borderColor: '#b22222',
      borderWidth: 2,
      borderRadius: 6,
      yAxisID: 'y',
    },
    {
      type: 'line',
      label: 'Taxa de Cancelamento (%)',
      data: dadosCancelamentos.value.map(item => parseFloat(item.taxa_cancelamento)).reverse(),
      borderColor: '#b22222',
      backgroundColor: 'rgba(178, 34, 34, 0.1)',
      borderWidth: 3,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: '#b22222',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      yAxisID: 'y1',
    }
  ]
}));

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
        padding: 15,
        font: {
          size: 12,
          weight: '600'
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      padding: 12,
      titleFont: {
        size: 13,
        weight: 'bold'
      },
      bodyFont: {
        size: 12
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
          size: 11
        },
        callback: function(value) {
          if (value >= 1000) {
            return (value / 1000).toFixed(0) + 'k';
          }
          return value.toLocaleString('pt-BR');
        }
      },
      title: {
        display: true,
        text: 'Quantidade',
        font: {
          size: 12,
          weight: 'bold'
        },
        color: '#b22222'
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
          size: 11
        },
        callback: function(value) {
          return value.toFixed(0) + '%';
        }
      },
      title: {
        display: true,
        text: 'Taxa (%)',
        font: {
          size: 12,
          weight: 'bold'
        },
        color: '#b22222'
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11,
          weight: '600'
        }
      }
    }
  }
});

const fetchDados = async () => {
  try {
    const response = await analiseTaxaCancelamento();
    console.log('Resposta da API:', response.data);
    
    if (Array.isArray(response.data)) {
      dadosCancelamentos.value = response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      dadosCancelamentos.value = response.data.data;
    } else if (response.data.result && Array.isArray(response.data.result)) {
      dadosCancelamentos.value = response.data.result;
    } else {
      console.error('Formato inesperado da API:', response.data);
      dadosCancelamentos.value = [];
    }
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    dadosCancelamentos.value = [];
  }
};

onBeforeMount(() => {
  fetchDados();
});
</script>

<style scoped>
.combo-chart-card {
  border-radius: 12px;
  max-width: 1400px;
  min-height: 590px;
  max-height: 600px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  background: linear-gradient(135deg, #b22222 0%, #8b1a1a 100%);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
}

.stats-combo {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 16px;
  background: #f5f5f5;
  gap: 16px;
}

.stat-combo-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
}

.stat-combo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-combo-content {
  flex: 1;
}

.stat-combo-label {
  font-size: 0.7rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 2px;
}

.stat-combo-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.stat-combo-subtitle {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 500;
  margin-top: 2px;
}

.stat-combo-divider {
  width: 1px;
  height: 50px;
  background: linear-gradient(to bottom, transparent, #cbd5e1, transparent);
}

.chart-wrapper-combo {
  height: 320px;
  padding: 20px 16px 16px 16px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state {
  color: #666;
  font-size: 14px;
  text-align: center;
}

@media (max-width: 768px) {
  .stats-combo {
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-combo-item {
    width: 100%;
    justify-content: flex-start;
  }
  
  .stat-combo-divider {
    display: none;
  }
  
  .chart-wrapper-combo {
    height: 280px;
  }
}
</style>