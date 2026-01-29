<template>
  <v-card class="comparative-chart-card elevation-2">
    <div class="card-header">
      <div class="header-content">
        <v-icon icon="mdi-chart-timeline-variant" size="small" color="white"></v-icon>
        <span class="header-title">Análise Comparativa - Cancelamentos</span>
      </div>
      <v-chip size="x-small" color="white" variant="outlined">
        {{ dadosCancelamentos.length }} meses
      </v-chip>
    </div>
    
    <div class="stats-comparative">
      <div class="stat-comp-item">
        <div class="stat-comp-label">Período Atual</div>
        <div class="stat-comp-value primary-color">
          {{ ultimosPeriodo.valor }}
          <span class="period-label">média últimos 3 meses</span>
        </div>
      </div>
      <div class="stat-comp-divider">
        <v-icon :icon="comparisonIcon" :class="comparisonClass" size="large"></v-icon>
      </div>
      <div class="stat-comp-item">
        <div class="stat-comp-label">Período Anterior</div>
        <div class="stat-comp-value secondary-color">
          {{ periodoAnterior.valor }}
          <span class="period-label">média 3 meses anteriores</span>
        </div>
      </div>
    </div>

    <div class="comparison-badge" :class="comparisonClass">
      <v-icon :icon="comparisonIcon" size="small"></v-icon>
      <span>{{ comparisonText }}</span>
    </div>

    <div v-if="carregando" class="chart-loader">
      <v-progress-circular indeterminate color="#db0e35"></v-progress-circular>
    </div>
    <div v-else class="chart-wrapper-comparative">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
    
    <div v-if="!carregando" class="insights-section">
      <div class="insight-card" :class="trendInsightClass">
        <v-icon :icon="trendInsightIcon" size="small"></v-icon>
        <div class="insight-content">
          <div class="insight-title">{{ trendInsightTitle }}</div>
          <div class="insight-text">{{ trendInsightText }}</div>
        </div>
      </div>
      
      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-label">Maior Mês</div>
          <div class="metric-value">{{ maiorMes.valor }}</div>
          <div class="metric-subtitle">{{ maiorMes.mes }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">Menor Mês</div>
          <div class="metric-value">{{ menorMes.valor }}</div>
          <div class="metric-subtitle">{{ menorMes.mes }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">Variação</div>
          <div class="metric-value">{{ variacaoTotal }}%</div>
          <div class="metric-subtitle">no período</div>
        </div>
      </div>
    </div>
    
    <div v-if="erro" class="error-message">
      <v-icon color="#db0e35" icon="mdi-alert-circle"></v-icon>
      <span>Erro ao carregar dados</span>
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
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { analiseMes } from '../services/api-cancelamentos.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PRIMARY_COLOR = '#db0e35';
const SECONDARY_COLOR = '#6b7280';
const SUCCESS_COLOR = '#10b981';
const DANGER_COLOR = '#ef4444';
const WARNING_COLOR = '#f59e0b';

const dadosCancelamentos = ref([]);
const carregando = ref(true);
const erro = ref(false);

// Computed para análise comparativa
const ultimosPeriodo = computed(() => {
  if (dadosCancelamentos.value.length < 3) return { valor: '0', meses: [] };
  
  const ultimos3 = dadosCancelamentos.value.slice(0, 3);
  const soma = ultimos3.reduce((acc, item) => acc + item.qtd_cancelamentos, 0);
  const media = Math.round(soma / 3);
  
  return {
    valor: media.toLocaleString('pt-BR'),
    meses: ultimos3.map(item => item.mes),
    valorNumerico: media
  };
});

const periodoAnterior = computed(() => {
  if (dadosCancelamentos.value.length < 6) return { valor: '0', meses: [] };
  
  const anterior3 = dadosCancelamentos.value.slice(3, 6);
  const soma = anterior3.reduce((acc, item) => acc + item.qtd_cancelamentos, 0);
  const media = Math.round(soma / 3);
  
  return {
    valor: media.toLocaleString('pt-BR'),
    meses: anterior3.map(item => item.mes),
    valorNumerico: media
  };
});

const comparisonIcon = computed(() => {
  const diff = ultimosPeriodo.value.valorNumerico - periodoAnterior.value.valorNumerico;
  if (diff > 0) return 'mdi-arrow-up-bold';
  if (diff < 0) return 'mdi-arrow-down-bold';
  return 'mdi-equal';
});

const comparisonClass = computed(() => {
  const diff = ultimosPeriodo.value.valorNumerico - periodoAnterior.value.valorNumerico;
  if (diff > 0) return 'comparison-up';
  if (diff < 0) return 'comparison-down';
  return 'comparison-stable';
});

const comparisonText = computed(() => {
  const diff = ultimosPeriodo.value.valorNumerico - periodoAnterior.value.valorNumerico;
  const percent = periodoAnterior.value.valorNumerico !== 0 
    ? Math.abs((diff / periodoAnterior.value.valorNumerico) * 100).toFixed(1)
    : 0;
  
  if (diff > 0) {
    return `Aumento de ${percent}% em relação ao período anterior`;
  } else if (diff < 0) {
    return `Redução de ${percent}% em relação ao período anterior`;
  }
  return 'Estável em relação ao período anterior';
});

const maiorMes = computed(() => {
  if (dadosCancelamentos.value.length === 0) return { valor: '0', mes: '-' };
  
  const maior = dadosCancelamentos.value.reduce((max, item) => 
    item.qtd_cancelamentos > max.qtd_cancelamentos ? item : max
  );
  
  return {
    valor: maior.qtd_cancelamentos.toLocaleString('pt-BR'),
    mes: formatarMes(maior.mes)
  };
});

const menorMes = computed(() => {
  if (dadosCancelamentos.value.length === 0) return { valor: '0', mes: '-' };
  
  const menor = dadosCancelamentos.value.reduce((min, item) => 
    item.qtd_cancelamentos < min.qtd_cancelamentos ? item : min
  );
  
  return {
    valor: menor.qtd_cancelamentos.toLocaleString('pt-BR'),
    mes: formatarMes(menor.mes)
  };
});

const variacaoTotal = computed(() => {
  if (dadosCancelamentos.value.length < 2) return '0.0';
  
  const primeiro = dadosCancelamentos.value[dadosCancelamentos.value.length - 1].qtd_cancelamentos;
  const ultimo = dadosCancelamentos.value[0].qtd_cancelamentos;
  const variacao = ((ultimo - primeiro) / primeiro) * 100;
  
  return variacao.toFixed(1);
});

const trendInsightClass = computed(() => {
  const diff = ultimosPeriodo.value.valorNumerico - periodoAnterior.value.valorNumerico;
  if (diff > 0) return 'insight-warning';
  if (diff < 0) return 'insight-success';
  return 'insight-info';
});

const trendInsightIcon = computed(() => {
  const diff = ultimosPeriodo.value.valorNumerico - periodoAnterior.value.valorNumerico;
  if (diff > 0) return 'mdi-alert-circle';
  if (diff < 0) return 'mdi-check-circle';
  return 'mdi-information';
});

const trendInsightTitle = computed(() => {
  const diff = ultimosPeriodo.value.valorNumerico - periodoAnterior.value.valorNumerico;
  if (diff > 0) return 'Tendência de Alta';
  if (diff < 0) return 'Tendência de Queda';
  return 'Tendência Estável';
});

const trendInsightText = computed(() => {
  const diff = ultimosPeriodo.value.valorNumerico - periodoAnterior.value.valorNumerico;
  const percent = Math.abs((diff / periodoAnterior.value.valorNumerico) * 100).toFixed(1);
  
  if (diff > 0) {
    return `Cancelamentos aumentaram ${percent}% comparado ao trimestre anterior`;
  } else if (diff < 0) {
    return `Cancelamentos reduziram ${percent}% comparado ao trimestre anterior`;
  }
  return 'Cancelamentos mantêm-se estáveis';
});

const formatarMes = (mes) => {
  const [ano, mesNum] = mes.split('-');
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${meses[parseInt(mesNum) - 1]}/${ano.slice(2)}`;
};

const chartData = computed(() => {
  const dadosReverso = [...dadosCancelamentos.value].reverse();
  
  // Criar datasets comparativos
  const dataset1 = [];
  const dataset2 = [];
  const labels = [];
  
  // Dividir em dois períodos para comparação
  const metade = Math.floor(dadosReverso.length / 2);
  
  dadosReverso.forEach((item, index) => {
    labels.push(formatarMes(item.mes));
    
    if (index < metade) {
      dataset1.push(item.qtd_cancelamentos);
      dataset2.push(null);
    } else {
      dataset1.push(null);
      dataset2.push(item.qtd_cancelamentos);
    }
  });
  
  return {
    labels,
    datasets: [
      {
        label: 'Período Anterior',
        data: dataset1,
        backgroundColor: SECONDARY_COLOR + '80',
        borderColor: SECONDARY_COLOR,
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Período Atual',
        data: dataset2,
        backgroundColor: PRIMARY_COLOR + '80',
        borderColor: PRIMARY_COLOR,
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  };
});

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
      align: 'end',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 15,
        font: {
          size: 11,
          weight: '600',
          family: "'Inter', sans-serif"
        },
        color: '#374151'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      padding: 14,
      titleFont: {
        size: 13,
        weight: 'bold'
      },
      bodyFont: {
        size: 12,
        weight: '600'
      },
      displayColors: true,
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || '';
          const value = context.parsed.y;
          
          if (value === null) return null;
          
          // Calcular variação se possível
          let variation = '';
          const dataIndex = context.dataIndex;
          const allData = dadosCancelamentos.value.map(d => d.qtd_cancelamentos).reverse();
          
          if (dataIndex > 0 && allData[dataIndex - 1]) {
            const diff = value - allData[dataIndex - 1];
            const percent = ((diff / allData[dataIndex - 1]) * 100).toFixed(1);
            variation = diff > 0 ? ` (+${percent}%)` : ` (${percent}%)`;
          }
          
          return `${label}: ${value.toLocaleString('pt-BR')}${variation}`;
        }
      },
      cornerRadius: 8,
      boxPadding: 6
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.06)',
        drawBorder: false,
      },
      ticks: {
        font: {
          size: 11,
          family: "'Inter', sans-serif"
        },
        color: '#6b7280',
        padding: 10,
        callback: function(value) {
          if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k';
          }
          return value;
        }
      },
      border: {
        display: false
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        font: {
          size: 10,
          family: "'Inter', sans-serif",
          weight: '600'
        },
        color: '#6b7280',
        maxRotation: 45,
        minRotation: 45
      },
      border: {
        display: false
      }
    }
  }
});

const fetchDados = async () => {
  try {
    carregando.value = true;
    erro.value = false;

    const response = await analiseMes();

    dadosCancelamentos.value = response.data.data || response.data || [];
    
    console.log('Dados de cancelamentos processados:', dadosCancelamentos.value);
    
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    erro.value = true;
  } finally {
    carregando.value = false;
  }
};

onBeforeMount(() => {
  fetchDados();
});
</script>

<style scoped>
.comparative-chart-card {
  border-radius: 12px;
  overflow: hidden;
  background: white;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.comparative-chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.card-header {
  background: linear-gradient(135deg, #db0e35 0%, #c40a2d 100%);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title {
  color: white;
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: -0.3px;
}

.stats-comparative {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 24px 20px;
  background: linear-gradient(to bottom, #f9fafb, #ffffff);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-comp-item {
  flex: 1;
  text-align: center;
}

.stat-comp-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.stat-comp-value {
  font-size: 1.8rem;
  font-weight: 900;
  letter-spacing: -1px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.period-label {
  font-size: 0.65rem;
  font-weight: 500;
  color: #9ca3af;
  text-transform: none;
  letter-spacing: 0;
}

.primary-color {
  color: #db0e35;
}

.secondary-color {
  color: #6b7280;
}

.stat-comp-divider {
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comparison-up {
  color: #ef4444;
}

.comparison-down {
  color: #10b981;
}

.comparison-stable {
  color: #6b7280;
}

.comparison-badge {
  margin: 0 20px 16px 20px;
  padding: 10px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

.comparison-badge.comparison-up {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.comparison-badge.comparison-down {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.comparison-badge.comparison-stable {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.chart-wrapper-comparative {
  height: 280px;
  padding: 20px;
  background: white;
}

.chart-loader {
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.insights-section {
  padding: 20px;
  background: #f9fafb;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.insight-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  margin-bottom: 16px;
}

.insight-card.insight-warning {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.insight-card.insight-success {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #059669;
}

.insight-card.insight-info {
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #2563eb;
}

.insight-content {
  flex: 1;
}

.insight-title {
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.insight-text {
  font-size: 0.8rem;
  font-weight: 500;
  opacity: 0.9;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.metric-item {
  background: white;
  padding: 14px;
  border-radius: 10px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.metric-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.metric-label {
  font-size: 0.7rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 1.3rem;
  font-weight: 800;
  color: #db0e35;
  letter-spacing: -0.5px;
  margin-bottom: 4px;
}

.metric-subtitle {
  font-size: 0.7rem;
  color: #9ca3af;
  font-weight: 500;
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: rgba(219, 14, 53, 0.1);
  color: #db0e35;
  font-size: 0.85rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .stats-comparative {
    flex-direction: column;
    gap: 20px;
    padding: 20px 16px;
  }
  
  .stat-comp-divider {
    transform: rotate(90deg);
    width: 40px;
  }
  
  .stat-comp-value {
    font-size: 1.5rem;
  }
  
  .chart-wrapper-comparative,
  .chart-loader {
    height: 240px;
    padding: 16px;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .comparison-badge {
    font-size: 0.75rem;
    padding: 8px 12px;
  }
}
</style>
