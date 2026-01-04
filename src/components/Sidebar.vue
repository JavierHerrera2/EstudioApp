<script setup>
const emit = defineEmits(['navegar']);

const menuItems = [
  { id: 'temarios', nombre: 'Temas', icono: '📚' },
  { id: 'calendario', nombre: 'Calendario', icono: '📅' },
  { id: 'pomodoro', nombre: 'Modo Enfoque', icono: '⏱️' },
  { id: 'progreso', nombre: 'Mi Rendimiento', icono: '📊' },
  { id: 'flashcards', nombre: 'Tarjetas de Repaso', icono: '🃏' },
  { id: 'perfil', nombre: 'Mi Perfil', icono: '👤' },
];
</script>

<template>
  <aside class="sidebar">
    <div class="logo">
      <span class="logo-icon">🚀</span>
      <h2>BeriStudy</h2>
    </div>

    <nav class="menu">
      <button 
        v-for="item in menuItems" 
        :key="item.id" 
        @click="$emit('navegar', item.id)"
        class="menu-item"
      >
        <span class="icon">{{ item.icono }}</span>
        <span class="text">{{ item.nombre }}</span>
      </button>
    </nav>

    <div class="footer-sidebar">
      <button class="btn-logout">Cerrar Sesión</button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background-color: #1a202c; /* Azul muy oscuro */
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
}

.logo {
  padding: 30px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #2d3748;
}

.logo-icon { font-size: 1.8rem; }
.logo h2 { font-size: 1.2rem; font-weight: 700; margin: 0; }

.menu {
  flex: 1;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.menu-item {
  width: 100%;
  padding: 15px 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.menu-item:hover {
  background-color: #2d3748;
  color: #42b883; /* El verde de Vue que estamos usando */
}

.icon { font-size: 1.2rem; }
.text { font-size: 1rem; font-weight: 500; }

.footer-sidebar {
  padding: 20px;
  border-top: 1px solid #2d3748;
}

.btn-logout {
  width: 100%;
  padding: 10px;
  background-color: #e53e3e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-logout:hover { background-color: #c53030; }
</style>