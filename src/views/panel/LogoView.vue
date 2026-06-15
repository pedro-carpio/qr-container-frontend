<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { uploadLogo, getLogo } from '../../api/logo'
import { auth, setLogoUrl } from '../../stores/auth'

const currentUrl  = ref<string | null>(auth.logoUrl)
const fileInput   = ref<HTMLInputElement | null>(null)
const preview     = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const busy        = ref(false)
const err         = ref('')
const success     = ref(false)

onMounted(async () => {
  if (!currentUrl.value) {
    try {
      const data = await getLogo()
      currentUrl.value = data.logo_url
      setLogoUrl(data.logo_url)
    } catch {
      // no logo yet or not pro — silently ignore
    }
  }
})

function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  selectedFile.value = f
  preview.value = URL.createObjectURL(f)
  success.value = false
  err.value = ''
}

function triggerPick() {
  fileInput.value?.click()
}

async function upload() {
  if (!selectedFile.value) return
  busy.value = true
  err.value = ''
  success.value = false
  try {
    await uploadLogo(selectedFile.value)
    // Refresh logo URL from server after upload
    const data = await getLogo()
    currentUrl.value = data.logo_url
    setLogoUrl(data.logo_url)
    preview.value = null
    selectedFile.value = null
    if (fileInput.value) fileInput.value.value = ''
    success.value = true
  } catch (e: any) {
    err.value = e.message ?? 'Error inesperado'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="logo-wrap">
    <div class="card logo-card">
      <h1>Logo de empresa</h1>
      <p class="sub">Se muestra en el encabezado de tu tarjeta QR · Plan Pro</p>

      <div v-if="err" class="alert">{{ err }}</div>
      <div v-if="success" class="alert-ok">Logo actualizado correctamente.</div>

      <!-- Current logo -->
      <div v-if="currentUrl && !preview" class="logo-section">
        <p class="logo-label">Logo actual</p>
        <div class="logo-display">
          <img :src="currentUrl" alt="Logo actual" class="logo-preview" />
        </div>
      </div>

      <!-- Preview of new file -->
      <div v-if="preview" class="logo-section">
        <p class="logo-label">Vista previa</p>
        <div class="logo-display logo-display--preview">
          <img :src="preview" alt="Vista previa" class="logo-preview" />
        </div>
      </div>

      <!-- File picker -->
      <input
        ref="fileInput"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        class="file-hidden"
        @change="onFileChange"
      />

      <div class="btn-wrap">
        <button class="btn btn-g btn-full" @click="triggerPick">
          {{ currentUrl ? 'Cambiar imagen' : 'Seleccionar imagen' }}
        </button>
        <button
          v-if="selectedFile"
          class="btn btn-p btn-full"
          :disabled="busy"
          @click="upload"
        >
          <span v-if="busy" class="spin" />
          <span v-else>Subir logo</span>
        </button>
      </div>

      <p class="hint">PNG, JPEG, WebP o SVG · máx. 500 KB · mínimo 100×100 px</p>
    </div>
  </div>
</template>

<style scoped>
.logo-wrap { display: flex; justify-content: center; }
.logo-card { max-width: 26rem; }

.logo-section { margin: 1.25rem 0 .25rem; }
.logo-label {
  font-size: .75rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: .06em;
  color: var(--mu); margin-bottom: .5rem;
}

.logo-display {
  width: 100%;
  border: 1px solid var(--bd);
  border-radius: var(--r, 8px);
  background: var(--surf);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
}
.logo-display--preview { border-style: dashed; border-color: var(--ac); }

.logo-preview {
  max-width: 180px;
  max-height: 120px;
  object-fit: contain;
  display: block;
}

.file-hidden { display: none; }

.hint {
  font-size: .7rem;
  color: var(--mu);
  text-align: center;
  margin-top: .75rem;
}

.alert-ok {
  background: rgba(34,197,94,.12);
  color: #22c55e;
  border: 1px solid rgba(34,197,94,.25);
  border-radius: var(--r, 8px);
  padding: .625rem .875rem;
  font-size: .875rem;
  margin-bottom: .75rem;
}
</style>
