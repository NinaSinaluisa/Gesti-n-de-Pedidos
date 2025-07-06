

<script setup>
import { ref, onMounted, computed } from 'vue';
import User from '@/apis/User';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { show_alerta } from '@/apis/Api';

// Datos
const users = ref([]);
const searchTerm = ref('');
const filterType = ref('all');
const sortBy = ref('newest');

// Obtener usuarios
const fetchUsers = async () => {
  try {
    const response = await User.fetchUsuarios();
    users.value = response;
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    show_alerta('Error al cargar los usuarios', 'error');
  }
};

// Filtrar usuarios
const filteredUsers = computed(() => {
  let result = [...users.value];
  
  // Filtrar por tipo
  if (filterType.value === 'admin') {
    result = result.filter(user => user.esadmin);
  } else if (filterType.value === 'regular') {
    result = result.filter(user => !user.esadmin);
  }
  
  // Filtrar por término de búsqueda
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    result = result.filter(user => 
      user.nombre.toLowerCase().includes(term) ||
      user.apellido.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.celular.includes(term)
    );
  }
  
  // Ordenar
  if (sortBy.value === 'newest') {
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortBy.value === 'oldest') {
    result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else if (sortBy.value === 'name') {
    result.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }
  
  return result;
});

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Generar PDF
const generatePDF = () => {
  if (filteredUsers.value.length === 0) {
    show_alerta('No hay usuarios para generar el reporte', 'warning');
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'A4'
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES');
  const timeStr = now.toLocaleTimeString('es-ES');
  const totalUsuarios = filteredUsers.value.length;

  // -------------------------------
  // Encabezado
  // -------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(33, 37, 41);
  doc.text('Sistema de Gestión de Usuarios', 105, 15, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(66, 66, 66);
  doc.text('Reporte detallado de usuarios registrados', 105, 22, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(108, 117, 125);
  doc.text(`Fecha: ${dateStr} | Hora: ${timeStr}`, 105, 28, { align: 'center' });

  doc.setDrawColor(200);
  doc.line(15, 32, 195, 32); // línea horizontal

  // -------------------------------
  // Tabla de usuarios
  // -------------------------------
  const headers = [['#', 'Nombre', 'Apellido', 'Email', 'Celular', 'Rol', 'Fecha Registro']];

  const body = filteredUsers.value.map((user, index) => [
    index + 1,
    user.nombre,
    user.apellido,
    user.email,
    user.celular || 'N/A',
    user.esadmin ? 'Administrador' : 'Usuario',
    formatDate(user.created_at)
  ]);

  doc.autoTable({
    head: headers,
    body: body,
    startY: 36,
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [33, 150, 243], // azul
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    bodyStyles: {
      textColor: [51, 51, 51]
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 45 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 }
    },
    margin: { top: 36 }
  });

  // -------------------------------
  // Pie de página
  // -------------------------------
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });

    doc.text(` NewBlesing • Total de usuarios: ${totalUsuarios}`, 15, doc.internal.pageSize.height - 10);
    doc.text(`www.newblesing.com`, 195, doc.internal.pageSize.height - 10, { align: 'right' });
  }

  doc.save(`reporte_usuarios_${now.toISOString().slice(0, 10)}.pdf`);
};

// Cargar datos iniciales
onMounted(fetchUsers);
</script>


<template>
  <div class="report-container">
    <!-- Encabezado -->
    <div class="report-header">
      <div class="header-content">
        <div class="title-section">
          <span class="material-icons">people_alt</span>
          <h1>Reporte de Usuarios</h1>
        </div>
        <button class="export-button" @click="generatePDF">
          <span class="material-icons">picture_as_pdf</span>
          Exportar PDF
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <div class="search-container">
        <span class="material-icons">search</span>
        <input 
          type="text" 
          placeholder="Buscar usuarios..." 
          v-model="searchTerm"
        >
      </div>
      
      <div class="select-filters">
        <select v-model="filterType">
          <option value="all">Todos los usuarios</option>
          <option value="admin">Solo administradores</option>
          <option value="regular">Solo usuarios regulares</option>
        </select>
        
        <select v-model="sortBy">
          <option value="newest">Más recientes primero</option>
          <option value="oldest">Más antiguos primero</option>
          <option value="name">Ordenar por nombre</option>
        </select>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div class="table-container bg-white">
      <div class="table-responsive ">
        <table class="users-table">
          <thead>
            <tr>
              <th class="text-center">Nº</th>
              <th>Usuario</th>
              <th>Contacto</th>
              <th class="text-center">Tipo</th>
              <th class="text-center">Registro</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in filteredUsers" :key="user.id">
              <td class="text-center">{{ index + 1 }}</td>
              <td>
                <div class="user-info">
                  <div class="user-name">{{ user.nombre }} {{ user.apellido }}</div>
                  <div class="user-email">{{ user.email }}</div>
                </div>
              </td>
              <td>
                <div class="contact-info">
                  <div>{{ user.email }}</div>
                  <div class="phone">{{ user.celular || 'Sin teléfono' }}</div>
                </div>
              </td>
              <td class="text-center">
                <span class="user-type" :class="{ 'admin': user.esadmin }">
                  {{ user.esadmin ? 'Admin' : 'Usuario' }}
                </span>
              </td>
              <td class="text-center">{{ formatDate(user.created_at) }}</td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="5" class="empty-message">
                <span class="material-icons">info</span>
                No se encontraron usuarios con los filtros aplicados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pie de página -->
    <div class="report-footer">
      <div class="summary">
        Mostrando {{ filteredUsers.length }} de {{ users.length }} usuarios
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos generales */
.report-container {
  font-family: 'Segoe UI', 'Roboto', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: #333;
}

/* Encabezado */
.report-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-section h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.title-section .material-icons {
  font-size: 2rem;
  color: #4299e1;
}

.export-button {
  background-color: #e53e3e;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.export-button:hover {
  background-color: #c53030;
}

.export-button .material-icons {
  font-size: 1.125rem;
}

/* Filtros */
.filters-section {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-container {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-container .material-icons {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
}

.search-container input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.search-container input:focus {
  outline: none;
  border-color: #4299e1;
}

.select-filters {
  display: flex;
  gap: 0.75rem;
}

.select-filters select {
  padding: 0.625rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 0.875rem;
  min-width: 200px;
}

/* Tabla */
.table-container {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background-color: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
}

.users-table th {
  padding: 1rem;
  font-weight: 600;
  color: #4a5568;
  text-align: left;
}

.users-table th.text-center {
  text-align: center;
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid #edf2f7;
  vertical-align: middle;
}

.users-table td.text-center {
  text-align: center;
}

.users-table tr:last-child td {
  border-bottom: none;
}

.users-table tr:hover {
  background-color: #f8fafc;
}

/* Contenido de la tabla */
.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.8125rem;
  color: #718096;
}

.contact-info {
  display: flex;
  flex-direction: column;
}

.phone {
  font-size: 0.8125rem;
  color: #718096;
  margin-top: 0.25rem;
}

.user-type {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.user-type.admin {
  background-color: #ebf8ff;
  color: #3182ce;
}

.user-type:not(.admin) {
  background-color: #f0fff4;
  color: #38a169;
}

/* Mensaje vacío */
.empty-message {
  text-align: center;
  padding: 2rem;
  color: #718096;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-message .material-icons {
  font-size: 2rem;
  color: #cbd5e0;
}

/* Pie de página */
.report-footer {
  margin-top: 1.5rem;
  text-align: right;
  color: #718096;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .filters-section {
    flex-direction: column;
  }
  
  .select-filters {
    flex-direction: column;
  }
  
  .select-filters select {
    width: 100%;
  }
  
  .users-table {
    display: block;
    overflow-x: auto;
  }
  
  .users-table th, 
  .users-table td {
    white-space: nowrap;
  }
}
</style>