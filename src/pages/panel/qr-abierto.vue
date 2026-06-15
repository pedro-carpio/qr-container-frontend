<script setup lang="ts">
import { ref } from 'vue'
import { createFallbackQr } from '~/api/qrs'
import { invalidateQrCache } from '~/stores/qrCache'

definePageMeta({ layout: 'panel', middleware: ['auth', 'company'] })

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
    invalidateQrCache()
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
            <button type="button" class="qr-reload" @click="qrString = ''">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Subir otro
            </button>
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
          <NuxtLink to="/panel" class="btn btn-g btn-full">Cancelar</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-wrap { display: flex; justify-content: center; }
.form-wrap .card { max-width: 26rem; }
.opt { color: var(--mu); font-weight: 400; font-size: .75rem; }

.qr-preview { display: flex; align-items: center; gap: .4rem; margin-top: .5rem; padding: .4rem .6rem; border-radius: var(--r); background: rgba(34,197,94,.06); border: 1px solid rgba(34,197,94,.25); font-size: .78rem; }
.qr-label { color: var(--ok, #22c55e); font-weight: 600; flex-shrink: 0; }
.qr-val   { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--mu); }
.qr-reload { flex-shrink: 0; background: none; border: 1px solid var(--bd); border-radius: var(--r); cursor: pointer; color: var(--mu); font-size: .72rem; padding: .2rem .45rem; display: inline-flex; align-items: center; gap: .25rem; white-space: nowrap; }
.qr-reload:hover { color: var(--tx); border-color: var(--mu); }

.color-row { display: flex; align-items: center; gap: .6rem; margin-top: .25rem; }
.color-swatch { width: 2.4rem; height: 2.4rem; padding: 0; border: 1px solid var(--bd); border-radius: var(--r); cursor: pointer; background: none; flex-shrink: 0; }
.color-swatch::-webkit-color-swatch-wrapper { padding: 0; }
.color-swatch::-webkit-color-swatch { border: none; border-radius: calc(var(--r) - 1px); }
.color-hex { font-size: .82rem; color: var(--mu); font-family: monospace; }
</style>
