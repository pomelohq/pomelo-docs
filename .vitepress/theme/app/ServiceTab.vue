<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'
import './data.css'
const all = [
  ['15:40:00', '[vite] hmr update /src/pages/Login.tsx', ''],
  ['15:40:07', '[vite] page reload src/main.tsx', ''],
  ['15:40:14', 'Warning: something is deprecated', 'warn'],
  ['15:40:21', '[vite] page reload src/main.tsx', ''],
  ['15:40:28', "Error: could not resolve 'vite-plugin-svgr'", 'err'],
  ['15:40:35', '[vite] hmr update /src/components/Button.tsx', ''],
]
const query = ref('')
const follow = ref(true)
const wrap = ref(false)
const paused = ref(false)
const lines = computed(() => all.filter(l => !query.value || l[1].toLowerCase().includes(query.value.toLowerCase())))
</script>

<template>
  <div class="pa-st">
    <div class="row pa-st-head">
      <i class="pa-st-dot" /><span class="muted">api</span><span class="muted">&gt;</span>
      <span class="pa-st-name">server</span><span class="pa-st-tag mono">dev</span>
      <span class="grow" />
      <span class="pa-st-btn dim"><Icon name="play" :size="10" />Start</span>
      <span class="pa-st-btn"><Icon name="stop" :size="10" />Stop</span>
      <span class="pa-st-btn"><Icon name="rotate_cw" :size="11" />Restart</span>
      <span class="pa-st-btn"><Icon name="arrow_up_right" :size="11" />Open in browser</span>
      <span class="pa-st-more"><Icon name="ellipsis" :size="14" /></span>
    </div>
    <div class="pa-st-facts">
      <div class="pa-st-fact"><span class="pa-dt-label">Status</span><span class="pa-st-pill">Running - up 12m</span></div>
      <div class="pa-st-fact"><span class="pa-dt-label">PID</span><span>48213</span></div>
      <div />
      <div class="pa-st-fact wide"><span class="pa-dt-label">URL</span><span class="row accent" style="gap: 8px">http://server.api.feat-login.localhost:8767<Icon name="copy" :size="12" class="icon-muted" /></span></div>
      <div class="pa-st-fact"><span class="pa-dt-label">Port</span><span><b>:3000</b><span class="pa-link pa-st-change">Change</span></span></div>
      <div class="pa-st-fact"><span class="pa-dt-label">Env profile</span><span class="pa-st-chip">local</span></div>
      <div class="pa-st-fact"><span class="pa-dt-label">Env file</span><span>api/.env.development<span class="pa-link pa-st-change">Open</span></span></div>
      <div class="pa-st-fact"><span class="pa-dt-label">Mode</span><span class="pa-st-chip">dev</span></div>
      <div class="pa-st-fact full"><span class="pa-dt-label">Command</span><span class="row pa-st-cmd"><i>$</i>bin/rails server -p $PORT<span class="grow" /><Icon name="copy" :size="12" class="icon-muted" /></span></div>
    </div>
    <div class="row pa-st-logbar">
      <span class="pa-dt-label pa-st-live">Logs <i /><b>live</b></span>
      <label class="pa-st-filter"><Icon name="search" :size="12" class="icon-muted" /><input v-model="query" placeholder="Filter lines" spellcheck="false" /></label>
      <span class="pa-st-tool" :class="{ on: paused }" @click="paused = !paused"><Icon name="pause" :size="12" />Pause</span>
      <span class="pa-st-tool"><Icon name="trash" :size="12" />Clear</span>
      <span class="pa-st-tool" :class="{ on: follow }" @click="follow = !follow"><Icon name="arrow_down" :size="12" />Follow</span>
      <span class="pa-st-tool" :class="{ on: wrap }" @click="wrap = !wrap"><Icon name="return" :size="12" />Wrap</span>
      <span class="grow" />
      <span class="placeholder">{{ query ? `${lines.length} matching` : `${all.length} lines` }}</span>
    </div>
    <div class="pa-st-logs mono">
      <div v-for="l in lines" :key="l[0]" class="pa-st-line"><span class="placeholder">{{ l[0] }}</span><span :class="l[2]">{{ l[1] }}</span></div>
    </div>
  </div>
</template>

<style>
.pa-st { height: 100%; display: flex; flex-direction: column; background: var(--pa-editor-background); font-size: 13px; }
.pa-st-head { flex: none; height: 45px; padding: 0 14px 0 17px; gap: 7px; font-size: 14px; box-shadow: inset 0 -1px 0 var(--pa-border-variant); }
.pa-st-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--pa-success); display: block; margin-right: 6px; }
.pa-st-name { font-weight: 600; }
.pa-st-tag { height: 17px; padding: 0 4px; border-radius: 3px; box-shadow: inset 0 0 0 1px var(--pa-border-variant); font-size: 11px;
  display: inline-flex; align-items: center; color: var(--pa-text-placeholder); }
.pa-st-btn { height: 22px; padding: 0 7px; gap: 6px; border-radius: 4px; display: inline-flex; align-items: center; font-size: 12px; white-space: nowrap;
  background: var(--pa-element-background); box-shadow: inset 0 0 0 1px var(--pa-border-variant); cursor: pointer; }
.pa-st-btn:hover { background: var(--pa-element-hover); }
.pa-st-btn.dim { opacity: 0.45; }
.pa-st-more { width: 24px; display: flex; justify-content: center; color: var(--pa-icon-muted); margin-left: 6px; }
.pa-st-facts { flex: none; margin: 4px 16px 14px; padding: 14px 16px 14px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px 20px;
  border-radius: 10px; background: var(--pa-element-background); box-shadow: inset 0 0 0 1px var(--pa-border-variant); }
.pa-st-fact { display: flex; flex-direction: column; gap: 8px; min-width: 0; white-space: nowrap; }
.pa-st-fact.wide { grid-column: span 2; }
.pa-st-fact.full { grid-column: 1 / -1; gap: 6px; }
.pa-st-fact .pa-dt-label { font-size: 10.5px; color: var(--pa-text-muted); }
.pa-st-pill { align-self: flex-start; height: 22px; padding: 0 10px 0 8px; gap: 7px; border-radius: 11px; display: inline-flex; align-items: center; font-weight: 500;
  color: var(--pa-success); background: color-mix(in srgb, var(--pa-success) 14%, transparent); }
.pa-st-pill::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: var(--pa-success); }
.pa-st-change { margin-left: 8px; }
.pa-st-chip { align-self: flex-start; padding: 2px 8px; border-radius: 4px; background: color-mix(in srgb, var(--pa-text) 6%, transparent); font-size: 12px; }
.pa-st-cmd { height: 32px; margin-top: 0; padding: 0 10px; gap: 7px; border-radius: 6px; background: var(--pa-background); }
.pa-st-cmd i { font-style: normal; color: var(--pa-text-placeholder); }
.pa-st-logbar { flex: none; height: 40px; padding: 0 14px; gap: 8px; font-size: 12px; box-shadow: inset 0 1px 0 var(--pa-border-variant), inset 0 -1px 0 var(--pa-border-variant); }
.pa-st-live { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--pa-text-muted); }
.pa-st-live i { width: 6px; height: 6px; border-radius: 50%; background: var(--pa-success); display: block; margin-left: 2px; }
.pa-st-live b { font-weight: 400; text-transform: none; letter-spacing: 0; font-size: 12.5px; color: var(--pa-success); }
.pa-st-filter { width: 280px; height: 26px; padding: 0 9px; gap: 8px; border-radius: 6px; display: flex; align-items: center; margin-right: 2px;
  background: var(--pa-editor-background); box-shadow: inset 0 0 0 1px var(--pa-border-variant); }
.pa-st-filter input { flex: 1; min-width: 0; border: 0; outline: 0; padding: 0; background: none; font: inherit; color: var(--pa-text); }
.pa-st-filter input::placeholder { color: var(--pa-text-placeholder); }
.pa-st-tool { height: 26px; padding: 0 9px; gap: 6px; font-size: 12.5px; border-radius: 5px; display: inline-flex; align-items: center; color: var(--pa-text-muted); cursor: pointer; }
.pa-st-tool:hover { background: var(--pa-ghost-element-hover); }
.pa-st-tool.on { background: var(--pa-element-selected); color: var(--pa-text); }
.pa-st-logs { flex: 1; padding: 6px 14px; font-size: 12.5px; line-height: 20px; overflow: hidden; }
.pa-st-line { display: flex; gap: 16px; white-space: pre; }
</style>
