<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getExpiringQrs, type Qr } from '~/api/qrs'

definePageMeta({ layout: 'panel', middleware: ['auth', 'company'] })

const loading = ref(true)
const err = ref('')
const qrs = ref<Qr[]>([])

function fmtAmount(q: Qr) {
  return q.amount != null ? q.amount.toLocaleString('es') : 'Abierto'
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysLeft(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000)
}

onMounted(async () => {
  try {
    qrs.value = await getExpiringQrs()
  } catch (e: any) {
    err.value = e.message ?? 'Error al cargar'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="list-header">
      <h2 class="list-title">Venciendo pronto</h2>
      <span class="sub-note">QRs con vencimiento en los próximos 30 días</span>
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
            <tr v-for="q in qrs" :key="q.id">
              <td>
                <span :class="q.amount == null ? 'badge-open' : 'badge-fixed'">
                  {{ fmtAmount(q) }}
                </span>
              </td>
              <td class="muted">{{ q.bank ?? '—' }}</td>
              <td>{{ fmtDate(q.expiration_date) }}</td>
              <td>
                <span :class="daysLeft(q.expiration_date) <= 7 ? 'days-urgent' : 'days-warn'">
                  {{ daysLeft(q.expiration_date) }} días
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <div v-else class="state-msg">No hay QRs próximos a vencer.</div>
  </div>
</template>

<style scoped>
.list-header { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.list-title  { font-size: 1.25rem; font-weight: 700; }
.sub-note    { font-size: .8125rem; color: var(--mu); }

.table-wrap { overflow-x: auto; border: 1px solid var(--bd); border-radius: var(--r); }
.tbl { width: 100%; border-collapse: collapse; font-size: .875rem; }
.tbl th { padding: .75rem 1rem; text-align: left; font-size: .75rem; font-weight: 600; color: var(--mu); border-bottom: 1px solid var(--bd); background: var(--surf); }
.tbl td { padding: .75rem 1rem; border-bottom: 1px solid var(--bd); }
.tbl tbody tr:last-child td { border-bottom: none; }
.tbl tbody tr:hover td { background: var(--surf); }

.badge-fixed { background: rgba(59,130,246,.15); color: #93c5fd; padding: .2rem .5rem; border-radius: 4px; font-size: .8125rem; font-weight: 600; }
.badge-open  { background: rgba(34,197,94,.12);  color: #86efac;  padding: .2rem .5rem; border-radius: 4px; font-size: .8125rem; font-weight: 600; }
.muted       { color: var(--mu); }
.days-warn   { color: #fbbf24; font-weight: 600; }
.days-urgent { color: var(--er); font-weight: 700; }
.state-msg { color: var(--mu); font-size: .9375rem; padding: 3rem 0; text-align: center; }
</style>
