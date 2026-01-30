<template>
  <v-container fluid class="pa-9">
    <v-card class="contrato-card elevation-2">
      <div>
        <v-card-title class="text-h6 font-weight-bold pa-4" style="background-color: #b22222; color: white;">
          <div class="d-flex justify-space-between align-center">
            <span>Relatório de Cancelamentos</span>
            <v-btn
              icon
              variant="text"
              size="small"
              @click="exportarCSV"
              color="white"
            >
              <v-icon>mdi-download</v-icon>
              <v-tooltip activator="parent" location="bottom">Exportar CSV</v-tooltip>
            </v-btn>
          </div>
        </v-card-title>
      </div>

      <v-row class="stats-row ma-0 pa-4" style="background: #f5f5f5;">
        <v-col cols="12" md="4" class="py-2">
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(178, 34, 34, 0.1);">
              <v-icon color="#b22222">mdi-file-cancel</v-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">Total de Cancelamentos</div>
              <div class="stat-value">{{ totalCancelamentos }}</div>
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="4" class="py-2">
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(178, 34, 34, 0.1);">
              <v-icon color="#b22222">mdi-calendar-range</v-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">Período</div>
              <div class="stat-value">{{ periodoFiltrado }}</div>
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="4" class="py-2">
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(178, 34, 34, 0.1);">
              <v-icon color="#b22222">mdi-chart-timeline-variant</v-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">Média Diária</div>
              <div class="stat-value">{{ mediaDiaria }}</div>
            </div>
          </div>
        </v-col>
      </v-row>

      <v-divider></v-divider>

      <!-- Filtros -->
      <v-row class="search-wrapper" align="center" no-gutters>
        <v-col cols="12" md="6" class="pb-3 pb-md-0">
          <div class="search-container">
            <v-icon icon="mdi-magnify" size="small" class="search-icon"></v-icon>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Buscar por razão, bairro, CEP, contrato..." 
              class="search-input"
            />
            <v-icon 
              v-if="searchQuery" 
              icon="mdi-close-circle" 
              size="small" 
              class="clear-icon"
              @click="clearSearch"
            ></v-icon>
          </div>
        </v-col>

        <v-col cols="6" md="2" class="pr-1 pr-md-2 pb-3 pb-md-0">
          <div class="date-input-container">
            <v-icon icon="mdi-calendar-range" size="small" class="date-icon"></v-icon>
            <input
              v-model="dateFrom"
              type="date"
              class="date-input"
              placeholder="Data inicial"
              :max="dateTo"
            />
          </div>
        </v-col>

        <v-col cols="6" md="2" class="pl-1 pl-md-2 pb-3 pb-md-0">
          <div class="date-input-container">
            <v-icon icon="mdi-calendar-range" size="small" class="date-icon"></v-icon>
            <input
              v-model="dateTo"
              type="date"
              class="date-input"
              placeholder="Data final"
              :min="dateFrom"
            />
          </div>
        </v-col>

        <v-col cols="12" md="2" class="pl-md-2">
          <v-btn
            @click="limparFiltros"
            variant="outlined"
            color="#b22222"
            block
            size="small"
            prepend-icon="mdi-refresh"
          >
            Limpar Filtros
          </v-btn>
        </v-col>
      </v-row>

      <v-divider></v-divider>

      <div class="results-info pa-3" style="background-color: #f8f9fa;">
        <div class="d-flex justify-space-between align-center flex-wrap gap-3">
          <span class="text-caption" style="color: #666;">
            {{ filteredData.length }} resultado(s) encontrado(s)
            <span v-if="searchQuery"> para "{{ searchQuery }}"</span>
            <v-chip 
              v-if="filtrosAtivos > 0" 
              size="x-small" 
              color="#b22222" 
              variant="outlined"
              class="ml-2"
            >
              {{ filtrosAtivos }} filtro(s) ativo(s)
            </v-chip>
          </span>
          
          <div class="d-flex align-center gap-2">
            <span class="text-caption" style="color: #666;">Itens por página:</span>
            <v-select
              v-model="itemsPerPage"
              :items="[25, 50, 100, 200]"
              density="compact"
              variant="outlined"
              hide-details
              style="width: 80px;"
            ></v-select>
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="custom-table">
          <thead>
            <tr>
              <th @click="ordenarPor('id')" class="sortable">
                Id
                <v-icon v-if="sortColumn === 'id'" size="x-small" class="ml-1">
                  {{ sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </th>
              <th @click="ordenarPor('id_vd_contrato')" class="sortable">
                Id Contrato
                <v-icon v-if="sortColumn === 'id_vd_contrato'" size="x-small" class="ml-1">
                  {{ sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </th>
              <th @click="ordenarPor('razao')" class="sortable">
                Razão
                <v-icon v-if="sortColumn === 'razao'" size="x-small" class="ml-1">
                  {{ sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </th>
              <th @click="ordenarPor('bairro')" class="sortable">
                Bairro
                <v-icon v-if="sortColumn === 'bairro'" size="x-small" class="ml-1">
                  {{ sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </th>
              <th>Cep</th>
              <th>Contrato</th>
              <th @click="ordenarPor('data_ativacao')" class="sortable">
                Data Ativação
                <v-icon v-if="sortColumn === 'data_ativacao'" size="x-small" class="ml-1">
                  {{ sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </th>
              <th @click="ordenarPor('data_cancelamento')" class="sortable">
                Data Cancelamento
                <v-icon v-if="sortColumn === 'data_cancelamento'" size="x-small" class="ml-1">
                  {{ sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </th>
              <th>Motivo Cancelamento</th>
              <th>Obs Cancelamento</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(data, index) in paginatedData" 
              :key="`row-${index}-${data.id}`"
              @click="abrirDetalhes(data)"
              class="clickable-row"
            >
              <td>{{ data.id }}</td>
              <td>{{ data.id_vd_contrato }}</td>
              <td class="razao-column">{{ data.razao }}</td>
              <td>{{ data.bairro }}</td>
              <td>{{ formatCEP(data.cep) }}</td>
              <td>{{ data.contrato }}</td>
              <td>{{ data.data_ativacao }}</td>
              <td>{{ data.data_cancelamento }}</td>
              <td>{{ data.motivo_cancelamento }}</td>
              <td class="obs-column">{{ truncateText(data.obs_cancelamento, 50) }}</td>
            </tr>
            <tr v-if="paginatedData.length === 0">
              <td colspan="10" class="text-center py-8" style="color: #999;">
                <v-icon size="48" color="#ccc" class="mb-2">mdi-file-document-outline</v-icon>
                <div>Nenhum resultado encontrado</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <v-divider></v-divider>
      <div class="pagination-wrapper">
        <div class="pagination-info">
          <span>Mostrando {{ startItem }}-{{ endItem }} de {{ totalItems }} itens</span>
        </div>
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          density="compact"
          size="small"
          color="#b22222"
          active-color="#b22222"
        ></v-pagination>
      </div>
    </v-card>

    <!-- Modal de Detalhes -->
<v-dialog v-model="dialogDetalhes" max-width="800px">
  <v-card>
    <v-card-title class="text-h6 font-weight-bold pa-4" style="background-color: #b22222; color: white;">
      <div class="d-flex justify-space-between align-center w-100">
        <div class="d-flex align-items-center gap-2">
          <v-icon color="white">mdi-file-document-outline</v-icon>
          <span>Detalhes do Cancelamento</span>
        </div>
        <v-btn
          icon
          variant="text"
          size="small"
          @click="dialogDetalhes = false"
          color="white"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text class="pa-0" v-if="itemSelecionado">
      <!-- Seção: Identificação -->
      <div class="detail-section">
        <div class="section-header">
          <v-icon size="small" color="#b22222">mdi-identifier</v-icon>
          <span class="section-title">Identificação</span>
        </div>
        <v-divider></v-divider>
        <v-row class="pa-4" dense>
          <v-col cols="6" md="3">
            <div class="detail-item">
              <div class="detail-label">ID</div>
              <div class="detail-value">{{ itemSelecionado.id }}</div>
            </div>
          </v-col>
          <v-col cols="6" md="3">
            <div class="detail-item">
              <div class="detail-label">ID Contrato</div>
              <div class="detail-value">{{ itemSelecionado.id_vd_contrato }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="detail-item">
              <div class="detail-label">Razão Social</div>
              <div class="detail-value">{{ itemSelecionado.razao }}</div>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Seção: Localização -->
      <div class="detail-section">
        <div class="section-header">
          <v-icon size="small" color="#b22222">mdi-map-marker</v-icon>
          <span class="section-title">Localização</span>
        </div>
        <v-divider></v-divider>
        <v-row class="pa-4" dense>
          <v-col cols="12" md="8">
            <div class="detail-item">
              <div class="detail-label">Bairro</div>
              <div class="detail-value">{{ itemSelecionado.bairro }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="detail-item">
              <div class="detail-label">CEP</div>
              <div class="detail-value">{{ formatCEP(itemSelecionado.cep) }}</div>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Seção: Contrato -->
      <div class="detail-section">
        <div class="section-header">
          <v-icon size="small" color="#b22222">mdi-file-document-edit</v-icon>
          <span class="section-title">Informações do Contrato</span>
        </div>
        <v-divider></v-divider>
        <v-row class="pa-4" dense>
          <v-col cols="12">
            <div class="detail-item">
              <div class="detail-label">Contrato</div>
              <div class="detail-value">{{ itemSelecionado.contrato }}</div>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Seção: Datas -->
      <div class="detail-section">
        <div class="section-header">
          <v-icon size="small" color="#b22222">mdi-calendar-clock</v-icon>
          <span class="section-title">Cronologia</span>
        </div>
        <v-divider></v-divider>
        <v-row class="pa-4" dense>
          <v-col cols="6">
            <div class="detail-item">
              <div class="detail-label">
                <v-icon size="x-small" color="#4caf50" class="mr-1">mdi-check-circle</v-icon>
                Data Ativação
              </div>
              <div class="detail-value">{{ itemSelecionado.data_ativacao }}</div>
            </div>
          </v-col>
          <v-col cols="6">
            <div class="detail-item">
              <div class="detail-label">
                <v-icon size="x-small" color="#b22222" class="mr-1">mdi-close-circle</v-icon>
                Data Cancelamento
              </div>
              <div class="detail-value">{{ itemSelecionado.data_cancelamento }}</div>
            </div>
          </v-col>
          <!-- <v-col cols="12">
            <div class="tempo-ativo-card">
              <v-icon size="small" color="#2196f3">mdi-timer-outline</v-icon>
              <div class="tempo-info">
                <span class="tempo-label">Tempo de Contrato Ativo</span>
                <span class="tempo-value">{{ calcularTempoAtivo(itemSelecionado.data_ativacao, itemSelecionado.data_cancelamento) }}</span>
              </div>
            </div>
          </v-col> -->
        </v-row>
      </div>

      <!-- Seção: Cancelamento -->
      <div class="detail-section">
        <div class="section-header">
          <v-icon size="small" color="#b22222">mdi-alert-circle</v-icon>
          <span class="section-title">Detalhes do Cancelamento</span>
        </div>
        <v-divider></v-divider>
        <v-row class="pa-4" dense>
          <v-col cols="12">
            <div class="detail-item">
              <div class="detail-label">Motivo do Cancelamento</div>
              <v-chip 
                color="#b22222" 
                variant="tonal" 
                size="small"
                class="mt-1"
              >
                Código: {{ itemSelecionado.motivo_cancelamento }}
              </v-chip>
            </div>
          </v-col>
          <v-col cols="12">
            <div class="detail-item">
              <div class="detail-label">Observações</div>
              <div class="obs-box">
                {{ itemSelecionado.obs_cancelamento || 'Sem observações registradas.' }}
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-card-text>

    <v-divider></v-divider>
    
    <v-card-actions class="pa-4 bg-grey-lighten-4">
      <v-spacer></v-spacer>
      <v-btn
        variant="text"
        @click="dialogDetalhes = false"
        color="#666"
      >
        Fechar
      </v-btn>
      <v-btn
        variant="flat"
        color="#b22222"
        @click="exportarDetalhePDF"
        prepend-icon="mdi-file-pdf-box"
      >
        Exportar PDF
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onBeforeMount, watch } from 'vue';
import { relatorioCancelamentos } from '../services/api-cancelamentos';

const listaRelatorio = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(50);
const searchQuery = ref('');
const dateFrom = ref('');
const dateTo = ref('');
const sortColumn = ref('');
const sortDirection = ref('asc');
const dialogDetalhes = ref(false);
const itemSelecionado = ref(null);


const totalCancelamentos = computed(() => {
  return filteredData.value.length.toLocaleString('pt-BR');
});

const periodoFiltrado = computed(() => {
  if (dateFrom.value && dateTo.value) {
    const dataInicio = new Date(dateFrom.value).toLocaleDateString('pt-BR');
    const dataFim = new Date(dateTo.value).toLocaleDateString('pt-BR');
    return `${dataInicio} - ${dataFim}`;
  }
  if (dateFrom.value) {
    return `Desde ${new Date(dateFrom.value).toLocaleDateString('pt-BR')}`;
  }
  if (dateTo.value) {
    return `Até ${new Date(dateTo.value).toLocaleDateString('pt-BR')}`;
  }
  return 'Todos os períodos';
});

const mediaDiaria = computed(() => {
  if (!dateFrom.value || !dateTo.value || filteredData.value.length === 0) {
    return '-';
  }
  const inicio = new Date(dateFrom.value);
  const fim = new Date(dateTo.value);
  const diffTime = Math.abs(fim - inicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const media = filteredData.value.length / diffDays;
  return media.toFixed(1);
});

const filtrosAtivos = computed(() => {
  let count = 0;
  if (searchQuery.value) count++;
  if (dateFrom.value) count++;
  if (dateTo.value) count++;
  return count;
});

const filteredData = computed(() => {
  let filtered = [...listaRelatorio.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(item => {
      return (
        item.razao?.toLowerCase().includes(query) ||
        item.bairro?.toLowerCase().includes(query) ||
        item.cep?.toLowerCase().includes(query) ||
        item.contrato?.toLowerCase().includes(query) ||
        item.motivo_cancelamento?.toString().toLowerCase().includes(query) ||
        item.obs_cancelamento?.toLowerCase().includes(query)
      );
    });
  }

  if (dateFrom.value) {
    filtered = filtered.filter(item => {
      if (!item.data_cancelamento) return false;
      const [day, month, year] = item.data_cancelamento.split('/');
      const dataFormatada = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      return dataFormatada >= dateFrom.value;
    });
  }
  
  if (dateTo.value) {
    filtered = filtered.filter(item => {
      if (!item.data_cancelamento) return false;
      const [day, month, year] = item.data_cancelamento.split('/');
      const dataFormatada = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      return dataFormatada <= dateTo.value;
    });
  }

  if (sortColumn.value) {
    filtered.sort((a, b) => {
      let aVal = a[sortColumn.value];
      let bVal = b[sortColumn.value];
      
      if (sortColumn.value.includes('data_')) {
        aVal = convertDateToSortable(aVal);
        bVal = convertDateToSortable(bVal);
      }
      
      if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  return filtered;
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredData.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / itemsPerPage.value);
});

const totalItems = computed(() => filteredData.value.length);

const startItem = computed(() => {
  if (filteredData.value.length === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});
// Adicione essa função junto com as outras funções
const calcularTempoAtivo = (dataAtivacao, dataCancelamento) => {
  if (!dataAtivacao || !dataCancelamento) return '-';
  
  try {
    const [diaAtiv, mesAtiv, anoAtiv] = dataAtivacao.split('/');
    const [diaCanc, mesCanc, anoCanc] = dataCancelamento.split('/');
    
    const inicio = new Date(anoAtiv, mesAtiv - 1, diaAtiv);
    const fim = new Date(anoCanc, mesCanc - 1, diaCanc);
    
    const diffTime = Math.abs(fim - inicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const anos = Math.floor(diffDays / 365);
    const meses = Math.floor((diffDays % 365) / 30);
    const dias = Math.floor((diffDays % 365) % 30);
    
    let resultado = [];
    if (anos > 0) resultado.push(`${anos} ano${anos > 1 ? 's' : ''}`);
    if (meses > 0) resultado.push(`${meses} mês${meses > 1 ? 'es' : ''}`);
    if (dias > 0) resultado.push(`${dias} dia${dias > 1 ? 's' : ''}`);
    
    return resultado.length > 0 ? resultado.join(', ') : '0 dias';
  } catch (error) {
    return '-';
  }
};

const exportarDetalhePDF = () => {
  // Placeholder para futura implementação de export PDF
  console.log('Exportar PDF do item:', itemSelecionado.value);
  alert('Funcionalidade de exportar PDF será implementada em breve!');
};
const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value;
  return end > totalItems.value ? totalItems.value : end;
});

const clearSearch = () => {
  searchQuery.value = '';
};

const limparFiltros = () => {
  searchQuery.value = '';
  dateFrom.value = '';
  dateTo.value = '';
  sortColumn.value = '';
  sortDirection.value = 'asc';
};

const ordenarPor = (coluna) => {
  if (sortColumn.value === coluna) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = coluna;
    sortDirection.value = 'asc';
  }
};

const convertDateToSortable = (dateStr) => {
  if (!dateStr) return '';
  const [day, month, year] = dateStr.split('/');
  return `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`;
};

const abrirDetalhes = (item) => {
  itemSelecionado.value = item;
  dialogDetalhes.value = true;
};

const exportarCSV = () => {
  const headers = [
    'ID',
    'ID Contrato',
    'Razão',
    'Bairro',
    'CEP',
    'Contrato',
    'Data Ativação',
    'Data Cancelamento',
    'Motivo Cancelamento',
    'Obs Cancelamento'
  ];

  const rows = filteredData.value.map(item => [
    item.id,
    item.id_vd_contrato,
    item.razao,
    item.bairro,
    formatCEP(item.cep),
    item.contrato,
    item.data_ativacao,
    item.data_cancelamento,
    item.motivo_cancelamento,
    item.obs_cancelamento
  ]);

  let csvContent = '\uFEFF'; 
  csvContent += headers.join(';') + '\n';
  
  rows.forEach(row => {
    csvContent += row.map(cell => {
      const cellStr = cell?.toString() || '';
      return `"${cellStr.replace(/"/g, '""')}"`;
    }).join(';') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_cancelamentos_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const formatCEP = (cep) => {
  if (!cep) return '';
  const cleaned = cep.toString().replace(/\D/g, '');
  if (cleaned.length === 8) {
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return cep;
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

watch([searchQuery, dateFrom, dateTo], () => {
  currentPage.value = 1;
});

watch(itemsPerPage, () => {
  currentPage.value = 1;
});

const fetchRelatorio = async () => {
  try {
    const response = await relatorioCancelamentos();
    listaRelatorio.value = response.data.data;
  } catch (error) {
    console.error('Erro ao buscar relatório de cancelamentos:', error);
  }
};

onBeforeMount(() => {
  fetchRelatorio();
});
</script>

<style scoped>
.contrato-card {
  max-width: 1400px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
}

.stats-row {
  border-bottom: 1px solid #e0e0e0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.7rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.search-wrapper {
  padding: 16px 20px;
  background: #fafafa;
}

.search-container {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 4px 12px;
  transition: all 0.3s ease;
  height: 40px;
}

.search-container:focus-within {
  border-color: #b22222;
  box-shadow: 0 0 0 2px rgba(178, 34, 34, 0.1);
}

.search-icon {
  color: #757575;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: #333;
  background: transparent;
  height: 100%;
}

.search-input::placeholder {
  color: #999;
}

.clear-icon {
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.clear-icon:hover {
  color: #b22222;
}

.date-input-container {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 4px 12px;
  transition: all 0.3s ease;
  height: 40px;
}

.date-input-container:focus-within {
  border-color: #b22222;
  box-shadow: 0 0 0 2px rgba(178, 34, 34, 0.1);
}

.date-icon {
  color: #757575;
  margin-right: 8px;
  flex-shrink: 0;
}

.date-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: #333;
  background: transparent;
  height: 100%;
  font-family: inherit;
  cursor: pointer;
}

.date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.date-input::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

.results-info {
  border-bottom: 1px solid #e0e0e0;
}

.table-wrapper {
  max-height: 600px;
  overflow-x: auto;
  overflow-y: auto;
  position: relative;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
  min-width: 1200px;
}

.custom-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.custom-table th {
  background-color: #f5f5f5;
  color: #444444;
  font-weight: 600;
  padding: 12px 10px;
  white-space: nowrap;
  font-size: 0.75rem;
  text-align: left;
  border-bottom: 2px solid #dadada;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.custom-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.custom-table th.sortable:hover {
  background-color: #eeeeee;
}

.custom-table td {
  padding: 10px 10px;
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap;
  font-size: 0.75rem;
  background-color: #fff;
  vertical-align: middle;
}

.custom-table .razao-column {
  min-width: 180px;
  white-space: normal;
  word-break: break-word;
}

.custom-table .obs-column {
  min-width: 200px;
  white-space: normal;
  word-break: break-word;
  max-width: 250px;
}

.custom-table tbody tr:nth-child(even) td {
  background-color: #f9f9f9;
}

.custom-table tbody tr.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.custom-table tbody tr.clickable-row:hover td {
  background-color: rgba(178, 34, 34, 0.05) !important;
}

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
  order: 2;
}

:deep(.v-pagination) {
  order: 1;
  
}

:deep(.v-pagination__item--is-active) {
  color: #b22222 !important;
  background-color: #ffffff00 !important;
}

:deep(.v-pagination__item) {
  min-width: 32px;
  height: 32px;
  
}

.detail-item {
  margin-bottom: 16px;
}

.detail-label {
  font-size: 0.7rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 500;
}

.table-wrapper::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}

@media (max-width: 960px) {
  .search-wrapper {
    padding: 12px;
  }
  
  .pagination-wrapper {
    flex-direction: column;
    gap: 12px;
  }
  
  .pagination-info {
    order: 1;
  }
  
  :deep(.v-pagination) {
    order: 2;
  }
}


/* Adicione ao final do style scoped existente */

.detail-section {
  background: white;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f5f5f5;
}

.section-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item {
  margin-bottom: 0;
}

.detail-label {
  font-size: 0.7rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}

.detail-value {
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 500;
  line-height: 1.4;
}

.tempo-ativo-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 8px;
  border-left: 4px solid #2196f3;
  margin-top: 8px;
}

.tempo-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tempo-label {
  font-size: 0.7rem;
  color: #1565c0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tempo-value {
  font-size: 1rem;
  color: #0d47a1;
  font-weight: 700;
}

.obs-box {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  font-size: 0.9rem;
  color: #333;
  line-height: 1.6;
  margin-top: 6px;
  min-height: 60px;
}

.bg-grey-lighten-4 {
  background-color: #f5f5f5;
}
</style>