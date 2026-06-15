import { createRouter, createWebHistory } from 'vue-router'
import { auth, isAuth } from '../stores/auth'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import OnboardingView from '../views/OnboardingView.vue'
import PendingView from '../views/PendingView.vue'
import PanelLayout from '../views/panel/PanelLayout.vue'
import QrListView from '../views/panel/QrListView.vue'
import NewQrView from '../views/panel/NewQrView.vue'
import FallbackQrView from '../views/panel/FallbackQrView.vue'
import ExpiringView from '../views/panel/ExpiringView.vue'
import QrCardView from '../views/panel/QrCardView.vue'
import LogoView from '../views/panel/LogoView.vue'
import AdminLayout from '../views/admin/AdminLayout.vue'
import StatsView from '../views/admin/StatsView.vue'
import AdminPendingView from '../views/admin/PendingView.vue'
import UsersView from '../views/admin/UsersView.vue'
import UserQrsView from '../views/admin/UserQrsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    { path: '/entrar', component: LoginView, meta: { guest: true } },
    { path: '/registrarse', component: SignupView, meta: { guest: true } },
    { path: '/iniciar', component: OnboardingView, meta: { auth: true } },
    { path: '/pendiente', component: PendingView, meta: { auth: true } },
    {
      path: '/panel',
      component: PanelLayout,
      meta: { auth: true, co: true },
      children: [
        { path: '', component: QrListView },
        { path: 'nuevo', component: NewQrView },
        { path: 'qr-abierto', component: FallbackQrView },
        { path: 'venciendo', component: ExpiringView },
        { path: 'logo', component: LogoView },
      ],
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { auth: true, admin: true },
      children: [
        { path: '', component: StatsView },
        { path: 'pendientes', component: AdminPendingView },
        { path: 'usuarios', component: UsersView },
        { path: 'usuarios/:id/qrs', component: UserQrsView },
      ],
    },
    { path: '/pagar/:slug/:amount', component: QrCardView },
    { path: '/:p(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const needsAuth = to.matched.some((r) => r.meta.auth)
  const needsCo = to.matched.some((r) => r.meta.co)
  const needsAdmin = to.matched.some((r) => r.meta.admin)
  const isGuestOnly = to.matched.some((r) => r.meta.guest)

  if (needsAuth && !isAuth()) return '/entrar'
  if (needsAdmin && !auth.isAdmin) return '/panel'
  if (needsCo && !auth.hasCompany) return '/iniciar'
  if (isGuestOnly && isAuth()) return auth.hasCompany ? '/panel' : '/iniciar'
})

export default router
