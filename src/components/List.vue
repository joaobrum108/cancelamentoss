<template>
  <v-container fluid class="pa-9">
    <v-card class="contrato-card elevation-2">
      <div>
        <v-card-title class="text-h6 font-weight-bold pa-4" style="background-color: #b22222; color: white;">
          Relatório de Cancelamentos
        </v-card-title>
      </div>

      <v-row class="search-wrapper" align="center" no-gutters>

        <v-col cols="12" md="8" lg="7" class="pb-3 pb-md-0">
          <div class="search-container">
            <v-icon icon="mdi-magnify" size="small" class="search-icon"></v-icon>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Buscar por razão, bairro, CEP..." 
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

        <v-col cols="6" md="2" lg="2" class="pr-1 pl-0 pr-md-2">
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

        <v-col cols="6" md="2" lg="2" class="pl-1 pl-md-2">
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
    
        
      </v-row>

      <v-divider></v-divider>
   
      <div class="results-info pa-3" style="background-color: #f8f9fa;">
        <span class="text-caption" style="color: #666;">
          {{ filteredData.length }} resultado(s) encontrado(s)
          <span v-if="searchQuery"> para "{{ searchQuery }}"</span>
        </span>
      </div>

      <div class="table-wrapper">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Id Contrato</th>
              <th>Razão</th>
              <th>Bairro</th>
              <th>Cep</th>
              <th>Status</th>
              <th>Contrato</th>
              <th>Data Ativação</th>
              <th>Data Cancelamento</th>
              <th>Data Acesso Desativado</th>
              <th>Motivo Cancelamento</th>
              <th>Obs Cancelamento</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, index) in paginatedData" :key="`row-${index}-${data.id}`">
              <td>{{ data.id }}</td>
              <td>{{ data.id_vd_contrato }}</td>
              <td class="razao-column">{{ data.razao }}</td>
              <td>{{ data.bairro }}</td>
              <td>{{ formatCEP(data.cep) }}</td>
              <td>
                <v-chip 
                  :color="getStatusColor(data.status)"
                  size="x-small"
                  label
                >
                  {{ data.status }}
                </v-chip>
              </td>
              <td>{{ data.contrato }}</td>
              <td>{{ (data.data_ativacao) }}</td>
              <td>{{ (data.data_cancelamento) }}</td>
              <td>{{ (data.data_acesso_desativado) }}</td>
              <td>{{ data.motivo_cancelamento }}</td>
              <td class="obs-column">{{ truncateText(data.obs_cancelamento, 50) }}</td>
            </tr>
            <tr v-if="paginatedData.length === 0">
              <td colspan="12" class="text-center py-8" style="color: #999;">
                Nenhum resultado encontrado
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
          color="#db0e35"
        ></v-pagination>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onBeforeMount, watch } from 'vue';
import { relatorioCancelamentos } from '../services/api-cancelamentos';

const listaRelatorio = ref([]);
const currentPage = ref(1);
const itemsPerPage = 50;
const searchQuery = ref('');
const dateFrom = ref('');
const dateTo = ref('');
const statusFilter = ref('');

const filteredData = computed(() => {
  let filtered = listaRelatorio.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(item => {
      return (
        item.razao?.toLowerCase().includes(query) ||
        item.bairro?.toLowerCase().includes(query) ||
        item.cep?.toLowerCase().includes(query) ||
        item.status?.toLowerCase().includes(query) ||
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
  
  return filtered;
});
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredData.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / itemsPerPage);
});

const totalItems = computed(() => filteredData.value.length);

const startItem = computed(() => {
  if (filteredData.value.length === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage + 1;
});

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage;
  return end > totalItems.value ? totalItems.value : end;
});

const clearSearch = () => {
  searchQuery.value = '';
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

const getStatusColor = (status) => {
  const statusLower = status?.toLowerCase();
  switch(statusLower) {
    case 'cancelado': return '#db0e35';
    case 'ativo': return '#4caf50';
    case 'pendente': return '#ff9800';
    case 'suspenso': return '#9e9e9e';
    default: return '#757575';
  }
};

watch([searchQuery, dateFrom, dateTo, statusFilter], () => {
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
  border-color: #db0e35;
  box-shadow: 0 0 0 2px rgba(219, 14, 53, 0.1);
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
  color: #db0e35;
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
  border-color: #db0e35;
  box-shadow: 0 0 0 2px rgba(219, 14, 53, 0.1);
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

.date-input:invalid {
  color: #999;
}

.results-info {
  border-bottom: 1px solid #e0e0e0;
}

.table-wrapper {
  max-height: 480px;
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

.custom-table tbody tr:hover td {
  background-color: rgba(219, 14, 53, 0.05);
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

:deep(.v-pagination .v-pagination__item--is-active) {
  background-color: #f0f0f0 !important;
  color: white !important;
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
</style>