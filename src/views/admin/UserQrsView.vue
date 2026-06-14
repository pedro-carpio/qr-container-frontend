<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserQrs, type QrPage } from '../../api/admin'
import type { Qr } from '../../api/qrs'

const route  = useRoute()
const router = useRouter()

const userId  = route.params.id as string
const email   = (route.query.email as string | undefined) ?? userId

const loading = ref(true)
const err     = ref('')
const qrs     = ref<Qr[]>([])
const page    = ref(1)
const total   = ref(0)
const LIMIT   = 20

const totalPages = () => Math.max(1, Math.ceil(total.value / LIMIT))

function fmtAmount(q: Qr) {
  return q.amount != null ? q.amount.toLocaleString('es') : 'Abierto'
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysLeft(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000)
}

async function load(p = 1) {
  loading.value = true
  err.value = ''
  try {
    const res: QrPage = await getUserQrs(userId, p, LIMIT)
    qrs.value   = res.data
    total.value = res.total
    page.value  = res.page
  } catch (e: any) {
    err.value = e.message ?? 'Error al cargar'
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
</script>

<template>
  <div>
    <div class="list-header">
      <div>
        <button class="btn btn-g btn-sm back-btn" @click="router.back()">← Volver</button>
        <h2 class="list-title">QRs de <span class="email-hl">{{ email }}</span></h2>
      </div>
      <span v-if="!loading" class="total-badge">{{ total }} QRs</span>
    </div>

    <div v-if="err" class="alert">{{ err }}</div>
    <div v-if="loading" class="state-msg">Cargando…</div>

    <template v-else-if="qrs.length">
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Monto</th>
              <th>Banco</th>
              <th>Vencimiento</th>
              <th>Días restantes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in qrs" :key="q.id" :class="daysLeft(q.expiration_date) <= 30 ? 'row-expiring' : ''">
              <td>
                <span :class="q.amount == null ? 'badge-open' : 'badge-fixed'">
                  {{ fmtAmount(q) }}
                </span>
              </td>
              <td class="muted">{{ q.bank ?? '—' }}</td>
              <td>{{ fmtDate(q.expiration_date) }}</td>
              <td>
                <span
                  v-if="daysLeft(q.expiration_date) <= 30"
                  :class="daysLeft(q.expiration_date) <= 7 ? 'days-urgent' : 'days-warn'"
                >
                  {{ daysLeft(q.expiration_date) }} días
                </span>
                <span v-else class="muted">{{ daysLeft(q.expiration_date) }} días</span>
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

    <div v-else class="state-msg">Este usuario no tiene QRs registrados.</div>
  </div>
</template>

<style scoped>
.list-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; gap: .75rem; flex-wrap: wrap; }
.back-btn    { margin-bottom: .625rem; }
.list-title  { font-size: 1.25rem; font-weight: 700; }
.email-hl    { color: var(--mu); font-weight: 400; font-size: 1rem; }
.total-badge { font-size: .8125rem; color: var(--mu); margin-top: .25rem; }

.table-wrap { overflow-x: auto; border: 1px solid var(--bd); border-radius: var(--r); }
.tbl { width: 100%; border-collapse: collapse; font-size: .875rem; }
.tbl th { padding: .75rem 1rem; text-align: left; font-size: .75rem; font-weight: 600; color: var(--mu); border-bottom: 1px solid var(--bd); background: var(--surf); }
.tbl td { padding: .75rem 1rem; border-bottom: 1px solid var(--bd); }
.tbl tbody tr:last-child td { border-bottom: none; }
.tbl tbody tr:hover td { background: var(--surf); }
.tbl tbody tr.row-expiring td { background: rgba(251,191,36,.04); }
.tbl tbody tr.row-expiring:hover td { background: rgba(251,191,36,.08); }

.badge-fixed { background: rgba(59,130,246,.15); color: #93c5fd; padding: .2rem .5rem; border-radius: 4px; font-size: .8125rem; font-weight: 600; }
.badge-open  { background: rgba(34,197,94,.12);  color: #86efac;  padding: .2rem .5rem; border-radius: 4px; font-size: .8125rem; font-weight: 600; }
.muted       { color: var(--mu); }

.days-warn   { color: #fbbf24; font-weight: 600; }
.days-urgent { color: var(--er); font-weight: 700; }

.btn-sm { padding: .375rem .75rem; font-size: .8125rem; }
.pagination { display: flex; align-items: center; gap: 1rem; margin-top: 1.25rem; }
.page-info  { font-size: .8125rem; color: var(--mu); }

.state-msg { color: var(--mu); font-size: .9375rem; padding: 3rem 0; text-align: center; }
</style>
