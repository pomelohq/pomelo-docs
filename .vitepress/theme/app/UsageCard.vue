<script setup>
import Icon from './Icon.vue'
import Keys from '../Keys.vue'
import './kit.css'

defineProps({
  name: { type: String, default: 'dev' },
  email: { type: String, default: 'dev@example.com' },
  plan: { type: String, default: 'Team' },
  organization: { type: String, default: 'myproject' },
  session: { type: Number, default: 8 },
  weekly: { type: Number, default: 26 },
  updated: { type: String, default: 'Updated 2m ago' },
})
const tone = used => used >= 90 ? 'var(--pa-error)' : used >= 70 ? 'var(--pa-warning)' : 'var(--pa-success)'
</script>

<template>
  <div class="pa-ucard">
    <div class="pa-ucard-body">
      <div class="pa-ucard-head">
        <Icon name="sparkle" :size="13" class="pa-ucard-icon" />
        <b>{{ name }}</b>
        <span class="pa-ucard-mail">{{ email }}</span>
        <span class="pa-ucard-plan">{{ plan }}</span>
      </div>
      <div v-for="[title, used, resets] in [['5 hours', session, 'in 2h 56m'], ['Week', weekly, 'Sat 17:00']]" :key="title" class="pa-ucard-win">
        <span class="pa-ucard-title">{{ title }}</span>
        <span class="pa-ucard-meter"><i :style="{ width: used + '%', background: tone(used) }" /></span>
        <span class="pa-ucard-pct">{{ used }}%</span>
        <span class="pa-ucard-resets">{{ resets }}</span>
      </div>
      <span class="pa-ucard-note">{{ organization }}</span>
    </div>
    <i class="pa-ucard-sep" />
    <div class="pa-ucard-row">Open Agent Usage <span class="pk-kbd"><Keys k="cmd-shift-u" class="pa-keys" /></span></div>
    <div class="pa-ucard-row">Refresh Now</div>
    <i class="pa-ucard-sep" />
    <span class="pa-ucard-note pa-ucard-foot">{{ updated }}</span>
  </div>
</template>

<style>
.pa-ucard { width: 300px; display: flex; flex-direction: column; gap: 2px; padding: 6px; border-radius: 9px; background: var(--pa-elevated-surface-background); color: var(--pa-text);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 12px 32px rgba(0, 0, 0, 0.5); }
html:not(.dark) .pa-ucard { box-shadow: 0 0 0 1px rgba(29, 23, 48, 0.12), 0 12px 32px rgba(29, 23, 48, 0.16); }
.pa-ucard-body { display: flex; flex-direction: column; gap: 8px; padding: 8px; }
.pa-ucard-head { display: flex; align-items: center; gap: 6px; font-size: 13px; line-height: 1.2; }
.pa-ucard-head b { font-weight: 500; }
.pa-ucard-icon { color: var(--pa-text-placeholder); }
.pa-ucard-mail { flex: 1; min-width: 0; font-size: 11.5px; color: var(--pa-text-placeholder); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pa-ucard-plan { padding: 1px 6px; border-radius: 8px; font: 10.5px/1.4 'Lilex', ui-monospace, monospace; color: var(--pa-text-accent); background: color-mix(in srgb, var(--pa-text-accent) 14%, transparent); }
.pa-ucard-win { display: flex; align-items: center; gap: 8px; font-size: 12px; line-height: 1; }
.pa-ucard-title { width: 54px; flex: none; color: var(--pa-text-muted); }
.pa-ucard-meter { flex: 1; height: 5px; border-radius: 3px; background: color-mix(in srgb, var(--pa-text) 10%, transparent); overflow: hidden; }
.pa-ucard-meter i { display: block; height: 100%; border-radius: 3px; }
.pa-ucard-pct { width: 36px; flex: none; text-align: right; font: 12px/1 'Lilex', ui-monospace, monospace; }
.pa-ucard-resets { width: 72px; flex: none; text-align: right; font-size: 11px; color: var(--pa-text-placeholder); }
.pa-ucard-note { font-size: 11px; line-height: 1.3; color: var(--pa-text-placeholder); }
.pa-ucard-foot { padding: 4px 8px; }
.pa-ucard-sep { display: block; height: 1px; margin: 2px 0; background: color-mix(in srgb, var(--pa-text) 6%, transparent); }
.pa-ucard-row { display: flex; align-items: center; justify-content: space-between; height: 28px; padding: 0 8px; border-radius: 5px; font-size: 13px; }
.pa-ucard-row:hover, .pa-ucard-row.hover { background: color-mix(in srgb, var(--pa-text) 5%, transparent); }
</style>
