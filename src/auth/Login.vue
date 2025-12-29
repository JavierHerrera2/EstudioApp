<script setup>
import { ref } from 'vue'
import { auth, googleProvider } from '../firebase/config'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'

const emit = defineEmits(['cambiarVista'])

const email = ref('')
const password = ref('')

// Login normal con Email
const entrar = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
  } catch (error) {
    alert("Error al entrar: " + error.message)
  }
}

// Login con Google
const entrarConGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider)
    // Al igual que con el email, App.vue detectará al usuario automáticamente
  } catch (error) {
    alert("Error con Google: " + error.message)
  }
}
</script>

<template>
  <div class="auth-card">
    <h2>Iniciar Sesión</h2>
    
    <form @submit.prevent="entrar">
      <input v-model="email" type="email" placeholder="Correo electrónico" required>
      <input v-model="password" type="password" placeholder="Contraseña" required>
      <button type="submit">Entrar</button>
    </form>

    <div class="separador">
      <hr> <span>o</span> <hr>
    </div>

    <button @click="entrarConGoogle" class="btn-google">
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon">
      Entrar con Google
    </button>
    
    <p @click="emit('cambiarVista', 'registro')" class="link-falso">
      ¿No tienes cuenta? Regístrate aquí
    </p>
  </div>
</template>

<style scoped>
.auth-card { 
  max-width: 400px; 
  margin: 20px auto; 
  padding: 30px; 
  background: white;
  border-radius: 12px; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-align: center; 
}
h2 { color: #2c3e50; margin-bottom: 20px; }
input { 
  width: 100%; padding: 12px; margin: 10px 0; 
  border: 1px solid #ddd; border-radius: 6px; 
  display: block; box-sizing: border-box; 
}
button { 
  width: 100%; padding: 12px; 
  background: #2c3e50; color: white; 
  border: none; border-radius: 6px; 
  cursor: pointer; font-weight: bold;
}

.separador { display: flex; align-items: center; margin: 20px 0; color: #bbb; }
.separador hr { flex: 1; border: 0; border-top: 1px solid #eee; }
.separador span { margin: 0 10px; font-size: 0.8rem; }

.btn-google {
  background: white;
  color: #757575;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.btn-google img { width: 18px; }
.btn-google:hover { background: #f1f1f1; }

.link-falso { 
  margin-top: 20px; color: #42b983; 
  cursor: pointer; font-size: 0.9rem;
  text-decoration: underline;
}
</style>