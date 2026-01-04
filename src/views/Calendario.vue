<script setup>
import { ref, computed, onMounted } from 'vue'
import { db, auth } from '../firebase/config' 
import { collection, addDoc, query, where, onSnapshot, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore'

// Importación específica para que funcione localmente
import { Calendar as VCalendar } from 'v-calendar';
import 'v-calendar/dist/style.css';

const fechaSeleccionada = ref(new Date())
const nombreEvento = ref('')
const colorSeleccionado = ref('#42b883')
const eventos = ref([])

// Paleta de colores disponibles
const colores = [
  { nombre: 'Verde', hex: '#42b883' },
  { nombre: 'Azul', hex: '#3b82f6' },
  { nombre: 'Morado', hex: '#8b5cf6' },
  { nombre: 'Rosa', hex: '#ec4899' },
  { nombre: 'Rojo', hex: '#ef4444' },
  { nombre: 'Naranja', hex: '#f97316' },
  { nombre: 'Amarillo', hex: '#eab308' },
  { nombre: 'Gris', hex: '#6b7280' },
]

onMounted(() => {
  if (!auth.currentUser) return;

  const q = query(
    collection(db, "eventos"),
    where("userId", "==", auth.currentUser.uid)
  );

  onSnapshot(q, (snapshot) => {
    eventos.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha.toDate()
    }));
  });
});

// Atributos para el calendario (puntos de colores)
const attributes = computed(() => {
  const eventosPorFecha = {};

  eventos.value.forEach(evento => {
    const fechaKey = evento.fecha.toDateString();
    
    if (!eventosPorFecha[fechaKey]) {
      eventosPorFecha[fechaKey] = [];
    }
    eventosPorFecha[fechaKey].push(evento);
  });

  return Object.keys(eventosPorFecha).map(fechaStr => {
    const eventosDelDia = eventosPorFecha[fechaStr];
    const hayPendientes = eventosDelDia.some(e => !e.completada);
    
    return {
      key: fechaStr,
      dot: {
        style: {
          backgroundColor: hayPendientes ? eventosDelDia[0].color : '#d1d5db',
          width: '10px',
          height: '10px',
        }
      },
      dates: new Date(fechaStr),
      popover: { 
        label: `${eventosDelDia.length} tarea(s)` 
      }
    };
  });
});

// Eventos del día seleccionado
const eventosDelDia = computed(() => {
  return eventos.value.filter(evento => 
    evento.fecha.toDateString() === fechaSeleccionada.value.toDateString()
  ).sort((a, b) => a.completada - b.completada);
});

// Función que se ejecuta cuando se hace clic en un día del calendario
const onDayClick = (day) => {
  fechaSeleccionada.value = day.date;
}

const guardarEvento = async () => {
  if (!nombreEvento.value || !auth.currentUser) return;
  try {
    await addDoc(collection(db, "eventos"), {
      nombre: nombreEvento.value,
      fecha: Timestamp.fromDate(fechaSeleccionada.value),
      color: colorSeleccionado.value,
      completada: false,
      userId: auth.currentUser.uid
    });
    nombreEvento.value = '';
  } catch (e) {
    console.error("Error: ", e);
  }
}

const toggleCompletada = async (evento) => {
  try {
    const eventoRef = doc(db, "eventos", evento.id);
    await updateDoc(eventoRef, {
      completada: !evento.completada
    });
  } catch (e) {
    console.error("Error: ", e);
  }
}

const eliminarEvento = async (eventoId) => {
  if (!confirm('¿Seguro que quieres eliminar esta tarea?')) return;
  try {
    await deleteDoc(doc(db, "eventos", eventoId));
  } catch (e) {
    console.error("Error: ", e);
  }
}
</script>

<template>
  <div class="calendario-view">
    <div class="header-section">
      <h1>📅 Mi Agenda de Estudio</h1>
      <p>Haz clic en cualquier día del calendario para ver y añadir tareas.</p>
    </div>
    
    <div class="grid-cal">
      <div class="card">
        <VCalendar 
          expanded 
          :attributes="attributes"
          @dayclick="onDayClick"
        />
      </div>

      <div class="panel-derecha">
        <!-- Formulario para agregar tarea -->
        <div class="card form-evento">
          <h3>📝 Añadir tarea</h3>
          <p class="fecha-seleccionada">
            {{ fechaSeleccionada.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
          </p>
          
          <input 
            v-model="nombreEvento" 
            type="text" 
            placeholder="Ej: Examen de Historia"
            @keyup.enter="guardarEvento"
          >

          <!-- Paleta de colores -->
          <div class="paleta-colores">
            <label>Color:</label>
            <div class="colores-grid">
              <button 
                v-for="color in colores" 
                :key="color.hex"
                :class="['color-btn', { activo: colorSeleccionado === color.hex }]"
                :style="{ backgroundColor: color.hex }"
                @click="colorSeleccionado = color.hex"
                :title="color.nombre"
              >
                <span v-if="colorSeleccionado === color.hex">✓</span>
              </button>
            </div>
          </div>

          <button @click="guardarEvento" class="btn-guardar">
            + Añadir Tarea
          </button>
        </div>

        <!-- Lista de tareas del día -->
        <div class="card tareas-dia">
          <h3>🗂️ Tareas del día</h3>
          <p class="fecha-tareas">
            {{ fechaSeleccionada.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) }}
          </p>
          
          <div v-if="eventosDelDia.length === 0" class="sin-tareas">
            <p>No hay tareas para este día</p>
            <small>Añade una tarea usando el formulario de arriba</small>
          </div>

          <div v-else class="lista-tareas">
            <div 
              v-for="evento in eventosDelDia" 
              :key="evento.id"
              :class="['tarea-item', { completada: evento.completada }]"
            >
              <div class="tarea-contenido">
                <div 
                  class="color-indicator" 
                  :style="{ backgroundColor: evento.color }"
                ></div>
                
                <div class="tarea-info">
                  <span class="tarea-nombre">{{ evento.nombre }}</span>
                </div>
              </div>

              <div class="tarea-acciones">
                <button 
                  @click="toggleCompletada(evento)"
                  class="btn-icono"
                  :title="evento.completada ? 'Marcar como pendiente' : 'Marcar como completada'"
                >
                  {{ evento.completada ? '↩️' : '✓' }}
                </button>
                <button 
                  @click="eliminarEvento(evento.id)"
                  class="btn-icono btn-eliminar"
                  title="Eliminar tarea"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendario-view { 
  padding: 10px; 
  animation: fadeIn 0.5s ease; 
  max-width: 1400px;
  margin: 0 auto;
}

.header-section { 
  margin-bottom: 20px; 
  text-align: center;
}

.header-section h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 5px;
}

.header-section p {
  color: #718096;
}

.grid-cal { 
  display: grid; 
  grid-template-columns: 1fr 400px; 
  gap: 25px; 
}

.panel-derecha {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card { 
  background: white; 
  padding: 25px; 
  border-radius: 16px; 
  box-shadow: 0 10px 30px rgba(0,0,0,0.08); 
}

.form-evento h3 { 
  color: #2c3e50; 
  font-size: 1.2rem; 
  margin-bottom: 5px;
}

.fecha-seleccionada {
  color: #42b883;
  font-size: 0.9rem;
  margin-bottom: 15px;
  font-weight: 500;
  text-transform: capitalize;
}

.form-evento input { 
  width: 100%; 
  padding: 12px; 
  margin-bottom: 15px; 
  border: 2px solid #edf2f7; 
  border-radius: 10px;
  outline: none;
  transition: border 0.3s;
  font-size: 0.95rem;
}

.form-evento input:focus { 
  border-color: #42b883; 
}

/* Paleta de colores */
.paleta-colores {
  margin-bottom: 15px;
}

.paleta-colores label {
  display: block;
  color: #4a5568;
  font-size: 0.9rem;
  margin-bottom: 10px;
  font-weight: 500;
}

.colores-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.color-btn {
  width: 100%;
  aspect-ratio: 1;
  border: 3px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.color-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.color-btn.activo {
  border-color: #2c3e50;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.color-btn span {
  color: white;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.btn-guardar { 
  width: 100%; 
  padding: 12px; 
  background: #2c3e50; 
  color: white; 
  border: none; 
  border-radius: 10px; 
  cursor: pointer; 
  font-weight: bold;
  transition: background 0.3s;
  font-size: 0.95rem;
}

.btn-guardar:hover { 
  background: #42b883; 
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

/* Tareas del día */
.tareas-dia h3 {
  color: #2c3e50; 
  font-size: 1.2rem; 
  margin-bottom: 5px;
}

.fecha-tareas {
  color: #718096;
  font-size: 0.85rem;
  margin-bottom: 15px;
  text-transform: capitalize;
  font-weight: 500;
}

.sin-tareas {
  text-align: center;
  padding: 30px 20px;
  color: #a0aec0;
}

.sin-tareas p {
  font-size: 1rem;
  margin-bottom: 5px;
}

.sin-tareas small {
  font-size: 0.85rem;
}

.lista-tareas {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tarea-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f7fafc;
  border-radius: 10px;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.tarea-item:hover {
  background: #edf2f7;
  border-color: #e2e8f0;
}

.tarea-item.completada {
  opacity: 0.6;
  background: #f0fdf4;
}

.tarea-item.completada .tarea-nombre {
  text-decoration: line-through;
  color: #9ca3af;
}

.tarea-contenido {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tarea-info {
  flex: 1;
}

.tarea-nombre {
  color: #2d3748;
  font-weight: 500;
  font-size: 0.95rem;
}

.tarea-acciones {
  display: flex;
  gap: 5px;
}

.btn-icono {
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.btn-icono:hover {
  background: #42b883;
  transform: scale(1.1);
}

.btn-eliminar:hover {
  background: #ef4444;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1100px) {
  .grid-cal { 
    grid-template-columns: 1fr; 
  }
  
  .panel-derecha {
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
  }
}
</style>