<script setup>
import Icon from './Icon.vue'

// tabs: [{ title, icon, detail, active, preview, pinned, dirty, size }]; buttons: trailing icon names.
defineProps({
  tabs: { type: Array, required: true },
  buttons: { type: Array, default: () => [] },
  nav: { type: Boolean, default: false },
})
</script>

<template>
  <div class="pa-tabs">
    <template v-if="nav">
      <div class="pa-tab-btn"><Icon name="arrow_left" :size="15" /></div>
      <div class="pa-tab-btn dim"><Icon name="arrow_right" :size="15" /></div>
      <div class="pa-tab-sep" />
    </template>
    <div v-for="tab in tabs" :key="tab.title" class="pa-tab" :class="{ active: tab.active, preview: tab.preview }">
      <span v-if="tab.dirty" class="pa-tab-dirty" />
      <Icon v-if="tab.icon" :name="tab.icon" :size="tab.iconSize || 14" class="pa-tab-icon" />
      <span class="pa-tab-title" :style="{ fontSize: (tab.size || 13) + 'px' }">{{ tab.title }}</span>
      <span v-if="tab.detail" class="placeholder" :style="{ fontSize: (tab.size || 13) + 'px' }">{{ tab.detail }}</span>
      <span class="pa-tab-close" :class="{ pinned: tab.pinned }"><Icon :name="tab.pinned ? 'pin' : 'close'" :size="11" /></span>
    </div>
    <div class="pa-tab-fill" />
    <template v-if="buttons.length">
      <div class="pa-tab-sep" />
      <div v-for="button in buttons" :key="button" class="pa-tab-btn"><Icon :name="button" :size="13" /></div>
    </template>
  </div>
</template>

<style>
.pa-tabs { flex: none; height: 32px; display: flex; background: var(--pa-tab-bar-background);
  border-bottom: 1px solid var(--pa-border); }
.pa-tab { position: relative; display: flex; align-items: center; gap: 6px; padding: 0 10px; height: 32px;
  background: var(--pa-tab-inactive-background); border-right: 1px solid var(--pa-border); color: var(--pa-text-muted);
  margin-bottom: -1px; border-bottom: 1px solid var(--pa-border); }
.pa-tab.active { background: var(--pa-tab-active-background); color: var(--pa-text); border-bottom-color: var(--pa-tab-active-background); }
.pa-tab.preview .pa-tab-title { font-style: italic; }
.pa-tab-icon { color: var(--pa-icon-muted); }
.pa-tab-dirty { width: 6px; height: 6px; border-radius: 50%; background: var(--pa-text-accent); margin: 0 3px; }
.pa-tab-close { width: 16px; height: 16px; border-radius: 4px; display: flex; align-items: center; justify-content: center;
  color: var(--pa-icon-muted); visibility: hidden; }
.pa-tab:hover .pa-tab-close, .pa-tab-close.pinned { visibility: visible; }
.pa-tab-close:hover { background: var(--pa-ghost-element-hover); }
.pa-tab-fill { flex: 1; }
.pa-tab-sep { width: 1px; background: var(--pa-border); }
.pa-tab-btn { width: 26px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--pa-icon-muted); }
.pa-tab-btn:hover { color: var(--pa-icon); }
.pa-tab-btn.dim { opacity: 0.35; }
</style>
