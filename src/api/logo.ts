import { auth } from '../stores/auth'
import { BASE, apiJson } from './client'

export async function uploadLogo(file: File): Promise<void> {
  const form = new FormData()
  form.append('logo', file)
  const headers: Record<string, string> = {}
  if (auth.access) headers['Authorization'] = `Bearer ${auth.access}`
  const res = await fetch(BASE + '/api/logo', { method: 'POST', headers, body: form })
  if (!res.ok) {
    if (res.status === 403) throw new Error('Se requiere plan Pro para subir un logo.')
    if (res.status === 400) throw new Error('Imagen inválida. Verificá el tipo, tamaño y dimensiones.')
    throw new Error('Error al subir el logo.')
  }
}

export interface LogoResponse {
  logo_url: string
}

export const getLogo = () =>
  apiJson<LogoResponse>('/api/logo', {
    errorMessages: {
      403: 'Se requiere plan Pro.',
      404: 'No hay logo subido aún.',
    },
  })
