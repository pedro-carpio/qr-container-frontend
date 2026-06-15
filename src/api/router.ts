import { apiJson } from './client'

export function getRouterQr(slug: string, amount: number) {
  return apiJson<{ qr_string: string; expiration_date: string; card_color: string | null; logo_url: string | null }>(`/router/${slug}/${amount}`, {
    errorMessages: {
      404: 'No se encontró un QR activo para este comercio y monto.',
      429: 'Demasiadas solicitudes. Intentá en unos segundos.',
    },
  })
}
