<script setup>
import { ref, onMounted } from 'vue'
import { db } from './firebase/config' 
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore'

const nuevoTema = ref('')
const listaTemas = ref([])

// 1. Escuchar cambios en tiempo real al cargar la página
onMounted(() => {
  const q = query(collection(db, "temarios"), orderBy("fecha", "desc"));
  
  onSnapshot(q, (snapshot) => {
    listaTemas.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  })
})

// 2. Función para guardar
const guardarEnFirebase = async () => {
  if (nuevoTema.value.trim() === '') return
  
  try {
    await addDoc(collection(db, "temarios"), {
      nombre: nuevoTema.value,
      fecha: Date.now() // Usamos timestamp para ordenar mejor
    });
    nuevoTema.value = '';
  } catch (e) {
    alert("Error: Asegúrate de haber activado Firestore en la consola");
    console.error(e);
  }
}
</script>

<template>
  <div class="test-container">
    <h2>🚀 Prueba de Sincronización</h2>
    
    <div class="form">
      <input v-model="nuevoTema" @keyup.enter="guardarEnFirebase" placeholder="Escribe un tema...">
      <button @click="guardarEnFirebase">Añadir a Firebase</button>
    </div>

    <ul class="lista">
      <li v-for="tema in listaTemas" :key="tema.id">
        ✅ {{ tema.nombre }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.test-container { padding: 20px; font-family: sans-serif; }
.form { margin-bottom: 20px; }
.lista { list-style: none; padding: 0; }
li { background: #e3f2fd; margin: 5px 0; padding: 10px; border-radius: 4px; border-left: 4px solid #2196f3; }
</style>