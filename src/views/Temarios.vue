<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase/config' 
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore'

const props = defineProps(['user'])
const nuevoTema = ref('')
const listaTemas = ref([])
const cargando = ref(true)

// En Temarios.vue, cambia el onMounted un momento por esto:
onMounted(async () => {
  try {
    console.log("Intentando conectar con Firestore...");
    const q = query(collection(db, "temarios"), orderBy("fecha", "desc"));
    onSnapshot(q, (snapshot) => {
      listaTemas.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      cargando.value = false;
      console.log("¡Conexión exitosa! Temas cargados:", listaTemas.value.length);
    }, (error) => {
      console.error("Error en el Snapshot:", error.code, error.message);
    });
  } catch (e) {
    console.error("Error crítico de conexión:", e);
  }
});

const guardarEnFirebase = async () => {
  if (nuevoTema.value.trim() === '') return
  try {
    await addDoc(collection(db, "temarios"), {
      nombre: nuevoTema.value,
      fecha: Date.now(),
      autor: props.user?.displayName || 'Estudiante',
      archivosCount: 0 // Preparado para cuando subamos PDFs
    });
    nuevoTema.value = '';
  } catch (e) { console.error(e) }
}
</script>

<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div>
        <h1>Mis Temarios</h1>
        <p class="subtitle">Gestiona tus materiales de estudio y apuntes</p>
      </div>
      <div class="stats-badge">
        <span class="number">{{ listaTemas.length }}</span>
        <span class="label">Temas totales</span>
      </div>
    </header>

    <section class="action-bar" v-if="user">
      <div class="input-group">
        <span class="icon">➕</span>
        <input 
          v-model="nuevoTema" 
          @keyup.enter="guardarEnFirebase" 
          placeholder="Nombre del nuevo tema (ej: Historia de España...)"
        >
        <button @click="guardarEnFirebase" :disabled="!nuevoTema.trim()">Crear Tema</button>
      </div>
    </section>

    <div v-if="cargando" class="loader">Cargando tus temas...</div>

    <section v-else class="temas-grid">
      <div v-for="tema in listaTemas" :key="tema.id" class="tema-card">
        <div class="card-icon">📚</div>
        <div class="card-content">
          <h3>{{ tema.nombre }}</h3>
          <p class="card-meta">Creado por {{ tema.autor }}</p>
          <div class="card-footer">
            <span class="file-count">📄 {{ tema.archivosCount || 0 }} archivos</span>
            <button class="btn-abrir" @click="$emit('seleccionarTema', tema)">
                Abrir Unidad ➜
    </button>
          </div>
        </div>
      </div>

      <div v-if="listaTemas.length === 0" class="empty-state">
        <p>Aún no tienes temas creados. ¡Empieza creando el primero!</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard { max-width: 1000px; margin: 0 auto; padding: 20px; }

.dashboard-header { 
  display: flex; justify-content: space-between; align-items: center; 
  margin-bottom: 40px; border-bottom: 2px solid #edf2f7; padding-bottom: 20px;
}

h1 { color: #1a202c; margin: 0; font-size: 2rem; }
.subtitle { color: #718096; margin-top: 5px; }

.stats-badge { background: #ebf8f2; color: #38a169; padding: 10px 20px; border-radius: 12px; text-align: center; }
.stats-badge .number { display: block; font-size: 1.5rem; font-weight: bold; }
.stats-badge .label { font-size: 0.8rem; text-transform: uppercase; }

/* Barra de acción moderna */
.action-bar { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 40px; }
.input-group { display: flex; align-items: center; gap: 15px; }
.input-group input { flex: 1; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; font-size: 1rem; outline: none; transition: border 0.2s; }
.input-group input:focus { border-color: #42b883; }
.input-group button { background: #42b883; color: white; border: none; padding: 12px 25px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.input-group button:disabled { background: #cbd5e0; cursor: not-allowed; }

/* Grid de tarjetas */
.temas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; }

.tema-card { 
  background: white; border-radius: 15px; padding: 20px; 
  display: flex; gap: 15px; transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #f0f0f0; cursor: pointer;
}
.tema-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }

.card-icon { font-size: 2rem; background: #f7fafc; padding: 15px; border-radius: 12px; display: flex; align-items: center; }

.card-content { flex: 1; display: flex; flex-direction: column; }
.card-content h3 { margin: 0; color: #2d3748; font-size: 1.1rem; }
.card-meta { color: #a0aec0; font-size: 0.85rem; margin: 5px 0 15px; }

.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
.file-count { font-size: 0.85rem; color: #4a5568; font-weight: 500; }
.btn-abrir { background: none; border: none; color: #42b883; font-weight: bold; cursor: pointer; padding: 0; }

.loader { text-align: center; padding: 50px; color: #a0aec0; font-style: italic; }
</style>