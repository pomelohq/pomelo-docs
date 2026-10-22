<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'
import Keys from '../Keys.vue'
// items: [{ text, icon, keys, hint, submenu, danger, disabled, checked, hover }] or '-' before a group.
// header: the muted first row naming what was right-clicked. hint is a key, or a submenu's current value.
const props = defineProps({
  items: { type: Array, required: true },
  header: { type: String, default: '' },
  width: { type: Number, default: 200 },
})
const marks = computed(() => props.items.some(item => item !== '-' && (item.icon || item.checked)))
const tone = item => item.disabled ? 'var(--pa-text-disabled)' : item.danger ? 'var(--pa-error)'
  : item.icon === 'sparkle' ? 'var(--pa-icon-accent)' : 'var(--pa-icon-muted)'
</script>

<template>
  <div class="pa-cmenu" :style="{ width: width + 'px' }">
    <div v-if="header" class="pa-cmenu-row header"><span class="trunc">{{ header }}</span></div>
    <template v-for="(item, i) in items" :key="i">
      <div v-if="item === '-'" class="pa-cmenu-sep" />
      <div v-else class="pa-cmenu-row" :class="{ danger: item.danger, disabled: item.disabled, hover: item.hover }">
        <span v-if="marks" class="pa-cmenu-mark">
          <Icon v-if="item.checked" name="check" :size="12" />
          <Icon v-else-if="item.icon" :name="item.icon" :size="12" :style="{ color: tone(item) }" />
        </span>
        <span class="grow trunc">{{ item.text }}</span>
        <template v-if="item.submenu">
          <span v-if="item.hint" class="pa-cmenu-hint">{{ item.hint }}</span>
          <Icon name="chevron_right" :size="12" class="pa-cmenu-chev" />
        </template>
        <Keys v-else-if="item.keys || item.hint" :k="item.keys || item.hint.toLowerCase()" class="pa-keys" />
      </div>
    </template>
  </div>
</template>

<style>
.pa-cmenu { padding: 4px; border-radius: 8px; background: var(--pa-elevated-surface-background); outline: 1px solid var(--pa-border); outline-offset: -1px;
  box-shadow: 0 1px 0 2px rgba(0, 0, 0, 0.14); }
.pa-cmenu-row { height: 26px; padding: 0 8px; gap: 6px; border-radius: 5px; display: flex; align-items: center; font-size: 13px; color: var(--pa-text); }
.pa-cmenu-row.hover, .pa-cmenu-row:not(.header):not(.disabled):hover { background: rgba(255, 255, 255, 0.05); }
html:not(.dark) .pa-cmenu-row.hover, html:not(.dark) .pa-cmenu-row:not(.header):not(.disabled):hover { background: rgba(0, 0, 0, 0.04); }
.pa-cmenu-row.danger { color: var(--pa-error); }
.pa-cmenu-row.disabled { color: var(--pa-text-disabled); }
.pa-cmenu-row.header { font-size: 12px; color: var(--pa-text-muted); }
.pa-cmenu-sep { height: 5px; padding: 2px 0; }
.pa-cmenu-sep::after { content: ''; display: block; height: 1px; background: var(--pa-border); }
.pa-cmenu-mark { width: 12px; flex: none; display: flex; }
.pa-cmenu-hint { font-size: 12px; color: var(--pa-text-muted); }
.pa-cmenu-chev { color: var(--pa-icon-muted); }
.pa .pa-accent { color: var(--pa-icon-accent); }
</style>
