<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from './firebase/config' 
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'

// IMPORTAMOS LOS COMPONENTES DE AUTH
import Login from './auth/Login.vue'
import Register from './auth/Register.vue'

// --- ESTADOS DE NAVEGACIÓN ---
const vistaActual = ref('inicio') // Puede ser: 'inicio', 'login', 'registro'
const usuarioLogueado = ref(null)

// --- LÓGICA DE TEMAS (Tu código original) ---
const nuevoTema = ref('')
const listaTemas = ref([])

onMounted(() => {
  // Escuchar usuario
  onAuthStateChanged(auth, (user) => {
    usuarioLogueado.value = user
    if (user) vistaActual.value = 'inicio'
  })

  // Escuchar temas en Firestore
  const q = query(collection(db, "temarios"), orderBy("fecha", "desc"));
  onSnapshot(q, (snapshot) => {
    listaTemas.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

const guardarEnFirebase = async () => {
  if (nuevoTema.value.trim() === '') return
  try {
    await addDoc(collection(db, "temarios"), {
      nombre: nuevoTema.value,
      fecha: Date.now()
    });
    nuevoTema.value = '';
  } catch (e) { console.error(e) }
}

const salir = () => {
  signOut(auth)
  vistaActual.value = 'login'
}
</script>

<template>
  <div class="app-container">
    <nav class="navbar">
      <div class="logo" @click="vistaActual = 'inicio'">BeriStudy</div>
      <div class="menu">
        <template v-if="!usuarioLogueado">
          <button @click="vistaActual = 'login'">Entrar</button>
          <button @click="vistaActual = 'registro'">Crear Cuenta</button>
        </template>
        <template v-else>
          <span>Hola, {{ usuarioLogueado.displayName || 'Estudiante' }}</span>
          <button @click="salir" class="btn-rojo">Salir</button>
        </template>
      </div>
    </nav>

    <main class="content">
      
      <div v-if="vistaActual === 'inicio'">
        <h2>Mis Temarios</h2>
        <div class="form" v-if="usuarioLogueado">
          <input v-model="nuevoTema" @keyup.enter="guardarEnFirebase" placeholder="Añadir tema...">
          <button @click="guardarEnFirebase">Añadir</button>
        </div>
        <p v-else>Inicia sesión para poder añadir temas.</p>

        <ul class="lista">
          <li v-for="tema in listaTemas" :key="tema.id">✅ {{ tema.nombre }}</li>
        </ul>
      </div>

      <div v-else-if="vistaActual === 'login'">
      <Login @cambiarVista="(valor) => vistaActual = valor" />
  
  </div>

  <div v-else-if="vistaActual === 'registro'">
    <Register @cambiarVista="(valor) => vistaActual = valor" />
  
  </div>

    </main>
  </div>
</template>

<style scoped>
.navbar { display: flex; justify-content: space-between; background: #2c3e50; color: white; padding: 15px 30px; align-items: center; }
.logo { font-weight: bold; cursor: pointer; }
.menu button { margin-left: 10px; padding: 5px 12px; cursor: pointer; }
.content { padding: 30px; max-width: 600px; margin: auto; }
.lista { list-style: none; padding: 0; }
li { background: #f0f4f8; margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 5px solid #42b883; }
.link { color: #42b883; cursor: pointer; margin-top: 20px; text-decoration: underline; text-align: center; }
.btn-rojo { background: #ff5252; color: white; border: none; border-radius: 4px; }
</style>