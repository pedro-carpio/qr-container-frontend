<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { createFallbackQr } from '../../api/qrs'
import QrScanner from '../../components/QrScanner.vue'

const router   = useRouter()
const qrString  = ref('')
const date      = ref('')
const bank      = ref('')
const cardColor = ref('#16a34a')
const err       = ref('')
const busy      = ref(false)
const today     = new Date().toISOString().slice(0, 10)

function onDecoded(val: string) {
  qrString.value = val
}

async function go() {
  err.value = ''
  if (!qrString.value.trim()) { err.value = 'El QR es obligatorio'; return }
  if (!date.value)            { err.value = 'La fecha de vencimiento es obligatoria'; return }

  busy.value = true
  try {
    await createFallbackQr({
      qr_string:       qrString.value.trim(),
      expiration_date: new Date(date.value).toISOString(),
      ...(bank.value.trim() && { bank: bank.value.trim() }),
      card_color: cardColor.value,
    })
    router.push('/panel')
  } catch (e: any) {
    err.value = e.message ?? 'Error inesperado'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="form-wrap">
    <div class="card">
      <h1>QR Abierto</h1>
      <p class="sub">Fallback sin monto fijo</p>
      <div v-if="err" class="alert">{{ err }}</div>
      <form @submit.prevent="go">
        <div class="field">
          <label>QR</label>
          <QrScanner @decoded="onDecoded" />
          <div v-if="qrString" class="qr-preview">
            <span class="qr-label">QR detectado:</span>
            <span class="qr-val">{{ qrString }}</span>
            <button type="button" class="qr-clear" @click="qrString = ''" title="Limpiar">✕</button>
          </div>
        </div>

        <div class="field">
          <label for="date">Vencimiento</label>
          <input id="date" v-model="date" type="date" :min="today" required />
        </div>
        <div class="field">
          <label for="bank">Banco <span class="opt">(opcional)</span></label>
          <input id="bank" v-model="bank" type="text" placeholder="Ej: Santander" />
        </div>
        <div class="field">
          <label for="card-color">Color de tarjeta</label>
          <div class="color-row">
            <input id="card-color" v-model="cardColor" type="color" class="color-swatch" />
            <span class="color-hex">{{ cardColor }}</span>
          </div>
        </div>
        <div class="btn-wrap">
          <button class="btn btn-p btn-full" :disabled="busy || !qrString">
            <span v-if="busy" class="spin" />
            <span v-else>Guardar QR</span>
          </button>
          <RouterLink to="/panel" class="btn btn-g btn-full">Cancelar</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-wrap { display: flex; justify-content: center; }
.form-wrap .card { max-width: 26rem; }
.opt { color: var(--mu); font-weight: 400; font-size: .75rem; }

.color-row {
  display: flex;
  align-items: center;
  gap: .6rem;
  margin-top: .25rem;
}
.color-swatch {
  width: 2.4rem;
  height: 2.4rem;
  padding: 0;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: var(--radius, 8px);
  cursor: pointer;
  background: none;
  flex-shrink: 0;
}
.color-swatch::-webkit-color-swatch-wrapper { padding: 0; }
.color-swatch::-webkit-color-swatch { border: none; border-radius: calc(var(--radius, 8px) - 1px); }
.color-hex {
  font-size: .82rem;
  color: var(--mu, #9ca3af);
  font-family: monospace;
}

.qr-preview {
  display: flex;
  align-items: center;
  gap: .4rem;
  margin-top: .5rem;
  padding: .4rem .6rem;
  border-radius: var(--radius, 8px);
  background: var(--bg2, #f9fafb);
  border: 1px solid var(--ok, #22c55e);
  font-size: .78rem;
}
.qr-label { color: var(--ok, #22c55e); font-weight: 600; flex-shrink: 0; }
.qr-val   { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--mu, #9ca3af); }
.qr-clear {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--mu, #9ca3af);
  font-size: .85rem;
  padding: 0 .1rem;
  line-height: 1;
}
.qr-clear:hover { color: var(--err, #ef4444); }
</style>
