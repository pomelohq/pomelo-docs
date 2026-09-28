<script setup>
import Icon from './Icon.vue'
import Keys from '../Keys.vue'
// items: [{ text, icon, keys, hint, submenu, danger, disabled, checked }] or '-' before a group.
// header: the muted first row naming what was right-clicked.
defineProps({
  items: { type: Array, required: true },
  header: { type: String, default: '' },
  width: { type: Number, default: 240 },
})
const tone = item => item.disabled ? 'var(--pa-text-disabled)' : item.danger ? 'var(--pa-error)'
  : item.icon === 'sparkle' ? 'var(--pa-icon-accent)' : 'var(--pa-icon-muted)'
</script>

<template>
  <div class="pa-cmenu" :style="{ width: width + 'px' }">
    <div v-if="header" class="pa-cmenu-row header"><span class="pa-cmenu-mark" /><span class="trunc">{{ header }}</span></div>
    <template v-for="(item, i) in items" :key="i">
      <div v-if="item === '-'" class="pa-menu-sep" />
      <div v-else class="pa-cmenu-row" :class="{ danger: item.danger, disabled: item.disabled }">
        <span class="pa-cmenu-mark">
          <Icon v-if="item.checked" name="check" :size="12" />
          <Icon v-else-if="item.icon" :name="item.icon" :size="12" :style="{ color: tone(item) }" />
        </span>
        <span class="grow trunc">{{ item.text }}</span>
        <span v-if="item.hint" class="pa-cmenu-hint">{{ item.hint }}</span>
        <Keys v-if="item.keys" :k="item.keys" class="pa-keys" />
        <Icon v-if="item.submenu" name="chevron_right" :size="12" class="icon-muted" />
      </div>
    </template>
  </div>
</template>

<style>
.pa-cmenu { padding: 4px; border-radius: 8px; background: var(--pa-elevated-surface-background); border: 1px solid var(--pa-border);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.3); }
.pa-cmenu-row { height: 26px; padding: 0 8px; gap: 6px; border-radius: 5px; display: flex; align-items: center; font-size: 13px; }
.pa-cmenu-row:not(.header):not(.disabled):hover { background: var(--pa-element-hover); }
.pa-cmenu-row.danger { color: var(--pa-error); }
.pa-cmenu-row.disabled, .pa-cmenu-row.header { color: var(--pa-text-disabled); }
.pa-cmenu-mark { width: 12px; flex: none; display: flex; }
.pa-cmenu-hint { font-size: 12px; color: var(--pa-text-muted); }
.pa .pa-accent { color: var(--pa-icon-accent); }
</style>
