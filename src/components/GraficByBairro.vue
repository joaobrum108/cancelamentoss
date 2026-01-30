<template>
  <v-card class="bairros-chart-card">
    <div class="card-header">
      <div class="header-content">
        <v-icon icon="mdi-map-marker-radius" size="small" color="white"></v-icon>
        <span class="header-title">Top Bairros com Cancelamentos</span>
      </div>
      <v-chip size="x-small" color="white" variant="outlined">
        {{ dadosFiltrados.length }} bairros
      </v-chip>
    </div>

    <div class="filters-section">
      <v-row dense>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filtros.busca"
            density="compact"
            placeholder="Buscar bairro..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            hide-details
            clearable
            bg-color="#f5f5f5"
          ></v-text-field>
        </v-col>
        
        <v-col cols="12" md="3">
          <v-select
            v-model="filtros.topN"
            :items="[5, 10, 15, 20]"
            density="compact"
            label="Exibir top"
            variant="outlined"
            hide-details
            bg-color="#f5f5f5"
          >
            <template v-slot:selection="{ item }">
              Top {{ item.value }}
            </template>
          </v-select>
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="filtros.ordenacao"
            :items="[
              { title: 'Maior → Menor', value: 'desc' },
              { title: 'Menor → Maior', value: 'asc' },
            ]"
            density="compact"
            label="Ordenar por"
            variant="outlined"
            hide-details
            bg-color="#f5f5f5"
          ></v-select>
        </v-col>

        <v-col cols="12" md="2">
          <v-btn
            @click="limparFiltros"
            variant="outlined"
            color="#b22222"
            density="compact"
            block
            prepend-icon="mdi-refresh"
          >
            Limpar
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <div class="stats-bairros">
      <div class="stat-bairro-item">
        <div class="stat-bairro-icon">
          <v-icon icon="mdi-trophy" color="#b22222"></v-icon>
        </div>
        <div class="stat-bairro-content">
          <div class="stat-bairro-label">Bairro Líder</div>
          <div class="stat-bairro-value">{{ bairroLider.nome }}</div>
          <div class="stat-bairro-subtitle">{{ bairroLider.qtd }} cancelamentos</div>
        </div>
      </div>
      
      <div class="stat-bairro-divider"></div>
      
      <div class="stat-bairro-item">
        <div class="stat-bairro-icon">
          <v-icon icon="mdi-sigma" color="#b22222"></v-icon>
        </div>
        <div class="stat-bairro-content">
          <div class="stat-bairro-label">Total Exibido</div>
          <div class="stat-bairro-value">{{ totalExibido }}</div>
          <div class="stat-bairro-subtitle">{{ dadosFiltrados.length }} bairros</div>
        </div>
      </div>
      
      <div class="stat-bairro-divider"></div>
      
      <div class="stat-bairro-item">
        <div class="stat-bairro-icon">
          <v-icon icon="mdi-percent" color="#b22222"></v-icon>
        </div>
        <div class="stat-bairro-content">
          <div class="stat-bairro-label">Média por Bairro</div>
          <div class="stat-bairro-value">{{ mediaPorBairro }}</div>
          <div class="stat-bairro-subtitle">cancelamentos</div>
        </div>
      </div>
    </div>

    <div class="chart-wrapper-bairros">
      <Bar v-if="dadosFiltrados.length > 0" :data="chartData" :options="chartOptions" />
      <div v-else class="empty-state">
        <v-icon icon="mdi-map-marker-off" size="48" color="#ccc"></v-icon>
        <p>Nenhum bairro encontrado com os filtros aplicados</p>
      </div>
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
import { analiseBairro } from '../services/api-cancelamentos';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const dadosBairros = ref([]);
const filtros = ref({
  busca: '',
  topN: 10,
  ordenacao: 'desc'
});

const dadosFiltrados = computed(() => {
  let dados = [...dadosBairros.value];

  if (filtros.value.busca) {
    dados = dados.filter(item => 
      item.bairro.toLowerCase().includes(filtros.value.busca.toLowerCase())
    );
  }

  if (filtros.value.ordenacao === 'desc') {
    dados.sort((a, b) => b.qtd_cancelamentos - a.qtd_cancelamentos);
  } else if (filtros.value.ordenacao === 'asc') {
    dados.sort((a, b) => a.qtd_cancelamentos - b.qtd_cancelamentos);
  } else if (filtros.value.ordenacao === 'alpha') {
    dados.sort((a, b) => a.bairro.localeCompare(b.bairro));
  }

  return dados.slice(0, filtros.value.topN);
});

const bairroLider = computed(() => {
  if (dadosFiltrados.value.length === 0) return { nome: '-', qtd: 0 };
  const leader = dadosFiltrados.value.reduce((prev, current) => 
    (current.qtd_cancelamentos > prev.qtd_cancelamentos) ? current : prev
  );
  return {
    nome: leader.bairro,
    qtd: leader.qtd_cancelamentos.toLocaleString('pt-BR')
  };
});

const totalExibido = computed(() => {
  const total = dadosFiltrados.value.reduce((acc, item) => acc + item.qtd_cancelamentos, 0);
  return total.toLocaleString('pt-BR');
});

const mediaPorBairro = computed(() => {
  if (dadosFiltrados.value.length === 0) return '0';
  const total = dadosFiltrados.value.reduce((acc, item) => acc + item.qtd_cancelamentos, 0);
  const media = total / dadosFiltrados.value.length;
  return Math.round(media).toLocaleString('pt-BR');
});

const chartData = computed(() => ({
  labels: dadosFiltrados.value.map(item => item.bairro),
  datasets: [
    {
      label: 'Cancelamentos',
      data: dadosFiltrados.value.map(item => item.qtd_cancelamentos),
      backgroundColor: dadosFiltrados.value.map((_, index) => {
        const opacity = 1 - (index / dadosFiltrados.value.length) * 0.5;
        return `rgba(178, 34, 34, ${opacity})`;
      }),
      borderColor: '#b22222',
      borderWidth: 2,
      borderRadius: 8,
    }
  ]
}));

const chartOptions = ref({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
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
          return `${context.parsed.x.toLocaleString('pt-BR')} cancelamentos`;
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
          size: 11
        },
        callback: function(value) {
          if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k';
          }
          return value;
        }
      }
    },
    y: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11,
          weight: '600'
        },
        autoSkip: false
      }
    }
  }
});

const limparFiltros = () => {
  filtros.value = {
    busca: '',
    topN: 10,
    ordenacao: 'desc'
  };
};

const fetchDados = async () => {
  try {
    const response = await analiseBairro();
    console.log('Resposta da API:', response.data);
    
    if (Array.isArray(response.data)) {
      dadosBairros.value = response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      dadosBairros.value = response.data.data;
    } else {
      console.error('Formato inesperado da API:', response.data);
      dadosBairros.value = [];
    }
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    dadosBairros.value = [];
  }
};

onBeforeMount(() => {
  fetchDados();
});
</script>

<style scoped>
.bairros-chart-card {
  border-radius: 12px;
  max-width: 1400px;
  overflow: hidden;
  height: 100%;
  min-height: 600px;
  max-height: 601px;
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

.filters-section {
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.stats-bairros {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 16px;
  background: #f5f5f5;
  gap: 16px;
}

.stat-bairro-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
}

.stat-bairro-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-bairro-content {
  flex: 1;
}

.stat-bairro-label {
  font-size: 0.7rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 2px;
}

.stat-bairro-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-bairro-subtitle {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 500;
  margin-top: 2px;
}

.stat-bairro-divider {
  width: 1px;
  height: 50px;
  background: linear-gradient(to bottom, transparent, #cbd5e1, transparent);
}

.chart-wrapper-bairros {
  height: 450px;
  padding: 20px 16px 16px 16px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #999;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .stats-bairros {
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-bairro-item {
    width: 100%;
    justify-content: flex-start;
  }
  
  .stat-bairro-divider {
    display: none;
  }
  
  .chart-wrapper-bairros {
    height: 400px;
  }
}
</style>