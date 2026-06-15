<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QRCode from 'qrcode'
import { toPng } from 'html-to-image'
import { getRouterQr } from '../../api/router'

const route  = useRoute()
const router = useRouter()

const slug   = route.params.slug   as string
const amount = Number(route.params.amount)
const razon  = (route.query.razon  as string) || ''

const cardRef        = ref<HTMLElement | null>(null)
const qrDataUrl      = ref('')
const expirationDate = ref('')
const cardColor      = ref('#16a34a')
const logoUrl        = ref<string | null>(null)
const loading        = ref(true)
const err            = ref('')
const downloading    = ref(false)

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
function resolveColor(raw?: string | null): string {
  return raw && HEX_RE.test(raw) ? raw : '#16a34a'
}

function fmtAmount(v: number) {
  return `Bs ${v.toLocaleString('es-BO')}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-BO', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

async function download() {
  if (!cardRef.value) return
  downloading.value = true
  try {
    const png = await toPng(cardRef.value, { pixelRatio: 3, cacheBust: true })
    const a   = document.createElement('a')
    a.href     = png
    a.download = `qr-${(razon || slug).replace(/\s+/g, '-').toLowerCase()}.png`
    a.click()
  } finally {
    downloading.value = false
  }
}

onMounted(async () => {
  try {
    const data = await getRouterQr(slug, amount)
    expirationDate.value = data.expiration_date
    cardColor.value = resolveColor(data.card_color)
    logoUrl.value = data.logo_url
    qrDataUrl.value = await QRCode.toDataURL(data.qr_string, {
      width: 600,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
  } catch (e: any) {
    err.value = e.message ?? 'Error al cargar el QR.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="wrap">
    <!-- toolbar -->
    <div class="toolbar">
      <button class="btn btn-g btn-sm" @click="router.back()">← Volver</button>
      <button
        class="btn btn-p btn-sm"
        :disabled="!qrDataUrl || downloading"
        @click="download"
      >
        <span v-if="downloading" class="spin" />
        {{ downloading ? 'Descargando…' : 'Descargar PNG' }}
      </button>
    </div>

    <!-- loading -->
    <div v-if="loading" class="state-msg">Cargando…</div>

    <!-- error -->
    <div v-else-if="err" class="err-wrap">
      <p class="err-msg">{{ err }}</p>
      <button class="btn btn-g btn-sm" @click="router.back()">Volver</button>
    </div>

    <!-- card rendered as image -->
    <div v-else ref="cardRef" class="card-root">
      <!-- header -->
      <div class="card-header" :style="{ '--card-color': cardColor }">
        <div class="hdr-badge" :class="{ 'hdr-badge--logo': logoUrl }">
          <img v-if="logoUrl" :src="logoUrl" class="hdr-logo" alt="Logo" />
          <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect width="8" height="8" rx="1.5" fill="white"/>
            <rect x="12" width="8" height="8" rx="1.5" fill="white"/>
            <rect y="12" width="8" height="8" rx="1.5" fill="white"/>
            <rect x="14" y="14" width="4" height="4" rx="1" fill="white"/>
            <rect x="12" y="12" width="1.5" height="1.5" fill="white"/>
          </svg>
        </div>
        <div class="hdr-text">
          <span class="hdr-label">Pago QR</span>
          <span class="hdr-razon">{{ razon || slug }}</span>
        </div>
      </div>

      <!-- QR code -->
      <div class="card-body">
        <div class="qr-frame">
          <img :src="qrDataUrl" class="qr-img" alt="Código QR" />
        </div>
        <p class="scan-hint">Escanea para pagar</p>
      </div>

      <!-- amount -->
      <div class="card-amount">
        <span class="amount-label">Monto</span>
        <span class="amount-val">{{ fmtAmount(amount) }}</span>
      </div>

      <!-- expiration -->
      <div v-if="expirationDate" class="card-expiry">
        <span class="expiry-label">Vence</span>
        <span class="expiry-val">{{ fmtDate(expirationDate) }}</span>
      </div>

      <!-- footer -->
      <div class="card-footer">
        <span>Acepto pagos QR · Bolivia</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  display: flex; flex-direction: column; align-items: center;
  padding: 1.5rem 1rem 3rem;
}

.toolbar {
  display: flex; gap: .5rem; justify-content: space-between; align-items: center;
  width: 100%; max-width: 360px; margin-bottom: 1.5rem;
}
.btn-sm { padding: .375rem .75rem; font-size: .8125rem; }

.state-msg { color: var(--mu, #94a3b8); font-size: .9375rem; padding: 3rem 0; }

.err-wrap { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 3rem 1rem; }
.err-msg  { color: var(--mu, #94a3b8); font-size: .9375rem; text-align: center; }

/* ── Card ── */
.card-root {
  width: 360px;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 48px rgba(0,0,0,.45), 0 2px 8px rgba(0,0,0,.2);
  font-family: system-ui, -apple-system, sans-serif;
}

.card-header {
  background: linear-gradient(135deg, var(--card-color, #16a34a) 0%, color-mix(in srgb, var(--card-color, #16a34a) 80%, black) 100%);
  padding: 1.25rem 1.375rem;
  display: flex; align-items: center; gap: .875rem;
}
.hdr-badge {
  width: 44px; height: 44px; flex-shrink: 0;
  background: rgba(255,255,255,.18); border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.hdr-badge--logo { background: #fff; padding: 4px; }
.hdr-logo { width: 100%; height: 100%; object-fit: contain; display: block; }
.hdr-text { display: flex; flex-direction: column; gap: .1rem; min-width: 0; }
.hdr-label {
  font-size: .6875rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: .1em;
  color: rgba(255,255,255,.75);
}
.hdr-razon {
  font-size: 1.0625rem; font-weight: 700; color: #fff;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.card-body {
  background: #fff;
  padding: 1.5rem 1.5rem .75rem;
  display: flex; flex-direction: column; align-items: center;
}
.qr-frame {
  width: 220px; height: 220px;
  border: 3px solid #e2e8f0; border-radius: 12px;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.qr-img { width: 100%; height: 100%; display: block; }
.scan-hint { margin-top: .75rem; font-size: .75rem; color: #94a3b8; letter-spacing: .03em; }

.card-amount {
  border-top: 1px solid #f1f5f9;
  padding: .875rem 1.375rem;
  background: #fff;
  display: flex; justify-content: space-between; align-items: center;
}
.amount-label { font-size: .8125rem; color: #64748b; }
.amount-val   { font-size: 1.125rem; font-weight: 700; color: #0f172a; }

.card-expiry {
  border-top: 1px solid #f1f5f9;
  padding: .625rem 1.375rem;
  background: #fff;
  display: flex; justify-content: space-between; align-items: center;
}
.expiry-label { font-size: .8125rem; color: #64748b; }
.expiry-val   { font-size: .875rem; font-weight: 600; color: #dc2626; }

.card-footer {
  background: #f8fafc; border-top: 1px solid #e2e8f0;
  padding: .75rem 1.375rem; text-align: center;
  font-size: .6875rem; color: #94a3b8;
  letter-spacing: .04em; text-transform: uppercase;
}
</style>
