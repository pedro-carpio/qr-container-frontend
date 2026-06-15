import { isAuth } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  if (!isAuth()) return navigateTo('/entrar')
})
