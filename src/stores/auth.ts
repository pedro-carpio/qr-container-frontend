import { reactive } from 'vue'

export const auth = reactive({
  access: null as string | null,
  refresh: sessionStorage.getItem('qr_rt') ?? null,
  hasCompany: sessionStorage.getItem('qr_co') === '1',
  slug: sessionStorage.getItem('qr_slug') ?? null as string | null,
  get isAdmin() { return this.slug === 'admin' },
})

export function isAuth() {
  return !!(auth.access || auth.refresh)
}

export function setAuth(access: string, refresh?: string) {
  auth.access = access
  if (refresh !== undefined) {
    auth.refresh = refresh
    refresh
      ? sessionStorage.setItem('qr_rt', refresh)
      : sessionStorage.removeItem('qr_rt')
  }
}

export function setCompany(v: boolean) {
  auth.hasCompany = v
  v ? sessionStorage.setItem('qr_co', '1') : sessionStorage.removeItem('qr_co')
}

export function setSlug(s: string) {
  auth.slug = s
  sessionStorage.setItem('qr_slug', s)
}

export function signOut() {
  auth.access = null
  auth.refresh = null
  auth.hasCompany = false
  auth.slug = null
  sessionStorage.removeItem('qr_rt')
  sessionStorage.removeItem('qr_co')
  sessionStorage.removeItem('qr_slug')
}
