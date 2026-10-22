<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'
import './kit.css'

// stage: index of the running stage; the ones before it are done and fold into one line.
const props = defineProps({
  name: { type: String, default: 'Login page' },
  ticket: { type: String, default: 'PROJ-118' },
  stage: { type: Number, default: 4 },
  detail: { type: String, default: 'web: node_modules from the store, instant' },
})
const stages = [
  'Validating config and hosts', 'Provisioning workspace', 'Starting shared services and databases',
  'Creating git worktrees (parallel)', 'Configuring repos (parallel)', 'Running setup commands (parallel)',
  'Seeding databases (parallel)', "Saving the workspace's baseline snapshot",
]
const open = computed(() => stages.slice(props.stage).map((label, i) => ({
  label: label.replace(' (parallel)', ''), parallel: label.endsWith(' (parallel)'), running: i === 0,
})))
const progress = computed(() => (props.stage + 0.4) / stages.length)
const [prefix, number] = props.ticket.split('-')
</script>

<template>
  <div class="pa-wc">
    <span class="pa-wc-tile">
      <i :style="{ height: progress * 100 + '%' }" />
      <span class="pa-wc-label"><small>{{ prefix.slice(0, 4) }}</small>{{ number }}</span>
    </span>
    <span class="pa-wc-text">
      <span class="pa-wc-title">{{ name }}</span>
      <span class="pa-wc-sub">{{ open[0].label }}</span>
    </span>
    <span class="pa-wc-pct">{{ Math.round(progress * 100) }}%</span>
    <ol class="pa-wc-steps pk-small">
      <li v-if="stage" class="pa-wc-step done"><Icon name="check" :size="12" /><span>{{ stage }} of {{ stages.length }} steps done</span></li>
      <li v-for="step in open" :key="step.label" class="pa-wc-step" :class="{ running: step.running }">
        <Icon :name="step.running ? 'load_circle' : 'circle'" :size="12" />
        <span class="pa-wc-body">
          <span class="pa-wc-name">{{ step.label }}<span v-if="step.parallel" class="pa-wc-tag">parallel</span></span>
          <span v-if="step.running && detail" class="pk-3">{{ detail }}</span>
        </span>
      </li>
    </ol>
  </div>
</template>

<style>
.pa-wc { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 5px 8px 10px; border-radius: 6px; background: var(--pa-editor-background); color: var(--pa-text-muted); }
.pa-wc-tile { position: relative; flex: none; width: 32px; height: 32px; border-radius: 10px; overflow: hidden; display: inline-flex; align-items: center; justify-content: center;
  font: 500 11.5px/1 'IBM Plex Sans', system-ui, sans-serif; color: var(--pa-text-placeholder); background: color-mix(in srgb, var(--pa-text) 6%, transparent); }
.pa-wc-tile i { position: absolute; left: 0; right: 0; bottom: 0; background: color-mix(in srgb, var(--pa-text-accent) 28%, transparent); }
.pa-wc-label { position: relative; display: inline-flex; flex-direction: column; align-items: center; gap: 1px; line-height: 1; }
.pa-wc-label small { font: 600 8px/1 'IBM Plex Sans', system-ui, sans-serif; letter-spacing: 0.04em; opacity: 0.6; }
.pa-wc-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.pa-wc-title { font-size: 13px; line-height: 16px; color: var(--pa-text-placeholder); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pa-wc-sub { font-size: 11.5px; line-height: 14px; color: var(--pa-text-placeholder); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pa-wc-pct { align-self: flex-start; margin-top: 3px; font: 400 11px/1 'Lilex', ui-monospace, monospace; color: var(--pa-text-placeholder); }
.pa .pa-wc-steps { flex-basis: 100%; list-style: none; margin: 0; padding: 8px 0 0 42px; line-height: 16px; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.pa-wc-step { display: grid; grid-template-columns: 12px minmax(0, 1fr); column-gap: 8px; align-items: start; color: var(--pa-text-placeholder); margin: 0 !important; }
.pa-wc-step > .pa-icon { margin-top: 2px; }
.pa-wc-step.done { color: var(--pa-text-muted); }
.pa-wc-step.done > .pa-icon { color: var(--pa-success); }
.pa-wc-step.running { color: var(--pa-text); }
.pa-wc-step.running > .pa-icon { color: var(--pa-info); }
.pa-wc-body { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.pa-wc-name { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; }
.pa-wc-tag { font-size: 10.5px; line-height: 14px; padding: 0 5px; border-radius: 4px; background: color-mix(in srgb, var(--pa-text) 6%, transparent); color: var(--pa-text-placeholder); }
</style>
