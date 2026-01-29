<template>
  <v-card class="mini-chart-card elevation-2">
    <div class="card-header">
      <div class="header-content">
        <v-icon icon="mdi-calendar-month" size="small" color="white"></v-icon>
        <span class="header-title">Cancelamentos Mensais</span>
      </div>
      <v-chip size="x-small" color="white" variant="outlined">
        Últimos {{ dadosCancelamentos.length }} meses
      </v-chip>
    </div>
    
    <div class="stats-mini">
      <div class="stat-mini-item">
        <div class="stat-mini-label">Último Mês</div>
        <div class="stat-mini-value">{{ ultimoMes }}</div>
      </div>
      <div class="stat-mini-divider"></div>
      <div class="stat-mini-item">
        <div class="stat-mini-label">Média</div>
        <div class="stat-mini-value">{{ mediaFormatada }}</div>
      </div>
      <div class="stat-mini-divider"></div>
      <div class="stat-mini-item">
        <div class="stat-mini-label">Total</div>
        <div class="stat-mini-value">{{ totalFormatado }}</div>
      </div>
    </div>

    <div class="chart-wrapper-mini">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </v-card>
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

// Registrar componentes do Chart.js
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

// Dados da API
const dadosCancelamentos = ref([]);

// Estatísticas computadas
const ultimoMes = computed(() => {
  if (dadosCancelamentos.value.length === 0) return '0';
  return dadosCancelamentos.value[0].qtd_cancelamentos.toLocaleString('pt-BR');
});

const mediaFormatada = computed(() => {
  if (dadosCancelamentos.value.length === 0) return '0';
  const soma = dadosCancelamentos.value.reduce((acc, item) => acc + item.qtd_cancelamentos, 0);
  const media = Math.round(soma / dadosCancelamentos.value.length);
  return media.toLocaleString('pt-BR');
});

const totalFormatado = computed(() => {
  const total = dadosCancelamentos.value.reduce((acc, item) => acc + item.qtd_cancelamentos, 0);
  return total.toLocaleString('pt-BR');
});

// Formatar mês para exibição (2026-01 -> Jan/26)
const formatarMes = (mes) => {
  const [ano, mesNum] = mes.split('-');
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${meses[parseInt(mesNum) - 1]}/${ano.slice(2)}`;
};

// Configuração dos dados do gráfico
const chartData = computed(() => ({
  labels: dadosCancelamentos.value.map(item => formatarMes(item.mes)).reverse(),
  datasets: [
    {
      label: 'Cancelamentos',
      data: dadosCancelamentos.value.map(item => item.qtd_cancelamentos).reverse(),
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
        return gradient;
      },
      borderWidth: 2.5,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: 'rgb(99, 102, 241)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }
  ]
}));

// Opções do gráfico (compacto)
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      padding: 10,
      titleFont: {
        size: 12,
        weight: 'bold'
      },
      bodyFont: {
        size: 11
      },
      displayColors: false,
      callbacks: {
        label: function(context) {
          return `Cancelamentos: ${context.parsed.y.toLocaleString('pt-BR')}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.03)',
        drawBorder: false
      },
      ticks: {
        font: {
          size: 10
        },
        maxTicksLimit: 5,
        callback: function(value) {
          if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k';
          }
          return value;
        }
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        font: {
          size: 10
        },
        maxRotation: 45,
        minRotation: 45
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
        "mes": "2026-01",
        "qtd_cancelamentos": 2043
      },
      {
        "mes": "2025-12",
        "qtd_cancelamentos": 1426
      },
      {
        "mes": "2025-11",
        "qtd_cancelamentos": 1919
      },
      {
        "mes": "2025-10",
        "qtd_cancelamentos": 1843
      },
      {
        "mes": "2025-09",
        "qtd_cancelamentos": 1338
      },
      {
        "mes": "2025-08",
        "qtd_cancelamentos": 1559
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
.mini-chart-card {
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

.stats-mini {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  gap: 12px;
}

.stat-mini-item {
  flex: 1;
  text-align: center;
}

.stat-mini-label {
  font-size: 0.7rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 4px;
}

.stat-mini-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #6366f1;
}

.stat-mini-divider {
  width: 1px;
  height: 30px;
  background: #ddd;
}

.chart-wrapper-mini {
  height: 180px;
  padding: 16px 12px 12px 12px;
  flex: 1;
}

@media (max-width: 768px) {
  .chart-wrapper-mini {
    height: 160px;
  }
  
  .stats-mini {
    flex-direction: column;
    gap: 8px;
  }
  
  .stat-mini-divider {
    display: none;
  }
}
</style>