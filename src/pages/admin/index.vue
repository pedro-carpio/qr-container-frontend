<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getStats, type AdminStats } from '~/api/admin'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-guard'] })

const loading = ref(true)
const err = ref('')
const stats = ref<AdminStats | null>(null)

onMounted(async () => {
  try {
    stats.value = await getStats()
  } catch (e: any) {
    err.value = e.message ?? 'Error al cargar estadísticas'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h2 class="page-title">Estadísticas globales</h2>

    <div v-if="err" class="alert">{{ err }}</div>
    <div v-if="loading" class="state-msg">Cargando…</div>

    <div v-else-if="stats" class="stats-grid">
      <div class="stat-card">
        <span class="stat-val">{{ stats.users.total_users.toLocaleString('es') }}</span>
        <span class="stat-label">Usuarios totales</span>
      </div>
      <div class="stat-card stat-warn">
        <span class="stat-val">{{ stats.users.pending_users.toLocaleString('es') }}</span>
        <span class="stat-label">Pendientes de aprobación</span>
      </div>
      <div class="stat-card stat-ok">
        <span class="stat-val">{{ stats.users.active_users.toLocaleString('es') }}</span>
        <span class="stat-label">Usuarios activos</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">{{ stats.qrs.total_qrs.toLocaleString('es') }}</span>
        <span class="stat-label">QRs registrados</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">{{ stats.qrs.fallback_qrs.toLocaleString('es') }}</span>
        <span class="stat-label">QRs de fallback</span>
      </div>
      <div class="stat-card stat-warn">
        <span class="stat-val">{{ stats.qrs.expired_qrs.toLocaleString('es') }}</span>
        <span class="stat-label">QRs vencidos</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: 1rem; }
.stat-card { display: flex; flex-direction: column; gap: .375rem; padding: 1.25rem 1.5rem; background: var(--surf); border: 1px solid var(--bd); border-radius: var(--r); }
.stat-card.stat-warn { border-color: rgba(245,158,11,.4); }
.stat-card.stat-ok   { border-color: rgba(34,197,94,.3); }
.stat-val   { font-size: 1.875rem; font-weight: 700; line-height: 1; }
.stat-label { font-size: .8125rem; color: var(--mu); }
.stat-card.stat-warn .stat-val { color: #fbbf24; }
.stat-card.stat-ok   .stat-val { color: var(--ok); }
.state-msg { color: var(--mu); font-size: .9375rem; padding: 3rem 0; text-align: center; }
</style>
