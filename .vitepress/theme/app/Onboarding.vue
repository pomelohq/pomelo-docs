<script setup>
import Icon from './Icon.vue'
import './kit.css'

// phases: [label, done | running | pending | failed, note]
defineProps({
  project: { type: String, default: 'myproject' },
  phases: {
    type: Array,
    default: () => [
      ['Clone repositories', 'done', 'worker cloned, api and web linked'],
      ['Scan', 'done', '3 repos, 2 shared services'],
      ['Configure with Claude Code', 'running', 'web: services dev (pnpm vite --port $PORT)'],
      ['Verify', 'pending'],
    ],
  },
})
const icons = { done: 'check', running: 'load_circle', pending: 'circle', failed: 'x_circle' }
</script>

<template>
  <div class="pa-onb">
    <div class="pa-onb-col">
      <div class="pa-onb-head">
        <span class="pk-title">Setting up {{ project }}</span>
        <span class="pk-body pk-3">Clone, scan, configure, then verify until every repo installs and boots.</span>
      </div>
      <div class="pa-onb-phases">
        <div v-for="[label, state, note] in phases" :key="label" class="pa-onb-phase" :class="state">
          <Icon :name="icons[state]" :size="state === 'pending' ? 8 : 12" class="pa-onb-mark" />
          <span class="pk-body grow">{{ label }}</span>
          <span v-if="note" class="pk-small pk-3 trunc">{{ note }}</span>
        </div>
      </div>
      <slot />
    </div>
    <div class="pa-onb-foot">
      <span class="pk-btn ghost">Skip the agent</span>
      <span class="grow" />
      <span class="pk-btn ghost">Hide agent CLI</span>
      <span class="pk-btn ghost">Pause</span>
      <span class="pk-btn secondary">Cancel</span>
    </div>
  </div>
</template>

<style>
.pa-onb { height: 100%; display: flex; flex-direction: column; background: var(--pa-editor-background); overflow: hidden; }
.pa-onb-col { flex: 1; width: 640px; max-width: calc(100% - 48px); margin: 0 auto; padding: 36px 0 20px; display: flex; flex-direction: column; gap: 16px; overflow: hidden; }
.pa-onb-head { display: flex; flex-direction: column; gap: 4px; }
.pa-onb-phases { display: flex; flex-direction: column; gap: 2px; padding: 6px; border-radius: 6px; background: var(--pa-panel-background); }
.pa-onb-phase { display: flex; align-items: center; gap: 10px; height: 34px; padding: 0 8px; color: var(--pa-text-placeholder); min-width: 0; }
.pa-onb-mark { width: 14px !important; justify-content: center; align-items: center; }
.pa-onb-phase.done .pk-body { color: var(--pa-text-muted); }
.pa-onb-phase.done .pa-onb-mark { color: var(--pa-success); }
.pa-onb-phase.running { color: var(--pa-text); background: var(--pa-element-selected); border-radius: 4px; }
.pa-onb-phase.running .pa-onb-mark { color: var(--pa-text-accent); }
.pa-onb-phase.failed .pa-onb-mark, .pa-onb-phase.failed .pk-body { color: var(--pa-error); }
.pa-onb-foot { flex: none; display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding: 12px 16px; background: var(--pa-panel-background); }
</style>
