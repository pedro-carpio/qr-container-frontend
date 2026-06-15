import { apiJson } from './client'

export interface LoginResponse {
  access_token: string
  refresh_token: string
  fallback_qr_string: string | null
  logo_url: string | null
  user: {
    id: string
    email: string
    company_name: string | null
    slug: string | null
    is_fully_registered: boolean
  }
}

export function login(email: string, password: string) {
  return apiJson<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    errorMessages: {
      401: 'Correo electrónico o contraseña incorrectos.',
    },
  })
}

export function signup(email: string, password: string) {
  return apiJson('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    errorMessages: {
      409: 'Ese correo electrónico ya está registrado. ¿Querés iniciar sesión?',
    },
  })
}
