<script setup>
import Icon from './Icon.vue'
import Keys from '../Keys.vue'
import Meter from './Meter.vue'
defineProps({
  name: { type: String, default: 'dev' },
  email: { type: String, default: 'dev@example.com' },
  plan: { type: String, default: 'Team' },
  session: { type: Number, default: 23 },
  weekly: { type: Number, default: 74 },
})
</script>

<template>
  <div class="pa-ucard">
    <div class="col pa-ucard-body">
      <div class="row pa-ucard-head">
        <Icon name="sparkle" :size="13" class="icon-muted" />
        <span class="pa-strong">{{ name }}</span>
        <span class="placeholder trunc pa-ucard-mail">{{ email }}</span>
        <span class="grow" />
        <span class="pa-plan mono">{{ plan }}</span>
      </div>
      <div v-for="[title, used, resets] in [['5 hours', session, 'in 2h 31m'], ['Week', weekly, 'Sat 17:00']]" :key="title" class="row pa-ucard-win">
        <span class="muted pa-ucard-label">{{ title }}</span>
        <Meter :used="used" />
        <span class="mono pa-ucard-pct">{{ used }}%</span>
        <span class="placeholder pa-ucard-reset">{{ resets }}</span>
      </div>
    </div>
    <div class="pa-menu-sep" />
    <div class="pa-menu-row"><span class="grow">Open Agent Usage</span><Keys k="cmd-shift-u" class="pa-keys" /></div>
    <div class="pa-menu-row"><span class="grow">Refresh Now</span></div>
    <div class="pa-menu-sep" />
    <div class="placeholder pa-ucard-note">Updated 12s ago - from the agents' status line</div>
  </div>
</template>

<style>
.pa-ucard { width: 300px; padding: 6px; display: flex; flex-direction: column; gap: 2px; border-radius: 9px;
  background: var(--pa-elevated-surface-background); border: 1px solid var(--pa-border); box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28); }
.pa-ucard-body { gap: 6px; padding: 8px; }
.pa-ucard-head { gap: 6px; font-size: 13px; }
.pa-ucard-mail { font-size: 11.5px; }
.pa-plan { padding: 0 6px; border-radius: 8px; font-size: 10.5px; color: var(--pa-text-accent);
  background: color-mix(in srgb, var(--pa-text-accent) 14%, transparent); }
.pa-ucard-win { gap: 8px; font-size: 12px; }
.pa-ucard-label { width: 54px; flex: none; }
.pa-ucard-pct { width: 36px; text-align: right; flex: none; }
.pa-ucard-reset { width: 72px; text-align: right; flex: none; font-size: 11px; }
.pa-ucard-note { padding: 4px 8px; font-size: 11px; }
.pa-menu-sep { height: 5px; display: flex; align-items: center; }
.pa-menu-sep::after { content: ''; flex: 1; height: 1px; background: var(--pa-border); }
.pa-menu-row { height: 28px; padding: 0 8px; gap: 6px; border-radius: 5px; display: flex; align-items: center; font-size: 13px; }
.pa-menu-row:hover { background: var(--pa-element-hover); }
</style>
