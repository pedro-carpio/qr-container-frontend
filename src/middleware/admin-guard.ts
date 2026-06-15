import { auth } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  if (!auth.isAdmin) return navigateTo('/panel')
})
