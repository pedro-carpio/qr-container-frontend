import { apiJson } from './client'

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: { is_fully_registered: boolean; slug: string | null }
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
