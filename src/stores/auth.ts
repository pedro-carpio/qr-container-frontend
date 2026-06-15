import { reactive } from 'vue'

export const auth = reactive({
  access: null as string | null,
  refresh: import.meta.client ? (sessionStorage.getItem('qr_rt') ?? null) : null,
  hasCompany: import.meta.client ? sessionStorage.getItem('qr_co') === '1' : false,
  slug: import.meta.client ? (sessionStorage.getItem('qr_slug') ?? null as string | null) : null,
  logoUrl: import.meta.client ? (sessionStorage.getItem('qr_logo') ?? null as string | null) : null,
  hasFallback: import.meta.client ? sessionStorage.getItem('qr_fb') === '1' : false,
  get isAdmin() { return this.slug === 'admin' },
})

export function isAuth() {
  return !!(auth.access || auth.refresh)
}

export function setAuth(access: string, refresh?: string) {
  auth.access = access
  if (refresh !== undefined) {
    auth.refresh = refresh
    if (import.meta.client) {
      refresh
        ? sessionStorage.setItem('qr_rt', refresh)
        : sessionStorage.removeItem('qr_rt')
    }
  }
}

export function setCompany(v: boolean) {
  auth.hasCompany = v
  if (import.meta.client) {
    v ? sessionStorage.setItem('qr_co', '1') : sessionStorage.removeItem('qr_co')
  }
}

export function setSlug(s: string) {
  auth.slug = s
  if (import.meta.client) sessionStorage.setItem('qr_slug', s)
}

export function setLogoUrl(url: string | null) {
  auth.logoUrl = url
  if (import.meta.client) {
    url ? sessionStorage.setItem('qr_logo', url) : sessionStorage.removeItem('qr_logo')
  }
}

export function setHasFallback(v: boolean) {
  auth.hasFallback = v
  if (import.meta.client) {
    v ? sessionStorage.setItem('qr_fb', '1') : sessionStorage.removeItem('qr_fb')
  }
}

export function signOut() {
  auth.access = null
  auth.refresh = null
  auth.hasCompany = false
  auth.slug = null
  auth.logoUrl = null
  auth.hasFallback = false
  if (import.meta.client) {
    sessionStorage.removeItem('qr_rt')
    sessionStorage.removeItem('qr_co')
    sessionStorage.removeItem('qr_slug')
    sessionStorage.removeItem('qr_logo')
    sessionStorage.removeItem('qr_fb')
  }
}
