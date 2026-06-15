<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUsers, type AdminUser, type UserPage } from '~/api/admin'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin-guard'] })

const router = useRouter()
const loading = ref(true)
const err     = ref('')
const users   = ref<AdminUser[]>([])
const page    = ref(1)
const total   = ref(0)
const status  = ref('')
const LIMIT   = 20

const STATUSES = [
  { value: '',         label: 'Todos' },
  { value: 'pending',  label: 'Pendientes' },
  { value: 'approved', label: 'Aprobados' },
]

const totalPages = () => Math.max(1, Math.ceil(total.value / LIMIT))

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusLabel(s: string) {
  if (s === 'approved') return 'Aprobado'
  if (s === 'pending')  return 'Pendiente'
  return s
}

async function load(p = 1) {
  loading.value = true
  err.value = ''
  try {
    const res: UserPage = await getUsers(p, LIMIT, status.value || undefined)
    users.value = res.data
    total.value = res.total
    page.value  = res.page
  } catch (e: any) {
    err.value = e.message ?? 'Error al cargar'
  } finally {
    loading.value = false
  }
}

function setStatus(s: string) {
  status.value = s
  load(1)
}

function goQrs(u: AdminUser) {
  router.push({ path: `/admin/usuarios/${u.id}/qrs`, query: { email: u.email } })
}

onMounted(() => load())
</script>

<template>
  <div>
    <div class="list-header">
      <h2 class="list-title">Usuarios</h2>
      <div class="filters">
        <button v-for="s in STATUSES" :key="s.value" class="filter-btn" :class="{ active: status === s.value }" @click="setStatus(s.value)">
          {{ s.label }}
        </button>
      </div>
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
              <th>Estado</th>
              <th>Registrado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td class="email-cell">{{ u.email }}</td>
              <td class="muted">{{ u.company_name ?? '—' }}</td>
              <td class="muted mono">{{ u.slug ?? '—' }}</td>
              <td>
                <span :class="u.status === 'approved' ? 'badge-ok' : 'badge-warn'">
                  {{ statusLabel(u.status) }}
                </span>
              </td>
              <td class="muted">{{ fmtDate(u.created_at) }}</td>
              <td class="action-cell">
                <button class="btn btn-g btn-sm" @click="goQrs(u)">Ver QRs</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <button class="btn btn-g btn-sm" :disabled="page <= 1" @click="load(page - 1)">← Anterior</button>
        <span class="page-info">{{ total }} usuarios · Página {{ page }} de {{ totalPages() }}</span>
        <button class="btn btn-g btn-sm" :disabled="page >= totalPages()" @click="load(page + 1)">Siguiente →</button>
      </div>
    </template>

    <div v-else class="state-msg">No hay usuarios con ese filtro.</div>
  </div>
</template>

<style scoped>
.list-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: .75rem; }
.list-title  { font-size: 1.25rem; font-weight: 700; }
.filters { display: flex; gap: .375rem; }
.filter-btn { padding: .3125rem .625rem; border-radius: var(--r); font-size: .8125rem; font-weight: 500; cursor: pointer; background: transparent; color: var(--mu); border: 1px solid var(--bd); transition: color .15s, border-color .15s, background .15s; }
.filter-btn:hover  { color: var(--tx); border-color: var(--tx); }
.filter-btn.active { color: var(--tx); background: var(--surf); border-color: var(--tx); }
.table-wrap { overflow-x: auto; border: 1px solid var(--bd); border-radius: var(--r); }
.tbl { width: 100%; border-collapse: collapse; font-size: .875rem; }
.tbl th { padding: .75rem 1rem; text-align: left; font-size: .75rem; font-weight: 600; color: var(--mu); border-bottom: 1px solid var(--bd); background: var(--surf); }
.tbl td { padding: .75rem 1rem; border-bottom: 1px solid var(--bd); }
.tbl tbody tr:last-child td { border-bottom: none; }
.tbl tbody tr:hover td { background: var(--surf); }
.email-cell { font-weight: 500; }
.mono  { font-family: monospace; font-size: .8125rem; }
.muted { color: var(--mu); }
.action-cell { text-align: right; white-space: nowrap; }
.badge-ok   { background: rgba(34,197,94,.12);  color: #86efac;  padding: .2rem .5rem; border-radius: 4px; font-size: .75rem; font-weight: 600; }
.badge-warn { background: rgba(245,158,11,.12); color: #fcd34d; padding: .2rem .5rem; border-radius: 4px; font-size: .75rem; font-weight: 600; }
.btn-sm { padding: .375rem .75rem; font-size: .8125rem; }
.pagination { display: flex; align-items: center; gap: 1rem; margin-top: 1.25rem; }
.page-info  { font-size: .8125rem; color: var(--mu); }
.state-msg { color: var(--mu); font-size: .9375rem; padding: 3rem 0; text-align: center; }
</style>
