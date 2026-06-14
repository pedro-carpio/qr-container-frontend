<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import jsQR from 'jsqr'

const emit = defineEmits<{ (e: 'decoded', value: string): void }>()

// ── state ─────────────────────────────────────────────────────────────────
const mode       = ref<'idle' | 'camera' | 'file'>('idle')
const scanErr    = ref('')
const videoEl    = ref<HTMLVideoElement | null>(null)
const canvasEl   = ref<HTMLCanvasElement | null>(null)
const stream     = ref<MediaStream | null>(null)
const rafId      = ref<number>(0)
const fileInput  = ref<HTMLInputElement | null>(null)

// ── camera ────────────────────────────────────────────────────────────────
async function startCamera() {
  scanErr.value = ''
  mode.value = 'camera'
  await new Promise(r => setTimeout(r, 50)) // let DOM mount video element
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    })
    videoEl.value!.srcObject = stream.value
    await videoEl.value!.play()
    tick()
  } catch {
    scanErr.value = 'No se pudo acceder a la cámara'
    mode.value = 'idle'
  }
}

function tick() {
  const video  = videoEl.value
  const canvas = canvasEl.value
  if (!video || !canvas || video.readyState < 2) {
    rafId.value = requestAnimationFrame(tick)
    return
  }
  canvas.width  = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(video, 0, 0)
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const result = jsQR(img.data, img.width, img.height)
  if (result) {
    stopCamera()
    emit('decoded', result.data)
    return
  }
  rafId.value = requestAnimationFrame(tick)
}

function stopCamera() {
  cancelAnimationFrame(rafId.value)
  stream.value?.getTracks().forEach(t => t.stop())
  stream.value = null
  mode.value = 'idle'
}

onUnmounted(stopCamera)

// ── file upload ───────────────────────────────────────────────────────────
function openFile() {
  scanErr.value = ''
  fileInput.value?.click()
}

function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const url = URL.createObjectURL(file)
  const img  = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width  = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const data = ctx.getImageData(0, 0, img.width, img.height)
    const result = jsQR(data.data, data.width, data.height)
    URL.revokeObjectURL(url)
    if (result) {
      emit('decoded', result.data)
    } else {
      scanErr.value = 'No se detectó ningún QR en la imagen'
    }
  }
  img.src = url
  // reset so the same file can be re-selected
  ;(e.target as HTMLInputElement).value = ''
}
</script>

<template>
  <div class="qr-scanner">
    <!-- buttons -->
    <div v-if="mode === 'idle'" class="scan-btns">
      <button type="button" class="btn btn-s" @click="startCamera">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
        Escanear con cámara
      </button>
      <button type="button" class="btn btn-s" @click="openFile">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        Subir imagen
      </button>
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFile" />
    </div>

    <!-- camera view -->
    <div v-if="mode === 'camera'" class="camera-wrap">
      <video ref="videoEl" class="camera-feed" muted playsinline />
      <canvas ref="canvasEl" class="hidden" />
      <div class="scan-hint">Apuntá el QR al centro</div>
      <button type="button" class="btn btn-g btn-sm mt" @click="stopCamera">Cancelar</button>
    </div>

    <p v-if="scanErr" class="scan-err">{{ scanErr }}</p>
  </div>
</template>

<style scoped>
.scan-btns {
  display: flex;
  gap: .5rem;
  flex-wrap: wrap;
}

.btn-s {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  padding: .45rem .9rem;
  border-radius: var(--radius, 8px);
  border: 1.5px solid var(--border, #d1d5db);
  background: var(--bg2, #f9fafb);
  color: var(--fg, #111);
  font-size: .85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background .15s, border-color .15s;
}
.btn-s:hover { background: var(--s, #e5e7eb); border-color: var(--mu, #9ca3af); }

.icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.camera-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .6rem;
}

.camera-feed {
  width: 100%;
  max-width: 320px;
  border-radius: var(--radius, 8px);
  background: #000;
  aspect-ratio: 1;
  object-fit: cover;
}

.scan-hint {
  font-size: .78rem;
  color: var(--mu, #9ca3af);
}

.btn-sm {
  padding: .35rem .8rem;
  font-size: .8rem;
}

.mt { margin-top: .25rem; }

.scan-err {
  margin-top: .4rem;
  font-size: .8rem;
  color: var(--err, #ef4444);
}

.hidden { display: none; }
</style>
