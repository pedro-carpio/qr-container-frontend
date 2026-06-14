<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getQrs, type Qr, type QrPage } from '../../api/qrs'
import ShareDialog from '../../components/ShareDialog.vue'

const loading     = ref(true)
const err         = ref('')
const qrs         = ref<Qr[]>([])
const page        = ref(1)
const total       = ref(0)
const LIMIT       = 20
const selectedQr  = ref<Qr | null>(null)

const totalPages = () => Math.max(1, Math.ceil(total.value / LIMIT))

async function load(p = 1) {
  loading.value = true
  err.value = ''
  try {
    const res: QrPage = await getQrs(p, LIMIT)
    qrs.value = res.data
    total.value = res.total
    page.value = res.page
  } catch (e: any) {
    err.value = e.message ?? 'Error al cargar los QRs'
  } finally {
    loading.value = false
  }
}

function fmtAmount(q: Qr) {
  return q.amount != null ? q.amount.toLocaleString('es') : 'Abierto'
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysLeft(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000)
}

onMounted(() => load())
</script>

<template>
  <div>
    <div class="list-header">
      <h2 class="list-title">Mis QRs</h2>
      <div class="list-actions">
        <RouterLink to="/panel/nuevo" class="btn btn-p btn-sm">+ Nuevo QR</RouterLink>
        <RouterLink to="/panel/qr-abierto" class="btn btn-g btn-sm">+ QR Abierto</RouterLink>
      </div>
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
              <th></th>
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
              <td>
                {{ fmtDate(q.expiration_date) }}
                <span
                  v-if="daysLeft(q.expiration_date) <= 30"
                  :class="daysLeft(q.expiration_date) <= 7 ? 'days-urgent' : 'days-warn'"
                >
                  · {{ daysLeft(q.expiration_date) }}d
                </span>
              </td>
              <td class="td-action">
                <button v-if="q.amount != null" class="share-btn" title="Compartir" @click="selectedQr = q">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm-7-4a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm7-5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM4 6.93l6.5 3.64m0-5.14L4 8.07" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
                  </svg>
                  Compartir
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

    <div v-else class="state-msg">
      No tienes QRs aún.
      <RouterLink to="/panel/nuevo" class="link">Crea el primero</RouterLink>
    </div>
  </div>

  <ShareDialog v-if="selectedQr" :qr="selectedQr" @close="selectedQr = null" />
</template>

<style scoped>
.list-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: .75rem; }
.list-title  { font-size: 1.25rem; font-weight: 700; }
.list-actions { display: flex; gap: .5rem; }
.btn-sm { padding: .375rem .75rem; font-size: .8125rem; }

.table-wrap { overflow-x: auto; border: 1px solid var(--bd); border-radius: var(--r); }
.tbl { width: 100%; border-collapse: collapse; font-size: .875rem; }
.tbl th { padding: .75rem 1rem; text-align: left; font-size: .75rem; font-weight: 600; color: var(--mu); border-bottom: 1px solid var(--bd); background: var(--surf); }
.tbl td { padding: .75rem 1rem; border-bottom: 1px solid var(--bd); }
.tbl tbody tr:last-child td { border-bottom: none; }
.tbl tbody tr:hover td { background: var(--surf); }
.tbl tbody tr.row-expiring td { background: rgba(251,191,36,.04); }
.tbl tbody tr.row-expiring:hover td { background: rgba(251,191,36,.08); }

.days-warn   { color: #fbbf24; font-weight: 600; font-size: .8125rem; }
.days-urgent { color: var(--er); font-weight: 700; font-size: .8125rem; }

.badge-fixed { background: rgba(59,130,246,.15); color: #93c5fd; padding: .2rem .5rem; border-radius: 4px; font-size: .8125rem; font-weight: 600; }
.badge-open  { background: rgba(34,197,94,.12);  color: #86efac;  padding: .2rem .5rem; border-radius: 4px; font-size: .8125rem; font-weight: 600; }
.muted { color: var(--mu); }

.pagination { display: flex; align-items: center; gap: 1rem; margin-top: 1.25rem; }
.page-info  { font-size: .8125rem; color: var(--mu); }

.state-msg { color: var(--mu); font-size: .9375rem; padding: 3rem 0; text-align: center; }
.link { color: var(--ac); text-decoration: none; margin-left: .35rem; }
.link:hover { text-decoration: underline; }

.td-action { width: 1px; white-space: nowrap; padding-right: .75rem; }
.share-btn {
  display: inline-flex; align-items: center; gap: .35rem;
  padding: .275rem .625rem; border-radius: var(--r);
  background: transparent; border: 1px solid var(--bd);
  color: var(--mu); font-size: .75rem; font-weight: 500;
  cursor: pointer; transition: color .15s, border-color .15s;
  white-space: nowrap;
}
.share-btn:hover { color: var(--tx); border-color: var(--tx); }
</style>
