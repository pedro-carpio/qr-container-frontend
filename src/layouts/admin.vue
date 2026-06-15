<script setup lang="ts">
import { signOut } from '~/stores/auth'

const router = useRouter()
function out() {
  signOut()
  router.push('/entrar')
}
</script>

<template>
  <div class="admin-wrap">
    <nav class="admin-nav">
      <NuxtLink to="/admin" class="brand">QR<span class="accent">Admin</span></NuxtLink>
      <div class="nav-links">
        <NuxtLink to="/admin" class="nav-link" exact>Stats</NuxtLink>
        <NuxtLink to="/admin/pendientes" class="nav-link">Pendientes</NuxtLink>
        <NuxtLink to="/admin/usuarios" class="nav-link">Usuarios</NuxtLink>
      </div>
      <div class="nav-end">
        <NuxtLink to="/panel" class="btn btn-g btn-sm">Panel</NuxtLink>
        <button class="btn btn-g btn-sm" @click="out">Salir</button>
      </div>
    </nav>

    <main class="admin-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-wrap { display: flex; flex-direction: column; min-height: 100dvh; }

.admin-nav {
  display: flex; align-items: center; gap: 1.5rem;
  padding: 0 1.5rem; height: 3.5rem;
  border-bottom: 1px solid var(--bd);
  background: var(--bg); position: sticky; top: 0; z-index: 10;
  flex-wrap: wrap;
}
.brand { font-size: 1rem; font-weight: 800; text-decoration: none; color: var(--tx); }
.accent { color: #f59e0b; }

.nav-links { display: flex; gap: .25rem; flex: 1; }
.nav-link {
  padding: .375rem .625rem; border-radius: var(--r);
  font-size: .8125rem; font-weight: 500; color: var(--mu);
  text-decoration: none; transition: color .15s, background .15s;
}
.nav-link:hover { color: var(--tx); }
.nav-link.router-link-active { color: var(--tx); background: var(--surf); }

.nav-end { display: flex; gap: .5rem; }
.btn-sm { padding: .375rem .75rem; font-size: .8125rem; }

.admin-main { flex: 1; padding: 2rem 1.5rem; }
</style>
