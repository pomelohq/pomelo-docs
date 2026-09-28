<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'
const columns = [['id', 40], ['email', 190], ['name', 170], ['role', 80], ['created_at', 240]]
const people = [
  ['ada@example.com', 'Ada Lovelace', 'admin'], ['alan@example.com', 'Alan Turing', 'member'],
  ['grace@example.com', 'Grace Hopper', 'member'], ['linus@example.com', 'Linus Torvalds', 'member'],
  ['margaret@example.com', 'Margaret Hamilton', 'owner'], ['ken@example.com', 'Ken Thompson', 'member'],
  ['barbara@example.com', 'Barbara Liskov', 'member'], ['dennis@example.com', 'Dennis Ritchie', 'member'],
]
const rows = people.map((p, i) => [i + 1, ...p, `2026-09-${String(8 + i * 3).padStart(2, '0')} 21:00:58+00`])
const sort = ref({ column: 0, desc: false })
const sorted = computed(() => [...rows].sort((a, b) => {
  const x = a[sort.value.column], y = b[sort.value.column]
  return (x < y ? -1 : x > y ? 1 : 0) * (sort.value.desc ? -1 : 1)
}))
const pick = i => { sort.value = { column: i, desc: sort.value.column === i ? !sort.value.desc : false } }
const cell = ref('')
</script>

<template>
  <div class="pa-table">
    <div class="row pa-table-bar">
      <Icon name="table" :size="12" class="icon-muted" /><span>users</span><span class="placeholder pa-xs">main</span>
      <div class="pa-input grow"><span class="mono muted">WHERE</span><span class="mono placeholder">id &gt; 10</span></div>
      <div class="pa-input grow"><span class="mono muted">ORDER BY</span><span class="mono placeholder">created_at DESC</span></div>
      <span class="pa-rows">500 rows</span>
      <Icon name="rotate_cw" :size="13" class="icon-muted" />
    </div>
    <div class="pa-grid mono">
      <div class="pa-grid-head">
        <span class="pa-grid-num" />
        <span v-for="([name, width], i) in columns" :key="name" class="pa-grid-h" :style="{ width: width + 'px' }" @click="pick(i)">
          {{ name }}<Icon v-if="sort.column === i" :name="sort.desc ? 'arrow_down' : 'arrow_up'" :size="10" class="pa-sort" />
        </span>
      </div>
      <div v-for="(row, r) in sorted" :key="row[0]" class="pa-grid-row" :class="{ odd: r % 2 }">
        <span class="pa-grid-num">{{ r + 1 }}</span>
        <span v-for="(value, c) in row" :key="c" class="pa-grid-c" :class="{ on: cell === `${row[0]}-${c}` }"
          :style="{ width: columns[c][1] + 'px' }" @click="cell = `${row[0]}-${c}`">{{ value }}</span>
      </div>
    </div>
    <div class="row pa-table-page">
      <Icon name="chevron_left" :size="12" class="icon-muted" /><Icon name="arrow_left" :size="12" class="icon-muted" />
      <span class="muted">1-8 of 8</span><Icon name="arrow_right" :size="12" class="icon-muted" />
      <span class="grow" /><span class="pa-rows">Export CSV</span>
    </div>
  </div>
</template>

<style>
.pa-table { height: 100%; display: flex; flex-direction: column; background: var(--pa-editor-background); }
.pa-table-bar { height: 36px; padding: 0 8px; gap: 8px; font-size: 13px; border-bottom: 1px solid var(--pa-border-variant); flex: none; }
.pa-input { height: 24px; padding: 0 6px; gap: 8px; border-radius: 4px; display: flex; align-items: center; font-size: 11px;
  border: 1px solid var(--pa-border-variant); }
.pa-rows { height: 22px; padding: 0 6px; border-radius: 4px; border: 1px solid var(--pa-border-variant); font-size: 12px;
  display: inline-flex; align-items: center; white-space: nowrap; }
.pa-grid { flex: 1; min-height: 0; overflow: hidden; font-size: 12px; }
.pa-grid-head { height: 26px; display: flex; border-bottom: 1px solid var(--pa-border-variant); color: var(--pa-text-muted); }
.pa-grid-h { padding: 0 4px; display: flex; align-items: center; gap: 4px; border-right: 1px solid color-mix(in srgb, var(--pa-border) 80%, transparent); cursor: pointer; }
.pa-grid-h:hover { color: var(--pa-text); }
.pa-sort { color: var(--pa-icon-accent); }
.pa-grid-row { height: 22px; display: flex; }
.pa-grid-row.odd { background: color-mix(in srgb, var(--pa-text) 5%, transparent); }
.pa-grid-row:hover { background: color-mix(in srgb, var(--pa-element-hover) 60%, transparent); }
.pa-grid-num { width: 40px; flex: none; background: var(--pa-panel-background); color: var(--pa-text-muted); font-size: 11px;
  display: flex; align-items: center; justify-content: center; }
.pa-grid-c { padding: 0 4px; display: flex; align-items: center; overflow: hidden; white-space: nowrap; flex: none; }
.pa-grid-c.on { background: var(--pa-element-selected); }
.pa-table-page { height: 28px; padding: 0 8px; gap: 4px; font-size: 12px; border-top: 1px solid var(--pa-border-variant); flex: none; }
</style>
