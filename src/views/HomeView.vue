<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="home">
    <nav class="nav">
      <span class="brand">QR<span class="accent">Panel</span></span>
      <RouterLink to="/entrar" class="btn btn-p">Entrar</RouterLink>
    </nav>

    <main class="hero">
      <div class="hero-inner">
        <span class="badge">MVP · Beta</span>
        <h1 class="hero-title">Gestiona tus QRs<br>de cobro</h1>
        <p class="hero-sub">
          Redirige QRs dinámicamente según el monto.<br>
          Sin apps adicionales, sin fricción.
        </p>
        <div class="hero-ctas">
          <RouterLink to="/registrarse" class="btn btn-p btn-lg">Comenzar gratis</RouterLink>
          <RouterLink to="/entrar" class="btn btn-g btn-lg">Ya tengo cuenta</RouterLink>
        </div>
      </div>
    </main>

    <footer class="footer">
      <span>QRPanel &copy; {{ new Date().getFullYear() }}</span>
    </footer>
  </div>
</template>

<style scoped>
.home { display: flex; flex-direction: column; min-height: 100dvh; }

.nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 2rem; border-bottom: 1px solid var(--bd);
  position: sticky; top: 0; background: var(--bg); z-index: 10;
}
.brand { font-size: 1.125rem; font-weight: 800; letter-spacing: -.02em; }
.accent { color: var(--ac); }

.hero {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 5rem 2rem;
}
.hero-inner { max-width: 36rem; text-align: center; }

.badge {
  display: inline-block; padding: .25rem .875rem;
  border: 1px solid var(--bd); border-radius: 9999px;
  font-size: .75rem; color: var(--mu); margin-bottom: 1.5rem;
  letter-spacing: .04em;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800; line-height: 1.1;
  letter-spacing: -.03em; margin-bottom: 1.25rem;
}

.hero-sub {
  color: var(--mu); font-size: 1.0625rem;
  line-height: 1.7; margin-bottom: 2.5rem;
}

.hero-ctas { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; }
.btn-lg { padding: .75rem 1.75rem; font-size: 1rem; }

.footer {
  padding: 1.5rem 2rem; text-align: center;
  font-size: .75rem; color: var(--mu);
  border-top: 1px solid var(--bd);
}
</style>
