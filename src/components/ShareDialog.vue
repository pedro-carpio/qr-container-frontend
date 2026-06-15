<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../stores/auth'
import type { Qr } from '../api/qrs'

const RAZON_KEY = 'qr_razon'

const props = defineProps<{ qr: Qr }>()
const emit  = defineEmits<{ close: [] }>()

const router = useRouter()
const razon  = ref(localStorage.getItem(RAZON_KEY) ?? '')

function open() {
  const r = razon.value.trim()
  if (r) localStorage.setItem(RAZON_KEY, r)
  emit('close')
  router.push({
    path: `/pagar/${auth.slug}/${props.qr.amount}`,
    query: r ? { razon: r } : undefined,
  })
}
</script>

<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="dialog" role="dialog" aria-modal="true">
      <h3 class="dlg-title">Ver tarjeta</h3>
      <p class="dlg-sub">El nombre aparecerá en la tarjeta del QR.</p>

      <div class="field">
        <label for="dlg-razon">Razón social / Nombre del negocio</label>
        <input
          id="dlg-razon"
          v-model="razon"
          type="text"
          placeholder="Ej. Ferretería Don Pedro"
          autocomplete="organization"
          autofocus
          @keydown.enter="razon.trim() && open()"
        />
      </div>

      <div class="dlg-footer">
        <button class="btn btn-g btn-sm" @click="$emit('close')">Cancelar</button>
        <button class="btn btn-p btn-sm" :disabled="!razon.trim()" @click="open">
          Ver tarjeta →
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0, 0, 0, .65);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  animation: fade-in .12s ease;
}
@keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }

.dialog {
  background: var(--surf);
  border: 1px solid var(--bd);
  border-radius: calc(var(--r) * 2);
  padding: 1.75rem;
  width: 100%; max-width: 22rem;
  animation: slide-up .15s ease;
}
@keyframes slide-up { from { transform: translateY(8px); opacity: 0 } to { transform: none; opacity: 1 } }

.dlg-title { font-size: 1.0625rem; font-weight: 700; margin-bottom: .2rem; }
.dlg-sub   { font-size: .8125rem; color: var(--mu); margin-bottom: 1.25rem; }

.field { margin-bottom: 1.25rem; }
.dlg-footer { display: flex; gap: .5rem; justify-content: flex-end; }
.btn-sm { padding: .375rem .75rem; font-size: .8125rem; }
</style>
