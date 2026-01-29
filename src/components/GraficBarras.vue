<template>
  <v-card class="combo-chart-card elevation-2">
    <div class="card-header">
      <div class="header-content">
        <v-icon icon="mdi-chart-bar" size="small" color="white"></v-icon>
        <span class="header-title">Cancelamentos e Taxa Anual</span>
      </div>
      <v-chip size="x-small" color="white" variant="outlined">
        {{ dadosCancelamentos.length }} anos
      </v-chip>
    </div>
    
    <div class="stats-combo">
      <div class="stat-combo-item">
        <div class="stat-combo-icon">
          <v-icon icon="mdi-trending-up" color="#6366f1"></v-icon>
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
          <v-icon icon="mdi-percent" color="#ef4444"></v-icon>
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
          <v-icon icon="mdi-sigma" color="#8b5cf6"></v-icon>
        </div>
        <div class="stat-combo-content">
          <div class="stat-combo-label">Total Período</div>
          <div class="stat-combo-value">{{ totalFormatado }}</div>
          <div class="stat-combo-subtitle">{{ dadosCancelamentos.length }} anos</div>
        </div>
      </div>
    </div>

    <div class="chart-wrapper-combo">
      <Bar :data="chartData" :options="chartOptions" />
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

// Registrar componentes do Chart.js
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

// Dados da API
const dadosCancelamentos = ref([]);

// Estatísticas computadas
const maiorQuantidade = computed(() => {
  if (dadosCancelamentos.value.length === 0) return '0';
  const max = Math.max(...dadosCancelamentos.value.map(item => item.qtd_cancelamentos));
  return max.toLocaleString('pt-BR');
});

const anoMaiorQtd = computed(() => {
  if (dadosCancelamentos.value.length === 0) return '';
  const itemMax = dadosCancelamentos.value.reduce((prev, current) => 
    (prev.qtd_cancelamentos > current.qtd_cancelamentos) ? prev : current
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
  const total = dadosCancelamentos.value.reduce((acc, item) => acc + item.qtd_cancelamentos, 0);
  return total.toLocaleString('pt-BR');
});

// Configuração dos dados do gráfico
const chartData = computed(() => ({
  labels: dadosCancelamentos.value.map(item => item.ano).reverse(),
  datasets: [
    {
      type: 'bar',
      label: 'Quantidade de Cancelamentos',
      data: dadosCancelamentos.value.map(item => item.qtd_cancelamentos).reverse(),
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.8)');
        return gradient;
      },
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 2,
      borderRadius: 6,
      yAxisID: 'y',
    },
    {
      type: 'line',
      label: 'Taxa de Cancelamento (%)',
      data: dadosCancelamentos.value.map(item => parseFloat(item.taxa_cancelamento)).reverse(),
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 3,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: 'rgb(239, 68, 68)',
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
        color: '#6366f1'
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
        color: '#ef4444'
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
        "qtd_cancelamentos": 2046,
        "taxa_cancelamento": "68.87"
      },
      {
        "ano": "2025",
        "qtd_cancelamentos": 21187,
        "taxa_cancelamento": "53.27"
      },
      {
        "ano": "2024",
        "qtd_cancelamentos": 17281,
        "taxa_cancelamento": "42.56"
      },
      {
        "ano": "2023",
        "qtd_cancelamentos": 14607,
        "taxa_cancelamento": "53.14"
      },
      {
        "ano": "2022",
        "qtd_cancelamentos": 12981,
        "taxa_cancelamento": "61.52"
      },
      {
        "ano": "2021",
        "qtd_cancelamentos": 12012,
        "taxa_cancelamento": "49.52"
      },
      {
        "ano": "2020",
        "qtd_cancelamentos": 7397,
        "taxa_cancelamento": "33.65"
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
.combo-chart-card {
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
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