<script setup lang="ts">
import { ref, computed } from 'vue'
import { createCompany } from '~/api/company'
import { createFallbackQr } from '~/api/qrs'
import { setCompany, setSlug } from '~/stores/auth'

definePageMeta({ middleware: ['auth'] })

const router = useRouter()

const step = ref(1)
const err = ref('')
const busy = ref(false)

const name = ref('')
const slug = ref('')

const SLUG_RE = /^[a-z0-9-]+$/
const slugOk = computed(() => SLUG_RE.test(slug.value))
const slugErr = computed(() =>
  slug.value && !slugOk.value ? 'Solo minúsculas, números y guiones' : '',
)

async function goStep1() {
  err.value = ''
  busy.value = true
  try {
    await createCompany(name.value.trim(), slug.value)
    setSlug(slug.value)
    step.value = 2
  } catch (e: any) {
    err.value = e.message ?? 'Error inesperado'
  } finally {
    busy.value = false
  }
}

const qrString = ref('')
const date = ref('')
const bank = ref('')
const bankSelect = ref('')
const BANKS = ['Banco Unión', 'Banco Mercantil', 'Yape', 'BNB', 'Otro']

function onBankSelect(val: string) {
  bankSelect.value = val
  bank.value = val === 'Otro' ? '' : val
}
const today = new Date().toISOString().slice(0, 10)

async function goStep2() {
  err.value = ''
  if (!qrString.value.trim()) {
    err.value = 'El QR es obligatorio'
    return
  }
  if (!date.value) {
    err.value = 'La fecha de vencimiento es obligatoria'
    return
  }

  busy.value = true
  try {
    await createFallbackQr({
      qr_string: qrString.value.trim(),
      expiration_date: new Date(date.value).toISOString(),
      ...(bank.value.trim() && { bank: bank.value.trim() }),
    })
    setCompany(true)
    router.push('/panel')
  } catch (e: any) {
    err.value = e.message ?? 'Error inesperado'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="card">
      <div class="steps">
        <div class="step" :class="{ active: step === 1, done: step > 1 }">
          <span class="dot">{{ step > 1 ? '✓' : '1' }}</span>
          <span class="label">Tu empresa</span>
        </div>
        <div class="step-line" :class="{ done: step > 1 }" />
        <div class="step" :class="{ active: step === 2 }">
          <span class="dot">2</span>
          <span class="label">QR de fallback</span>
        </div>
      </div>

      <template v-if="step === 1">
        <h1>Tu empresa</h1>
        <p class="sub">Configuración inicial · solo una vez</p>
        <div v-if="err" class="alert">{{ err }}</div>
        <form @submit.prevent="goStep1">
          <div class="field">
            <label for="name">Nombre de empresa</label>
            <input id="name" v-model="name" type="text" placeholder="Mi Empresa S.A." required />
          </div>
          <div class="field">
            <label for="slug">Identificador público (slug)</label>
            <input
              id="slug"
              v-model="slug"
              type="text"
              placeholder="mi-empresa"
              :aria-invalid="slugErr ? true : undefined"
              required
            />
            <p v-if="slugErr" class="hint err">{{ slugErr }}</p>
            <p v-else-if="slug && slugOk" class="hint ok">✓ Formato válido</p>
            <p v-else class="hint">minúsculas, números y guiones</p>
          </div>
          <div class="btn-wrap">
            <button class="btn btn-p btn-full" :disabled="busy || !slugOk || !name.trim()">
              <span v-if="busy" class="spin" />
              <span v-else>Continuar</span>
            </button>
          </div>
        </form>
      </template>

      <template v-else>
        <h1>QR Abierto</h1>
        <p class="sub">Fallback sin monto fijo</p>
        <div v-if="err" class="alert">{{ err }}</div>
        <form @submit.prevent="goStep2">
          <div class="field">
            <label>QR</label>
            <QrScanner @decoded="qrString = $event" v-if="!qrString" />
            <div v-if="qrString" class="qr-detected">
              <div class="qr-detected-status">
                <svg class="qr-check" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>QR cargado correctamente</span>
              </div>
              <p class="qr-detected-note">No podemos verificar el monto ni la fecha desde aquí.</p>
              <button type="button" class="btn btn-g qr-reload" @click="qrString = ''">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
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
            <select
              id="bank"
              :value="bankSelect"
              @change="onBankSelect(($event.target as HTMLSelectElement).value)"
            >
              <option value="">Seleccionar banco</option>
              <option v-for="b in BANKS" :key="b" :value="b">{{ b }}</option>
            </select>
            <input
              v-if="bankSelect === 'Otro'"
              v-model="bank"
              type="text"
              placeholder="Nombre del banco"
              class="bank-other"
            />
          </div>
          <label class="checkbox-label" for="open-qr">
            <input id="open-qr" type="checkbox" class="checkbox-input" required />
            <span class="checkbox-box" aria-hidden="true" />
            <span class="checkbox-text"
              >Confirmo que el QR subido es de <strong>monto abierto</strong> (sin monto
              fijo)</span
            >
          </label>
          <div class="btn-wrap">
            <button class="btn btn-p btn-full" :disabled="busy">
              <span v-if="busy" class="spin" />
              <span v-else>Guardar QR</span>
            </button>
            <button type="button" class="btn btn-g btn-full" @click="((step = 1), (err = ''))">
              Volver
            </button>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped>
.steps { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
.step { display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0; }
.dot {
  width: 1.6rem; height: 1.6rem; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700;
  background: var(--s, #e5e7eb); color: var(--mu, #9ca3af);
  transition: background 0.2s, color 0.2s;
}
.step.active .dot { background: var(--p, #6366f1); color: #fff; }
.step.done .dot   { background: var(--ok, #22c55e); color: #fff; }
.label { font-size: 0.8rem; color: var(--mu, #9ca3af); transition: color 0.2s; }
.step.active .label, .step.done .label { color: var(--fg, #111); }
.step-line { flex: 1; height: 2px; background: var(--s, #e5e7eb); border-radius: 1px; transition: background 0.2s; }
.step-line.done { background: var(--ok, #22c55e); }
.opt { color: var(--mu); font-weight: 400; font-size: 0.75rem; }
.bank-other { margin-top: 0.5rem; }

.checkbox-label { display: flex; align-items: flex-start; gap: 0.625rem; margin-top: 1rem; cursor: pointer; user-select: none; }
.checkbox-input { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.checkbox-box { flex-shrink: 0; width: 1.125rem; height: 1.125rem; margin-top: 0.125rem; border: 1.5px solid var(--bd); border-radius: 0.25rem; background: var(--bg); transition: background 0.15s, border-color 0.15s; display: flex; align-items: center; justify-content: center; }
.checkbox-input:checked ~ .checkbox-box { background: var(--ac); border-color: var(--ac); }
.checkbox-input:checked ~ .checkbox-box::after { content: ''; display: block; width: 0.3rem; height: 0.55rem; border: 2px solid #fff; border-top: none; border-left: none; transform: rotate(45deg) translateY(-1px); }
.checkbox-input:focus-visible ~ .checkbox-box { outline: 2px solid var(--ac); outline-offset: 2px; }
.checkbox-label:hover .checkbox-box { border-color: var(--ac); }
.checkbox-text { font-size: 0.8125rem; color: var(--mu); line-height: 1.4; }

.qr-detected { margin-top: .5rem; padding: .75rem 1rem; background: rgba(34,197,94,.08); border: 1px solid rgba(34,197,94,.25); border-radius: var(--r); }
.qr-detected-status { display: flex; align-items: center; gap: .4rem; color: var(--ok, #22c55e); font-size: .875rem; font-weight: 600; }
.qr-check { width: 1.1rem; height: 1.1rem; flex-shrink: 0; }
.qr-detected-note { font-size: .75rem; color: var(--mu); margin: .25rem 0 .625rem; }
.qr-reload { font-size: .8rem; padding: .275rem .625rem; display: inline-flex; align-items: center; gap: .35rem; }
</style>
