<template>
  <div>
    <h1 class="h3 mb-4 font-weight-semibold">Dashboard</h1>
    
    
    <div class="dashboard-container">
      <!-- Cards de estadísticas -->
      <div class="stats-grid">
        <div v-for="(value, key) in statistics" :key="key" class="stat-card">
          <h3>{{ formatTitle(key) }}</h3>
          <p class="stat-value">{{ value }}</p>
        </div>
      </div>
    
      <!-- Contenedor del gráfico con altura fija -->
      <div class="chart-wrapper">
        <Bar
          v-if="loaded"
          :data="chartData"
          :options="chartOptions"
        />
      </div>
    </div> 
    
    <Calendario></Calendario>

  </div> 
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { Bar } from 'vue-chartjs';
import Calendario from '@/components/admin/Calendario.vue';

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { PublicApi } from "@/apis/Api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


const statistics = ref({
  totalOrders: 0,
  totalProducts: 0,
  totalCategories: 0,
  totalUsers: 0
});

const loaded = ref(false);

// Versión alternativa de chartData
const chartData = ref({
  labels: ['Órdenes', 'Productos', 'Categorías', 'Usuarios'],
  datasets: [{
    label: 'Total',
    data: [],
    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
    borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
    borderWidth: 1,
    barPercentage: 0.5
  }]
});

// Versión alternativa de chartOptions
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  }
};

const formatTitle = (key) => {
  const titles = {
    totalOrders: 'Total Órdenes',
    totalProducts: 'Total Productos',
    totalCategories: 'Total Categorías',
    totalUsers: 'Total Usuarios'
  };
  return titles[key] || key;
};

const fetchStatistics = async () => {
  try {
    const response = await PublicApi.get('/statistics');
    console.log('Datos recibidos:', response.data); // Verificar datos
    statistics.value = response.data;
    
    const newData = [
      response.data.totalOrders,
      response.data.totalProducts,
      response.data.totalCategories,
      response.data.totalUsers
    ];
    console.log('Datos para el gráfico:', newData); // Verificar datos del gráfico
    
    chartData.value.datasets[0].data = newData;
    loaded.value = true;
  } catch (error) {
    console.error('Error:', error);
  }
};

onMounted(() => {
  fetchStatistics();
});




</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 10px;
  color: #666;
  font-size: 1rem;
}

.stat-value {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.chart-container {
  height: 600px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}


</style>
