<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPending, approveUser, type AdminUser, type UserPage } from '../../api/admin'

const loading  = ref(true)
const err      = ref('')
const users    = ref<AdminUser[]>([])
const page     = ref(1)
const total    = ref(0)
const approving = ref<Set<string>>(new Set())
const LIMIT    = 20

const totalPages = () => Math.max(1, Math.ceil(total.value / LIMIT))

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function load(p = 1) {
  loading.value = true
  err.value = ''
  try {
    const res: UserPage = await getPending(p, LIMIT)
    users.value = res.data
    total.value = res.total
    page.value  = res.page
  } catch (e: any) {
    err.value = e.message ?? 'Error al cargar'
  } finally {
    loading.value = false
  }
}

async function approve(user: AdminUser) {
  approving.value = new Set([...approving.value, user.id])
  try {
    await approveUser(user.id)
    users.value = users.value.filter(u => u.id !== user.id)
    total.value = Math.max(0, total.value - 1)
  } catch (e: any) {
    err.value = e.message ?? 'Error al aprobar'
  } finally {
    const next = new Set(approving.value)
    next.delete(user.id)
    approving.value = next
  }
}

onMounted(() => load())
</script>

<template>
  <div>
    <div class="list-header">
      <h2 class="list-title">Pendientes de aprobación</h2>
      <span class="badge-count" v-if="!loading">{{ total }}</span>
    </div>

    <div v-if="err" class="alert">{{ err }}</div>
    <div v-if="loading" class="state-msg">Cargando…</div>

    <template v-else-if="users.length">
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Email</th>
              <th>Empresa</th>
              <th>Slug</th>
              <th>Registrado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td class="email-cell">{{ u.email }}</td>
              <td class="muted">{{ u.company_name ?? '—' }}</td>
              <td class="muted mono">{{ u.slug ?? '—' }}</td>
              <td class="muted">{{ fmtDate(u.created_at) }}</td>
              <td class="action-cell">
                <button
                  class="btn btn-ok btn-sm"
                  :disabled="approving.has(u.id)"
                  @click="approve(u)"
                >
                  <span v-if="approving.has(u.id)" class="spin spin-sm" />
                  <span v-else>Aprobar</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button class="btn btn-g btn-sm" :disabled="page <= 1" @click="load(page - 1)">
          ← Anterior
        </button>
        <span class="page-info">Página {{ page }} de {{ totalPages() }}</span>
        <button class="btn btn-g btn-sm" :disabled="page >= totalPages()" @click="load(page + 1)">
          Siguiente →
        </button>
      </div>
    </template>

    <div v-else class="state-msg">No hay usuarios pendientes de aprobación.</div>
  </div>
</template>

<style scoped>
.list-header { display: flex; align-items: center; gap: .75rem; margin-bottom: 1.5rem; }
.list-title  { font-size: 1.25rem; font-weight: 700; }
.badge-count {
  background: rgba(245,158,11,.15); color: #fbbf24;
  font-size: .75rem; font-weight: 700;
  padding: .1rem .5rem; border-radius: 999px;
}

.table-wrap { overflow-x: auto; border: 1px solid var(--bd); border-radius: var(--r); }
.tbl { width: 100%; border-collapse: collapse; font-size: .875rem; }
.tbl th { padding: .75rem 1rem; text-align: left; font-size: .75rem; font-weight: 600; color: var(--mu); border-bottom: 1px solid var(--bd); background: var(--surf); }
.tbl td { padding: .75rem 1rem; border-bottom: 1px solid var(--bd); }
.tbl tbody tr:last-child td { border-bottom: none; }
.tbl tbody tr:hover td { background: var(--surf); }

.email-cell { font-weight: 500; }
.mono { font-family: monospace; font-size: .8125rem; }
.muted { color: var(--mu); }
.action-cell { text-align: right; white-space: nowrap; }

.btn-ok { background: rgba(34,197,94,.15); color: var(--ok); border-color: rgba(34,197,94,.3); }
.btn-ok:hover:not(:disabled) { background: rgba(34,197,94,.25); }
.btn-sm { padding: .375rem .75rem; font-size: .8125rem; }

.spin-sm { width: .8rem; height: .8rem; border: 2px solid rgba(34,197,94,.3); border-top-color: var(--ok); border-radius: 50%; animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.pagination { display: flex; align-items: center; gap: 1rem; margin-top: 1.25rem; }
.page-info  { font-size: .8125rem; color: var(--mu); }

.state-msg { color: var(--mu); font-size: .9375rem; padding: 3rem 0; text-align: center; }
</style>
