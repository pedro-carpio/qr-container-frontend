import { reactive } from 'vue'
import type { Qr } from '../api/qrs'

export const qrCardStore = reactive({
  qr: null as Qr | null,
  razon: localStorage.getItem('qr_razon') ?? '',

  setQr(q: Qr | null) {
    this.qr = q
  },
  setRazon(r: string) {
    this.razon = r
    r ? localStorage.setItem('qr_razon', r) : localStorage.removeItem('qr_razon')
  },
})
