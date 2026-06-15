import type { QrPage } from '../api/qrs'

interface RouterQrData {
  qr_string: string
  expiration_date: string
  card_color: string | null
  logo_url: string | null
}

// ── QR list cache ─────────────────────────────────────────────
// Invalidated whenever the user creates a new QR so stale data is never served.
const _pages = new Map<number, QrPage>()

export function getCachedPage(page: number): QrPage | null {
  return _pages.get(page) ?? null
}

export function setCachedPage(page: number, data: QrPage): void {
  _pages.set(page, data)
}

export function invalidateQrCache(): void {
  _pages.clear()
}

// ── Router QR prefetch cache ──────────────────────────────────
// Populated on hover so the card view renders instantly.
const _routerQrs = new Map<string, RouterQrData>()

export function getCachedRouterQr(slug: string, amount: number): RouterQrData | null {
  return _routerQrs.get(`${slug}/${amount}`) ?? null
}

export function setCachedRouterQr(slug: string, amount: number, data: RouterQrData): void {
  _routerQrs.set(`${slug}/${amount}`, data)
}
