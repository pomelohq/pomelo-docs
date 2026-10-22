<script setup>
import Icon from './Icon.vue'
import './kit.css'

const icons = { Ask: 'help_circle', Review: 'eye', 'Second opinion': 'messages', Fix: 'wrench' }
defineProps({
  role: { type: String, default: 'Ask' },
  edit: { type: Boolean, default: false },
  started: { type: String, default: 'Auto: fork - 9.3k' },
})
</script>

<template>
  <div class="pa-side-bar pk-small">
    <Icon :name="icons[role]" :size="14" class="pa-side-icon" />
    <span>{{ role }}</span>
    <span class="pa-side-tag" :class="{ edit }">{{ edit ? 'can edit' : 'read-only' }}</span>
    <span class="pa-side-context"><Icon name="branch" :size="12" class="pa-side-icon" /><span class="trunc">{{ started }}</span></span>
    <span class="pa-side-right">
      <span class="pk-btn sm secondary"><Icon name="return" :size="14" />Send to main</span>
      <span class="pk-btn sm icon ghost pa-side-icon"><Icon name="archive" :size="14" /></span>
    </span>
  </div>
</template>

<style>
.pa-side-bar { flex: none; display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 10px; white-space: nowrap; min-width: 0;
  background: var(--pa-editor-background); color: var(--pa-text); }
.pa-side-icon { color: var(--pa-text-placeholder); }
.pa-side-tag { flex: none; display: inline-flex; align-items: center; height: 20px; padding: 0 6px; border-radius: 4px; box-shadow: inset 0 0 0 1px var(--pa-border); color: var(--pa-text-muted); }
.pa-side-tag.edit { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--pa-warning) 50%, transparent); color: var(--pa-warning); }
.pa-side-context { display: inline-flex; align-items: center; gap: 5px; height: 24px; padding: 0 9px; border-radius: 12px; min-width: 0; flex: 0 1 auto; overflow: hidden;
  box-shadow: inset 0 0 0 1px var(--pa-border-variant); }
.pa-side-right { margin-left: auto; display: inline-flex; gap: 4px; align-items: center; flex: none; }
</style>
