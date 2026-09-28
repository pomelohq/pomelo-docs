<script setup>
import Icon from './Icon.vue'
import Keys from '../Keys.vue'
// items: [{ text, keys, icon, danger, disabled, submenu }] or '-' for a separator.
defineProps({ items: { type: Array, required: true }, width: { type: Number, default: 240 } })
</script>

<template>
  <div class="pa-cmenu" :style="{ width: width + 'px' }">
    <template v-for="(item, i) in items" :key="i">
      <div v-if="item === '-'" class="pa-menu-sep" />
      <div v-else class="pa-cmenu-row" :class="{ danger: item.danger, disabled: item.disabled }">
        <span class="pa-cmenu-mark"><Icon v-if="item.icon" :name="item.icon" :size="12" :class="item.icon === 'sparkle' ? 'pa-accent' : 'icon-muted'" /></span>
        <span class="grow">{{ item.text }}</span>
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
.pa-cmenu-row:hover { background: var(--pa-element-hover); }
.pa-cmenu-row.danger { color: var(--pa-error); }
.pa-cmenu-row.disabled { color: var(--pa-text-disabled); }
.pa-cmenu-mark { width: 12px; display: flex; }
.pa .pa-accent { color: var(--pa-icon-accent); }
</style>
