import { auth } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  if (!auth.hasCompany) return navigateTo('/iniciar')
})
