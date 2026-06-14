<script setup lang="ts">
import { signOut } from '../stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

function out() {
  signOut()
  router.push('/entrar')
}
</script>

<template>
  <div class="page">
    <div class="card">
      <div class="icon">⚠</div>
      <h1>Pago pendiente</h1>
      <p class="sub">No hemos podido verificar tu último pago. Contacta a soporte para continuar.</p>
      <div class="btn-wrap">
        <button class="btn btn-g btn-full" @click="out">Cerrar sesión</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon {
  font-size: 2rem; margin-bottom: .75rem; color: #f59e0b;
}
</style>
