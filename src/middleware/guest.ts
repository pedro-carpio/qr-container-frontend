import { auth, isAuth } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  if (isAuth()) return navigateTo(auth.hasCompany ? '/panel' : '/iniciar')
})
