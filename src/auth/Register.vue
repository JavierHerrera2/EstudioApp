<script setup>
import { ref } from 'vue'
import { auth } from '../firebase/config'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'

const emit = defineEmits(['cambiarVista'])

const email = ref('')
const password = ref('')
const username = ref('')

const registrar = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    await updateProfile(userCredential.user, { 
      displayName: username.value 
    })
    alert("¡Cuenta creada con éxito, " + username.value + "!")
  } catch (error) {
    alert("Error al registrar: " + error.message)
  }
}
</script>

<template>
  <div class="auth-card">
    <h2>Crear Cuenta</h2>
    <form @submit.prevent="registrar">
      <input v-model="username" type="text" placeholder="Nombre de usuario" required>
      <input v-model="email" type="email" placeholder="Correo electrónico" required>
      <input v-model="password" type="password" placeholder="Contraseña" required>
      <button type="submit" class="btn-principal">Registrarse</button>
    </form>
    
    <p @click="emit('cambiarVista', 'login')" class="link-falso">
      ¿Ya tienes cuenta? Inicia sesión aquí
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
.btn-principal { 
  width: 100%; padding: 12px; 
  background: #42b883; color: white; 
  border: none; border-radius: 6px; 
  cursor: pointer; font-weight: bold;
}
.btn-principal:hover { background: #3aa876; }

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