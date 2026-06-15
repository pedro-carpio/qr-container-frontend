export default defineNuxtConfig({
  srcDir: 'src',
  css: ['~/assets/style.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1.0',
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      meta: [
        { name: 'apple-mobile-web-app-title', content: 'Mis Qrs' },
      ],
    },
  },
  nitro: {
    preset: 'vercel',
  },
  routeRules: {
    '/entrar': { ssr: false },
    '/registrarse': { ssr: false },
    '/iniciar': { ssr: false },
    '/pendiente': { ssr: false },
    '/panel': { ssr: false },
    '/panel/**': { ssr: false },
    '/admin': { ssr: false },
    '/admin/**': { ssr: false },
  },
  compatibilityDate: '2024-11-01',
})
