<script setup>
import HeroWindow from './app/HeroWindow.vue'
</script>

<!-- The link-preview image (public/og.png), captured by scripts/og-image.mjs at 1200x630. -->
<template>
  <div class="og">
    <div class="og-text">
      <div class="og-brand"><img src="/logo.png" alt="" />Pomelo</div>
      <h1>Every branch gets<br>its own running stack.</h1>
      <p>Worktrees, services and databases per branch, with your AI agents next to them. Free and open source for macOS.</p>
    </div>
    <div class="og-shot"><HeroWindow /></div>
  </div>
</template>

<style scoped>
.og { position: fixed; inset: 0; z-index: 1000; width: 1200px; height: 630px; overflow: hidden;
  background: radial-gradient(90% 120% at 85% 10%, rgba(166, 61, 158, 0.55), transparent 60%), #0e0c11;
  display: grid; grid-template-columns: 470px 1fr; align-items: center; font-family: 'IBM Plex Sans', system-ui, sans-serif; }
.og-text { padding: 0 0 0 64px; color: #f4eef5; }
.og-brand { display: flex; align-items: center; gap: 12px; font-size: 26px; font-weight: 600; }
.og-brand img { width: 44px; height: 44px; }
h1 { margin: 34px 0 0; border: 0; padding: 0; font-size: 50px; line-height: 1.06; letter-spacing: -0.03em; font-weight: 700; color: #fff; }
p { margin: 22px 0 0; font-size: 19px; line-height: 1.5; color: #c9bfcc; }
.og-shot { width: 1000px; margin-left: 20px; margin-top: 120px; filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.5)); }
</style>
