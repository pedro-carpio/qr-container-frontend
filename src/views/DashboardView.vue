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
      <h1>Panel</h1>
      <p class="sub">Bienvenido a tu panel de QRs</p>
      <div class="btn-wrap">
        <button class="btn btn-g btn-full" @click="out">Cerrar sesión</button>
      </div>
    </div>
  </div>
</template>
