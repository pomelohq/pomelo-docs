<script setup>
import Icon from './Icon.vue'

// tabs: [{ title, icon, detail, active, preview, pinned, dirty, size }]; buttons: trailing icon names.
// nav: the back and forward buttons a center pane leads with.
defineProps({
  tabs: { type: Array, required: true },
  buttons: { type: Array, default: () => [] },
  nav: { type: Boolean, default: false },
  canForward: { type: Boolean, default: false },
})
</script>

<template>
  <div class="pa-tabs">
    <span v-if="nav" class="pa-tabs-nav">
      <span class="pa-tab-btn"><Icon name="arrow_left" :size="13" /></span>
      <span class="pa-tab-btn" :class="{ off: !canForward }"><Icon name="arrow_right" :size="13" /></span>
    </span>
    <span class="pa-tabs-list">
      <span v-for="tab in tabs" :key="tab.title" class="pa-tab" :class="{ active: tab.active, preview: tab.preview }"
        :style="tab.size ? { fontSize: tab.size + 'px' } : undefined">
        <Icon v-if="tab.icon" :name="tab.icon" :size="tab.iconSize || 14" class="pa-tab-icon" />
        <span class="pa-tab-title">{{ tab.title }}</span>
        <span v-if="tab.detail" class="pa-tab-detail">{{ tab.detail }}</span>
        <span v-if="tab.dirty" class="pa-tab-dirty" />
        <Icon v-else :name="tab.pinned ? 'pin' : 'close'" :size="12" class="pa-tab-close" />
      </span>
    </span>
    <span v-if="buttons.length" class="pa-tabs-actions">
      <span v-for="button in buttons" :key="button" class="pa-tab-btn"><Icon :name="button" :size="13" /></span>
    </span>
  </div>
</template>

<style>
.pa-tabs { flex: none; height: 34px; padding: 0 6px; display: flex; align-items: stretch; background: var(--pa-panel-background); }
.pa-tabs-nav { display: inline-flex; align-items: center; gap: 2px; padding-right: 6px; margin-right: 4px;
  box-shadow: inset -1px 0 0 var(--pa-border-variant); }
.pa-tabs-list { flex: 1; min-width: 0; display: flex; align-items: center; gap: 2px; overflow: hidden; }
.pa-tabs-actions { display: inline-flex; align-items: center; gap: 2px; padding-left: 6px; }
.pa-tab-btn { width: 26px; height: 24px; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center;
  color: var(--pa-text-placeholder); }
.pa-tab-btn:hover { background: var(--pa-element-hover); color: var(--pa-text); }
.pa-tab-btn.off { opacity: 0.4; }
.pa-tab-btn.off:hover { background: none; color: var(--pa-text-placeholder); }
.pa-tab { position: relative; flex: 0 1 auto; min-width: min(100px, max-content); height: 26px; padding: 0 10px; gap: 6px;
  display: inline-flex; align-items: center; white-space: nowrap; border-radius: 6px; font-size: 13px; line-height: 1;
  color: var(--pa-text-muted); }
.pa-tab:hover { background: var(--pa-element-hover); color: var(--pa-text); }
.pa-tab.active { flex-shrink: 0.4; background: var(--pa-editor-background); color: var(--pa-text); font-weight: 500;
  box-shadow: 0 1px 2px #00000059, 0 4px 12px #00000033; }
html:not(.dark) .pa-tab.active { box-shadow: 0 1px 2px #1d17301a, 0 4px 12px #1d17300f; }
.pa-tab.preview .pa-tab-title { font-style: italic; }
.pa-tab-title { min-width: 0; max-width: 220px; overflow: hidden; text-overflow: ellipsis; }
.pa-tab-detail { color: var(--pa-text-placeholder); }
.pa-tab-close { color: var(--pa-text-placeholder); }
.pa-tab-dirty { flex: none; width: 7px; height: 7px; border-radius: 50%; background: var(--pa-text-muted); }
</style>
