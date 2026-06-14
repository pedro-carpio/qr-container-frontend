import { apiJson } from './client'
import type { Qr } from './qrs'

const H = { 'x-internal': '1' }

export interface AdminUser {
  id: string
  email: string
  status: string
  company_name?: string | null
  slug?: string | null
  created_at: string
}

export interface AdminStats {
  users: {
    total_users: number
    active_users: number
    pending_users: number
  }
  qrs: {
    total_qrs: number
    fallback_qrs: number
    expired_qrs: number
  }
}

export interface UserPage {
  data: AdminUser[]
  total: number
  page: number
  limit: number
}

export interface QrPage {
  data: Qr[]
  total: number
  page: number
  limit: number
}

interface ApiList<T> {
  success: boolean
  data: T
  total?: number
  page?: number
  limit?: number
}

const ADMIN_ERRORS = {
  403: 'No tenés permiso para acceder al panel de administración.',
  404: 'El usuario no existe o fue eliminado.',
}

export const getStats = () =>
  apiJson<ApiList<AdminStats>>('/api/admin/stats', { headers: H, errorMessages: ADMIN_ERRORS })
    .then(r => r.data)

export const getPending = (page = 1, limit = 20): Promise<UserPage> =>
  apiJson<ApiList<AdminUser[]>>(`/api/admin/pending?page=${page}&limit=${limit}`, { headers: H, errorMessages: ADMIN_ERRORS })
    .then(r => ({ data: r.data, total: r.total ?? r.data.length, page: r.page ?? page, limit: r.limit ?? limit }))

export const getUsers = (page = 1, limit = 20, status?: string): Promise<UserPage> => {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (status) q.set('status', status)
  return apiJson<ApiList<AdminUser[]>>(`/api/admin/users?${q}`, { headers: H, errorMessages: ADMIN_ERRORS })
    .then(r => ({ data: r.data, total: r.total ?? r.data.length, page: r.page ?? page, limit: r.limit ?? limit }))
}

export const getUserQrs = (userId: string, page = 1, limit = 20): Promise<QrPage> =>
  apiJson<ApiList<Qr[]>>(`/api/admin/users/${userId}/qrs?page=${page}&limit=${limit}`, { headers: H, errorMessages: ADMIN_ERRORS })
    .then(r => ({ data: r.data, total: r.total ?? r.data.length, page: r.page ?? page, limit: r.limit ?? limit }))

export const approveUser = (user_id: string) =>
  apiJson('/api/approve', {
    method: 'POST',
    body: JSON.stringify({ user_id }),
    headers: H,
    errorMessages: {
      403: 'No tenés permiso para aprobar usuarios.',
      404: 'El usuario no existe o ya fue procesado.',
    },
  })
