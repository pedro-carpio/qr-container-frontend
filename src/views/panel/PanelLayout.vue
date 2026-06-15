<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { signOut, auth } from '../../stores/auth'

const router = useRouter()
function out() {
  signOut()
  router.push('/entrar')
}
</script>

<template>
  <div class="panel-wrap">
    <nav class="panel-nav">
      <RouterLink to="/" class="brand">QR<span class="accent">Panel</span></RouterLink>
      <div class="nav-links">
        <RouterLink to="/panel" class="nav-link">Mis QRs</RouterLink>
        <RouterLink to="/panel/nuevo" class="nav-link">Nuevo QR</RouterLink>
        <RouterLink to="/panel/qr-abierto" class="nav-link">QR Abierto</RouterLink>
        <RouterLink to="/panel/venciendo" class="nav-link">Venciendo</RouterLink>
        <RouterLink to="/panel/logo" class="nav-link">Logo</RouterLink>
      </div>
      <div class="nav-end">
        <RouterLink v-if="auth.isAdmin" to="/admin" class="btn btn-g btn-sm">Admin</RouterLink>
        <button class="btn btn-g btn-sm" @click="out">Salir</button>
      </div>
    </nav>

    <main class="panel-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.panel-wrap { display: flex; flex-direction: column; min-height: 100dvh; }

.panel-nav {
  display: flex; align-items: center; gap: 1.5rem;
  padding: 0 1.5rem; height: 3.5rem;
  border-bottom: 1px solid var(--bd);
  background: var(--bg); position: sticky; top: 0; z-index: 10;
}
.brand { font-size: 1rem; font-weight: 800; text-decoration: none; color: var(--tx); flex-shrink: 0; }
.accent { color: var(--ac); }

.nav-links { display: flex; gap: .25rem; flex: 1; min-width: 0; }
.nav-link {
  padding: .375rem .625rem; border-radius: var(--r);
  font-size: .8125rem; font-weight: 500; color: var(--mu);
  text-decoration: none; transition: color .15s, background .15s;
  white-space: nowrap;
}
.nav-link:hover { color: var(--tx); }
.nav-link.router-link-exact-active { color: var(--tx); background: var(--surf); }

.nav-end { display: flex; gap: .5rem; flex-shrink: 0; }
.btn-sm { padding: .375rem .75rem; font-size: .8125rem; }

.panel-main { flex: 1; padding: 2rem 1.5rem; }

@media (max-width: 640px) {
  .panel-nav { gap: .5rem; padding: 0 .75rem; }
  .nav-links {
    overflow-x: auto;
    flex-wrap: nowrap;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .nav-links::-webkit-scrollbar { display: none; }
  .nav-link { padding: .3rem .5rem; }
  .panel-main { padding: 1.25rem 1rem; }
}
</style>
