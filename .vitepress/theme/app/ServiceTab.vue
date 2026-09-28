<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'
const all = [
  ['15:40:00', '[vite] hmr update /src/pages/Login.tsx', ''],
  ['15:40:07', '[vite] page reload src/main.tsx', ''],
  ['15:40:14', 'Warning: something is deprecated', 'warn'],
  ['15:40:21', '[vite] page reload src/main.tsx', ''],
  ['15:40:28', "Error: could not resolve 'vite-plugin-svgr'", 'err'],
  ['15:40:35', '[vite] hmr update /src/components/Button.tsx', ''],
  ['15:40:41', '[vite] hmr update /src/pages/Login.tsx', ''],
]
const query = ref('')
const follow = ref(true)
const wrap = ref(false)
const mode = ref('dev')
const lines = computed(() => all.filter(l => !query.value || l[1].toLowerCase().includes(query.value.toLowerCase())))
</script>

<template>
  <div class="pa-st">
    <div class="row pa-st-head">
      <i class="pa-st-dot" /><span class="muted pa-st-repo">web</span><span class="muted">&gt;</span>
      <span class="pa-st-name">vite</span><span class="pa-mode mono">{{ mode }}</span>
      <span class="grow" />
      <span class="pa-ob-btn dim"><Icon name="play" :size="11" />Start</span>
      <span class="pa-ob-btn"><Icon name="stop" :size="11" />Stop</span>
      <span class="pa-ob-btn"><Icon name="rotate_cw" :size="11" />Restart</span>
      <span class="pa-ob-btn"><Icon name="arrow_up_right" :size="11" />Open in browser</span>
      <Icon name="ellipsis" :size="14" class="icon-muted" />
    </div>
    <div class="row pa-st-facts">
      <div class="col"><span class="muted">Status</span><span class="pa-ok">Running</span></div>
      <div class="col"><span class="muted">PID</span><span class="mono">48123</span></div>
      <div class="col"><span class="muted">URL</span><span class="mono pa-link">vite.web.feat-login.localhost:8767</span></div>
      <div class="col"><span class="muted">Port</span><span class="row" style="gap: 8px"><span class="mono">5173</span><span class="pa-st-change">Change</span></span></div>
      <div class="col"><span class="muted">Mode</span>
        <span class="pa-uc-seg"><span v-for="m in ['dev', 'prod']" :key="m" :class="{ on: mode === m }" @click="mode = m">{{ m }}</span></span></div>
    </div>
    <div class="row pa-st-logbar">
      <span class="pa-st-live">LOGS <i /> <span class="pa-ok">live</span></span>
      <div class="pa-field pa-st-filter"><Icon name="search" :size="12" class="placeholder" />
        <input v-model="query" class="pa-st-input" placeholder="Filter lines" /></div>
      <span class="pa-st-tool"><Icon name="pause" :size="12" />Pause</span>
      <span class="pa-st-tool"><Icon name="trash" :size="12" />Clear</span>
      <span class="pa-st-tool" :class="{ on: follow }" @click="follow = !follow"><Icon name="arrow_down" :size="12" />Follow</span>
      <span class="pa-st-tool" :class="{ on: wrap }" @click="wrap = !wrap"><Icon name="return" :size="12" />Wrap</span>
      <span class="grow" />
      <span class="placeholder pa-sm">{{ query ? `${lines.length} matching` : `${all.length} lines` }}</span>
    </div>
    <div class="pa-st-logs mono">
      <div v-for="l in lines" :key="l[0]" class="pa-st-line"><span class="placeholder">{{ l[0] }}</span><span :class="l[2]">{{ l[1] }}</span></div>
    </div>
  </div>
</template>

<style>
.pa-st { height: 100%; display: flex; flex-direction: column; background: var(--pa-editor-background); }
.pa-st-head { height: 44px; padding: 0 14px; gap: 8px; border-bottom: 1px solid var(--pa-border-variant); font-size: 14px; flex: none; }
.pa-st-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--pa-success); display: block; }
.pa-st-name { font-weight: 600; }
.pa-ob-btn.dim { opacity: 0.5; }
.pa-st-facts { padding: 12px 14px; gap: 28px; border-bottom: 1px solid var(--pa-border-variant); font-size: 13px; flex: none; align-items: flex-start; }
.pa-st-facts .col { gap: 4px; }
.pa-st-facts .col > .muted { font-size: 11.5px; }
.pa-link { color: var(--pa-text-accent); }
.pa-st-change { font-size: 12px; color: var(--pa-text-accent); }
.pa-st-logbar { height: 38px; padding: 0 14px; gap: 10px; border-bottom: 1px solid var(--pa-border-variant); font-size: 12.5px; flex: none; }
.pa-st-live { font-size: 11px; font-weight: 600; color: var(--pa-text-muted); display: inline-flex; align-items: center; gap: 5px; }
.pa-st-live i { width: 6px; height: 6px; border-radius: 50%; background: var(--pa-success); display: block; }
.pa-st-filter { width: 220px; }
.pa-st-input { background: none; border: 0; outline: 0; font: inherit; color: var(--pa-text); width: 100%; padding: 0; }
.pa-st-input::placeholder { color: var(--pa-text-placeholder); }
.pa-st-tool { height: 24px; padding: 0 7px; gap: 5px; border-radius: 4px; display: inline-flex; align-items: center; color: var(--pa-text-muted); cursor: pointer; }
.pa-st-tool:hover { background: var(--pa-ghost-element-hover); }
.pa-st-tool.on { background: var(--pa-element-selected); color: var(--pa-text); }
.pa-st-logs { flex: 1; padding: 8px 14px; font-size: 13px; line-height: 20px; overflow: hidden; }
.pa-st-line { display: flex; gap: 10px; white-space: pre; }
</style>
