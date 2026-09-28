<script setup>
import Icon from './Icon.vue'
const icons = { Ask: 'help_circle', Review: 'search', 'Second opinion': 'messages', Fix: 'wrench' }
defineProps({
  role: { type: String, default: 'Ask' },
  edit: { type: Boolean, default: false },
  started: { type: String, default: 'Auto: fork - 9.3k' },
})
</script>

<template>
  <div class="pa-side-bar">
    <Icon :name="icons[role]" :size="13" class="icon-muted" />
    <span>{{ role }}</span>
    <span class="pa-access" :class="{ edit }">{{ edit ? 'can edit' : 'read-only' }}</span>
    <span class="pa-started"><Icon name="branch" :size="12" />{{ started }}</span>
    <span class="grow" />
    <span class="pa-send"><Icon name="return" :size="12" />Send to main</span>
    <span class="pa-archive"><Icon name="archive" :size="14" /></span>
  </div>
</template>

<style>
.pa-side-bar { flex: none; height: 39px; padding: 0 10px; gap: 8px; display: flex; align-items: center; font-size: 13px;
  background: var(--pa-toolbar-background); border-bottom: 1px solid var(--pa-border); }
.pa-started { height: 24px; padding: 0 9px; gap: 5px; border-radius: 12px; display: inline-flex; align-items: center;
  font-size: 12.5px; border: 1px solid var(--pa-border-variant); white-space: nowrap; }
.pa-send { height: 26px; padding: 0 10px; gap: 6px; border-radius: 5px; display: inline-flex; align-items: center;
  font-size: 12.5px; border: 1px solid var(--pa-border-variant); white-space: nowrap; }
.pa-send:hover, .pa-archive:hover { background: var(--pa-ghost-element-hover); }
.pa-archive { width: 26px; height: 26px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--pa-icon-muted); }
</style>
