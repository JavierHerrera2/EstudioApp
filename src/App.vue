<script setup>
import { ref, onMounted } from 'vue'
import { auth } from './firebase/config' 
import { onAuthStateChanged, signOut } from 'firebase/auth'

// Importar Calendario para registro local
import { Calendar as VCalendar } from 'v-calendar';
import 'v-calendar/dist/style.css';

// Componentes
import Sidebar from './components/Sidebar.vue'
import Login from './auth/Login.vue'
import Register from './auth/Register.vue'
import Temarios from './views/Temarios.vue'
import DetalleTema from './views/DetalleTema.vue'
import Calendario from './views/Calendario.vue' // <-- Importamos tu nueva vista

// --- ESTADOS ---
const vistaActual = ref('login') 
const usuarioLogueado = ref(null)
const temaSeleccionado = ref(null)
const menuAbierto = ref(false)

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    usuarioLogueado.value = user
    if (user) {
      vistaActual.value = 'temarios' 
    } else {
      vistaActual.value = 'login'
    }
  })
})

// --- NAVEGACIÓN ---
const toggleMenu = () => {
  menuAbierto.value = !menuAbierto.value
}

const cambiarVista = (nuevaVista) => {
  temaSeleccionado.value = null
  vistaActual.value = nuevaVista
  menuAbierto.value = false 
}

const abrirTema = (tema) => {
  temaSeleccionado.value = tema
  vistaActual.value = 'detalle-tema'
}

const volverAInicio = () => {
  temaSeleccionado.value = null
  vistaActual.value = 'temarios'
}

const salir = () => {
  signOut(auth)
  temaSeleccionado.value = null
  vistaActual.value = 'login'
  menuAbierto.value = false
}
</script>

<template>
  <div class="app-container">
    <nav v-if="usuarioLogueado" class="navbar">
      <div class="nav-left">
        <button @click="toggleMenu" class="btn-hamburguesa">☰</button>
        <div class="logo" @click="volverAInicio">BeriStudy</div>
      </div>
      
      <div class="nav-right">
        <span class="user-name">Hola, {{ usuarioLogueado.displayName || 'Estudiante' }}</span>
        <button @click="salir" class="btn-rojo">Salir</button>
      </div>
    </nav>

    <div v-if="usuarioLogueado" :class="['sidebar-overlay', { 'active': menuAbierto }]" @click="toggleMenu">
      <div class="sidebar-wrapper" @click.stop>
        <button class="btn-triangulo" @click="toggleMenu">
          <span class="triangulo-icon">◀</span>
        </button>
        <Sidebar @navegar="cambiarVista" @logout="salir" />
      </div>
    </div>

    <main class="content">
      <template v-if="usuarioLogueado">
        
        <Temarios 
          v-if="vistaActual === 'temarios'" 
          :user="usuarioLogueado" 
          @seleccionarTema="abrirTema" 
        />
        
        <Calendario 
          v-else-if="vistaActual === 'calendario'" 
        />
        
        <DetalleTema 
          v-else-if="vistaActual === 'detalle-tema'" 
          :tema="temaSeleccionado" 
          @volver="volverAInicio"
        />

        <div v-else class="placeholder-section">
          <div class="card-working">
            <span class="emoji-animado">🛠️</span>
            <h2>Sección de {{ vistaActual.toUpperCase() }}</h2>
            <p>Estamos puliendo los últimos detalles de esta funcionalidad para que tu experiencia de estudio sea increíble.</p>
            <p class="subtext">¡Muy pronto estará disponible en tu TFG!</p>
            <button @click="volverAInicio" class="btn-regresar">Ir a Mis Temarios</button>
          </div>
        </div>

      </template>

      <template v-else>
        <Login v-if="vistaActual === 'login'" @cambiarVista="(v) => vistaActual = v" />
        <Register v-if="vistaActual === 'registro'" @cambiarVista="(v) => vistaActual = v" />
      </template>
    </main>
  </div>
</template>

<style scoped>
/* (Mantenemos tus estilos exactamente igual que en tu código) */
.navbar { 
  display: flex; justify-content: space-between; align-items: center; 
  background: #2c3e50; color: white; padding: 15px 30px; 
  position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.nav-left { display: flex; align-items: center; gap: 15px; }
.btn-hamburguesa { background: none; border: none; color: white; font-size: 1.6rem; cursor: pointer; }
.logo { font-size: 1.5rem; font-weight: bold; cursor: pointer; }

.sidebar-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.4); z-index: 200;
  opacity: 0; pointer-events: none; transition: 0.3s ease;
}
.sidebar-overlay.active { opacity: 1; pointer-events: auto; }

.sidebar-wrapper {
  width: 280px; height: 100%; background: #1a202c;
  transform: translateX(-100%); transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.sidebar-overlay.active .sidebar-wrapper { transform: translateX(0); }

.btn-triangulo {
  position: absolute;
  right: -25px;
  top: 50%;
  transform: translateY(-50%);
  width: 25px;
  height: 50px;
  background: #1a202c;
  border: none;
  border-radius: 0 10px 10px 0;
  color: #42b883;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 4px 0 8px rgba(0,0,0,0.2);
}

.triangulo-icon { font-size: 0.8rem; }

.content { padding: 30px 20px; max-width: 1200px; margin: auto; }

.placeholder-section { display: flex; align-items: center; justify-content: center; height: 70vh; }
.card-working { 
  text-align: center; background: white; padding: 40px; border-radius: 20px; 
  box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 450px;
}
.emoji-animado { font-size: 3.5rem; display: block; margin-bottom: 15px; }
.btn-regresar { margin-top: 20px; padding: 10px 25px; background: #42b883; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }

.btn-rojo { background: #ff5252; border: none; padding: 8px 16px; border-radius: 6px; color: white; cursor: pointer; font-weight: 600; }
.user-name { margin-right: 15px; font-size: 0.9rem; color: #ecf0f1; }
</style>