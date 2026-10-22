<script setup>
import { ref } from 'vue'
import './kit.css'

const days = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'today']
const series = [
  ['feat-login', 'var(--pa-text-accent)', [10, 0, 6.3, 0, 0.6, 0, 0]],
  ['PROJ-101', 'var(--pa-success)', [0, 1.4, 0, 0.9, 0, 3.0, 3.9]],
  ['main', 'var(--pa-warning)', [0, 0, 0, 0, 0, 0, 1.4]],
]
const range = ref(1)
const max = 10
</script>

<template>
  <div class="pa-uch">
    <div class="pa-uch-head">
      <div class="pa-uch-stat"><span class="pa-uch-big">$67.09</span><span class="pk-small pk-2">API-equivalent cost</span></div>
      <div class="pk-seg"><span v-for="(r, i) in ['Today', '7 days', '30 days']" :key="r" :class="{ on: range === i }" @click="range = i">{{ r }}</span></div>
    </div>
    <span class="pk-label">By day</span>
    <div class="pa-uch-chart">
      <div v-for="(day, i) in days" :key="day" class="pa-uch-col">
        <div class="pa-uch-stack"><i v-for="[name, color, values] in series" :key="name" :style="{ height: (values[i] / max) * 100 + '%', background: color }" /></div>
        <span class="pk-small pk-3">{{ day }}</span>
      </div>
    </div>
    <div class="pa-uch-legend pk-small">
      <span v-for="[name, color] in series" :key="name"><i :style="{ background: color }" />{{ name }}</span>
    </div>
  </div>
</template>

<style>
.pa-uch { height: 100%; padding: 14px 18px; background: var(--pa-editor-background); display: flex; flex-direction: column; gap: 8px; }
.pa-uch-head { display: flex; align-items: flex-start; justify-content: space-between; }
.pa-uch-stat { display: flex; flex-direction: column; gap: 2px; }
.pa-uch-big { font-size: 20px; line-height: 26px; font-weight: 600; }
.pa-uch-chart { flex: 1; min-height: 0; display: flex; gap: 6px; }
.pa-uch .pk-seg { background: var(--pa-element-background); }
.pa-uch .pk-seg > span.on { background: var(--pa-element-selected); box-shadow: none; }
.pa-uch-col { flex: 1; display: flex; flex-direction: column; gap: 4px; text-align: center; }
.pa-uch-stack { flex: 1; display: flex; flex-direction: column-reverse; border-bottom: 1px solid var(--pa-border-variant); }
.pa-uch-stack i { display: block; width: 100%; }
.pa-uch-legend { display: flex; gap: 12px; color: var(--pa-text-muted); }
.pa-uch-legend span { display: inline-flex; align-items: center; gap: 6px; }
.pa-uch-legend i { width: 7px; height: 7px; border-radius: 50%; display: block; }
</style>
