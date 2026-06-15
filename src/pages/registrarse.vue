<script setup lang="ts">
import { ref } from 'vue'
import { signup, login } from '~/api/auth'
import { setAuth } from '~/stores/auth'

definePageMeta({ middleware: ['guest'] })

const router = useRouter()
const email = ref('')
const pw = ref('')
const err = ref('')
const busy = ref(false)

async function go() {
  err.value = ''
  if (pw.value.length < 8) {
    err.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }
  busy.value = true
  try {
    await signup(email.value, pw.value)
    const data = await login(email.value, pw.value)
    setAuth(data.access_token, data.refresh_token)
    router.push('/iniciar')
  } catch (e: any) {
    err.value = e.message ?? 'Error inesperado'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="card">
      <h1>Crear cuenta</h1>
      <p class="sub">Empieza a gestionar tus QRs</p>
      <div v-if="err" class="alert">{{ err }}</div>
      <form @submit.prevent="go">
        <div class="field">
          <label for="email">Correo electrónico</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="tu@email.com"
            required
          />
        </div>
        <div class="field">
          <label for="pw">Contraseña</label>
          <input
            id="pw"
            v-model="pw"
            type="password"
            autocomplete="new-password"
            required
          />
          <p class="hint">Mínimo 8 caracteres</p>
        </div>
        <div class="btn-wrap">
          <button class="btn btn-p btn-full" :disabled="busy">
            <span v-if="busy" class="spin" />
            <span v-else>Crear cuenta</span>
          </button>
        </div>
      </form>
      <p class="foot">
        <NuxtLink to="/entrar">¿Ya tienes cuenta? Entra</NuxtLink>
      </p>
    </div>
  </div>
</template>
