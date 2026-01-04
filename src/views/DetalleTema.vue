<script setup>
import { ref } from 'vue'

const props = defineProps(['tema'])
const emit = defineEmits(['volver'])

const subiendo = ref(false)
const archivoSeleccionado = ref(null)

const seleccionarArchivo = (e) => {
  archivoSeleccionado.value = e.target.files[0]
}

const subirPDF = async () => {
  if (!archivoSeleccionado.value) return;
  
  // Simulamos la subida para que veas cómo queda la interfaz
  subiendo.value = true;
  
  console.log("Subida pausada hasta tener el Hosting listo.");
  
  // Simulamos un retraso de 1 segundo y avisamos
  setTimeout(() => {
    alert("Funcionalidad en pausa: Pendiente de configuración de Hosting/CORS");
    subiendo.value = false;
    archivoSeleccionado.value = null;
  }, 1000);

  /* TODO: Activar cuando hagamos el hosting
    Aquí irá la lógica de sRef, uploadBytesResumable y updateDoc
  */
}
</script>

<template>
  <div class="detalle-container">
    <button @click="emit('volver')" class="btn-volver">← Volver a mis temas</button>
    
    <div class="header-tema">
      <h1>{{ tema.nombre }}</h1>
      <span class="badge">Unidad de Estudio</span>
    </div>

    <section class="upload-section">
      <h3>Subir nuevo material (PDF)</h3>
      <div class="drop-zone">
        <input 
          type="file" 
          @change="seleccionarArchivo" 
          accept=".pdf" 
          class="input-file"
        >
        <button 
          @click="subirPDF" 
          :disabled="!archivoSeleccionado || subiendo"
          class="btn-subir"
        >
          {{ subiendo ? 'Conectando...' : 'Subir a la nube' }}
        </button>
      </div>
      <p v-if="archivoSeleccionado" class="info-archivo">
        Archivo listo: <strong>{{ archivoSeleccionado.name }}</strong>
      </p>
    </section>

    <section class="lista-archivos">
      <h3>Documentos en esta unidad</h3>
      <div v-if="tema.archivos && tema.archivos.length > 0" class="grid-archivos">
        <a 
          v-for="file in tema.archivos" 
          :key="file.url" 
          :href="file.url" 
          target="_blank" 
          class="file-card"
        >
          <span class="file-icon">📕</span>
          <span class="file-name">{{ file.nombre }}</span>
        </a>
      </div>
      <p v-else class="empty">Aún no hay archivos en este tema.</p>
    </section>
  </div>
</template>

<style scoped>
.detalle-container { padding: 20px; max-width: 800px; margin: 0 auto; }
.btn-volver { background: none; border: none; color: #42b883; cursor: pointer; font-weight: bold; margin-bottom: 20px; }
.header-tema { margin-bottom: 30px; }
.badge { background: #42b883; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; }

.upload-section { background: #f8fafc; padding: 25px; border-radius: 12px; border: 2px dashed #e2e8f0; margin-bottom: 30px; }
.drop-zone { display: flex; gap: 15px; align-items: center; margin-top: 15px; flex-wrap: wrap; }
.info-archivo { margin-top: 10px; font-size: 0.85rem; color: #4a5568; }

.btn-subir {
  background-color: #42b883;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
}
.btn-subir:disabled { background-color: #ccc; cursor: not-allowed; }

.grid-archivos { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
.file-card { 
  display: flex; align-items: center; gap: 10px; padding: 15px; 
  background: white; border-radius: 8px; border: 1px solid #eee;
  text-decoration: none; color: #2d3748; transition: 0.2s;
}
.file-card:hover { border-color: #42b883; background: #f9fffb; transform: translateY(-2px); }
.file-icon { font-size: 1.5rem; }
.file-name { font-size: 0.9rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.empty { color: #a0aec0; font-style: italic; margin-top: 10px; }
</style>