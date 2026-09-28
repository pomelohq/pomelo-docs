<script setup>
import { ref } from 'vue'
import Icon from './Icon.vue'
const rows = [
  ['main', 'main', 'myproject_main', 4100],
  ['Login page', 'feat-login', 'myproject_feat_login', 4101],
  ['Checkout flow', 'proj-101', 'myproject_proj-101-checkout', 4102],
]
const hover = ref(1)
</script>

<template>
  <div class="pa-px">
    <div class="row pa-px-head"><span class="pa-px-name">Workspace</span><span class="pa-px-url">web, through the dev proxy</span><span class="pa-px-db">database</span><span class="pa-px-port">api port</span></div>
    <div v-for="([name, label, db, port], i) in rows" :key="name" class="row pa-px-row" :class="{ on: hover === i }" @mouseenter="hover = i">
      <span class="pa-px-name trunc">{{ name }}</span>
      <span class="mono pa-px-url"><Icon name="arrow_up_right" :size="11" class="icon-muted" />http://vite.web.<b>{{ label }}</b>.localhost:8767</span>
      <span class="mono muted pa-px-db trunc">{{ db }}</span>
      <span class="mono muted pa-px-port">:{{ port }}</span>
    </div>
  </div>
</template>

<style>
.pa-px { padding: 8px; background: var(--pa-panel-background); height: 100%; font-size: 13px; }
.pa-px-head { height: 28px; padding: 0 10px; gap: 12px; font-size: 11px; font-weight: 600; color: var(--pa-text-placeholder); text-transform: uppercase; }
.pa-px-row { height: 34px; padding: 0 10px; gap: 12px; border-radius: 6px; }
.pa-px-row.on { background: var(--pa-element-selected); }
.pa-px-name { width: 110px; flex: none; white-space: nowrap; }
.pa-px-url { width: 330px; flex: none; display: inline-flex; gap: 6px; align-items: center; font-size: 12px; }
.pa-px-url b { color: var(--pa-text-accent); font-weight: 400; }
.pa-px-db { width: 190px; flex: none; font-size: 12px; }
.pa-px-port { width: 60px; flex: none; font-size: 12px; text-align: right; }
</style>
