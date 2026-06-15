import { auth, setAuth, signOut } from '../stores/auth'

export const BASE = 'https://qr-container.pedrocarpiom.workers.dev'

let _refreshing: Promise<void> | null = null

type FetchOpts = RequestInit & { _retry?: boolean }

const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'Los datos enviados no son válidos. Revisá los campos e intentá de nuevo.',
  401: 'Tu sesión expiró. Iniciá sesión nuevamente.',
  403: 'No tenés permiso para realizar esta acción.',
  404: 'El recurso solicitado no existe.',
  409: 'Ya existe un registro con esos datos.',
  422: 'Los datos enviados no son válidos.',
  429: 'Demasiadas solicitudes. Esperá unos segundos e intentá de nuevo.',
  500: 'Error interno del servidor. Intentá más tarde.',
  503: 'El servicio no está disponible en este momento. Intentá más tarde.',
}

export async function apiFetch(path: string, opts: FetchOpts = {}): Promise<Response> {
  const { _retry, headers: extraHeaders, ...rest } = opts
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders as Record<string, string>),
  }
  if (auth.access) headers['Authorization'] = `Bearer ${auth.access}`

  const res = await fetch(BASE + path, { ...rest, headers })

  if (res.status === 401 && !_retry && auth.refresh) {
    if (!_refreshing) {
      _refreshing = fetch(BASE + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: auth.refresh }),
      })
        .then(async r => {
          if (!r.ok) throw new Error('refresh_failed')
          const data: { access_token: string } = await r.json()
          setAuth(data.access_token)
        })
        .catch(() => {
          signOut()
          if (import.meta.client) window.location.href = '/entrar'
        })
        .finally(() => { _refreshing = null })
    }
    await _refreshing
    if (auth.access) return apiFetch(path, { ...opts, _retry: true })
  }

  return res
}

type ApiJsonOpts = FetchOpts & { errorMessages?: Record<number, string> }

export async function apiJson<T = unknown>(path: string, opts: ApiJsonOpts = {}): Promise<T> {
  const { errorMessages, ...fetchOpts } = opts
  const res = await apiFetch(path, fetchOpts)
  if (!res.ok) {
    const msg =
      errorMessages?.[res.status] ??
      DEFAULT_MESSAGES[res.status] ??
      'Ocurrió un error inesperado. Intentá de nuevo.'
    throw Object.assign(new Error(msg), { status: res.status })
  }
  return res.json() as Promise<T>
}
