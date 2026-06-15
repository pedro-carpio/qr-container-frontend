<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { login } from '../api/auth'
import { setAuth, setCompany, setSlug, setLogoUrl, setHasFallback, auth } from '../stores/auth'

const router = useRouter()
const email = ref('')
const pw = ref('')
const err = ref('')
const busy = ref(false)

async function go() {
  err.value = ''
  busy.value = true
  try {
    const data = await login(email.value, pw.value)
    setAuth(data.access_token, data.refresh_token)
    setCompany(data.user.is_fully_registered)
    if (data.user.slug) setSlug(data.user.slug)
    setLogoUrl(data.logo_url)
    setHasFallback(!!data.fallback_qr_string)
    router.push(auth.isAdmin ? '/admin' : auth.hasCompany ? '/panel' : '/iniciar')
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
      <h1>Iniciar sesión</h1>
      <p class="sub">Accede a tu panel de QRs</p>
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
            autocomplete="current-password"
            required
          />
        </div>
        <div class="btn-wrap">
          <button class="btn btn-p btn-full" :disabled="busy">
            <span v-if="busy" class="spin" />
            <span v-else>Entrar</span>
          </button>
        </div>
      </form>
      <p class="foot">
        <RouterLink to="/registrarse">¿Sin cuenta? Regístrate</RouterLink>
      </p>
    </div>
  </div>
</template>
