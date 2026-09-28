<script setup>
import { ref } from 'vue'
const days = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'today']
const series = [
  ['feat-login', 'var(--pa-ansi-4)', [9.8, 0, 6.2, 0, 0.4, 0, 0]],
  ['PROJ-101', 'var(--pa-ansi-2)', [0, 1.3, 0, 0.9, 0, 3.0, 3.9]],
  ['main', 'var(--pa-ansi-3)', [0, 0, 0, 0, 0, 0, 1.4]],
]
const range = ref('7 days')
const max = 10
</script>

<template>
  <div class="pa-uc">
    <div class="row pa-uc-head">
      <div class="col grow"><span class="pa-uc-big">$67.09</span><span class="muted pa-uc-small">API-equivalent cost - 7 days</span></div>
      <div class="pa-uc-seg">
        <span v-for="r in ['Today', '7 days', '30 days']" :key="r" :class="{ on: range === r }" @click="range = r">{{ r }}</span>
      </div>
    </div>
    <div class="pa-uc-chart">
      <div v-for="(day, i) in days" :key="day" class="pa-uc-col">
        <div class="pa-uc-stack">
          <i v-for="[name, color, values] in series" :key="name" :style="{ height: (values[i] / max) * 100 + '%', background: color }" />
        </div>
        <span class="placeholder">{{ day }}</span>
      </div>
    </div>
    <div class="row pa-uc-legend">
      <span v-for="[name, color] in series" :key="name"><i :style="{ background: color }" />{{ name }}</span>
    </div>
  </div>
</template>

<style>
.pa-uc { height: 100%; padding: 16px 18px; background: var(--pa-editor-background); display: flex; flex-direction: column; gap: 12px; }
.pa-uc-head { align-items: flex-start; }
.pa-uc-big { font-size: 22px; font-weight: 600; }
.pa-uc-small { font-size: 12px; }
.pa-uc-seg { display: flex; padding: 2px; border-radius: 6px; background: var(--pa-panel-background); font-size: 12px; }
.pa-uc-seg span { padding: 3px 10px; border-radius: 4px; color: var(--pa-text-muted); cursor: pointer; }
.pa-uc-seg span.on { background: var(--pa-element-selected); color: var(--pa-text); }
.pa-uc-chart { flex: 1; display: flex; gap: 6px; align-items: stretch; border-bottom: 1px solid var(--pa-border-variant); padding-bottom: 0; }
.pa-uc-col { flex: 1; display: flex; flex-direction: column; font-size: 11px; text-align: center; gap: 4px; }
.pa-uc-stack { flex: 1; display: flex; flex-direction: column-reverse; }
.pa-uc-stack i { display: block; width: 100%; }
.pa-uc-legend { gap: 14px; font-size: 12px; color: var(--pa-text-muted); }
.pa-uc-legend span { display: inline-flex; align-items: center; gap: 5px; }
.pa-uc-legend i { width: 7px; height: 7px; border-radius: 50%; display: block; }
</style>
