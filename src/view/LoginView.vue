<script setup lang="ts">
import { ref } from 'vue'
import { authService } from '@/services/authentication/authService'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'

const email = ref('')
const password = ref('')
const errorMsg = ref('')

const router = useRouter()
const authStore = useAuthStore()

const toast = useToast()

const iniciarSesion = async () => {
    errorMsg.value = '' // Limpiamos errores previos

    try {
      const data = await authService.login(email.value, password.value)
      console.log('Token:', data.access_token)
      //localStorage.setItem('token', data.access_token)
      authStore.setToken(data.access_token)
      router.push({name: 'dashboard'}) // Redirige al dashboard
      toast.info('Sesión iniciada correctamente')

    } catch (error) {
        if (error instanceof Error) {
        errorMsg.value = error.message // Acá TS ya sabe que .message existe
      } else {
        // Por si el error fue algo rarísimo (ej: throw "Hola")
        errorMsg.value = 'Ocurrió un error inesperado.'
      }
    }
}
</script>

<template>
  <div class="w-full min-h-screen flex items-center justify-center bg-gray-100">
    
    <div class="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-800">Bienvenido</h2>
        <p class="text-gray-500 mt-2">Ingresa a tu cuenta del CRM</p>
      </div>

      <form @submit.prevent="iniciarSesion" class="space-y-6">
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            v-model="email" 
            type="email" 
            required
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="nahuel@tuempresa.com"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input 
            v-model="password" 
            type="password" 
            required
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="••••••••"
          >
        </div>

        <div v-if="errorMsg" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
          {{ errorMsg }}
        </div>

        <button 
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow transition duration-200"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  </div>
</template>