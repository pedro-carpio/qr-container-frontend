import { apiJson } from './client'

export interface Qr {
  id: string
  amount: number | null
  qr_string: string
  expiration_date: string
  bank?: string | null
  created_at: string
  is_fallback?: number
}

interface ApiList<T> {
  success: boolean
  data: T
  total?: number
  page?: number
  limit?: number
}

export interface QrPage {
  data: Qr[]
  total: number
  page: number
  limit: number
}

export const getQrs = (page = 1, limit = 20) =>
  apiJson<ApiList<Qr[]>>(`/api/qrs?page=${page}&limit=${limit}`).then(r => ({
    data: r.data,
    total: r.total ?? r.data.length,
    page: r.page ?? page,
    limit: r.limit ?? limit,
  }) as QrPage)

export const createQr = (payload: {
  amount: number
  qr_string: string
  expiration_date: string
  bank?: string
  card_color?: string
}) => apiJson('/api/qrs', {
  method: 'POST',
  body: JSON.stringify(payload),
  errorMessages: {
    400: 'Los datos del QR no son válidos. Verificá el monto y la fecha de vencimiento.',
  },
})

export const createFallbackQr = (payload: {
  qr_string: string
  expiration_date: string
  bank?: string
  card_color?: string
}) => apiJson('/api/qrs/fallback', {
  method: 'POST',
  body: JSON.stringify(payload),
  errorMessages: {
    400: 'El QR abierto debe tener una fecha de vencimiento de al menos 11 meses.',
  },
})

export const getExpiringQrs = () =>
  apiJson<ApiList<Qr[]>>('/api/qrs/expiring').then(r => r.data)
