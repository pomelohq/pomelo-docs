<script setup>
import Icon from './Icon.vue'

// agent: idle | thinking | tools | compacting | input. pr: { count, tone: ok|warn|merged|danger, trouble }.
defineProps({
  rows: {
    type: Array,
    default: () => [
      { name: 'main', agent: 'idle' },
      { name: 'Login page', branch: 'feat-login', current: true, agent: 'thinking', running: 2,
        pr: { count: 2, tone: 'warn' }, trouble: ['Checks pending', 'warning'] },
      { name: 'Checkout flow', ticket: 'PROJ-101', status: ['In Review', 'accent'], agent: 'input', running: 3,
        pr: { count: 1, tone: 'danger', trouble: true }, trouble: ['CI failed', 'error'] },
      { name: 'Search filters', ticket: 'PROJ-104', status: ['In Progress', 'accent'], agent: 'tools' },
    ],
  },
})
const agentColor = {
  idle: 'var(--pa-success)', thinking: 'var(--pa-warning)', tools: 'var(--pa-info)',
  compacting: 'var(--pa-text-accent)', input: 'var(--pa-error)',
}
const prColor = { ok: 'var(--pa-success)', warn: 'var(--pa-warning)', merged: 'var(--pa-ansi-5)', danger: 'var(--pa-error)' }
const statusColor = { done: 'var(--pa-success)', accent: 'var(--pa-text-accent)', other: 'var(--pa-text-placeholder)' }
const second = row => row.ticket || row.running || row.trouble
</script>

<template>
  <div class="pa-ws">
    <div class="pa-ws-head">
      <span>WORKSPACES</span>
      <div class="pa-ws-plus"><Icon name="plus" :size="14" /></div>
    </div>
    <div v-for="row in rows" :key="row.name" class="pa-ws-row" :class="{ current: row.current, two: second(row) }">
      <span v-if="row.current" class="pa-ws-accent" />
      <span v-if="row.agent" class="pa-ws-dot" :style="{ background: agentColor[row.agent] }" />
      <span v-if="row.agent && row.agent !== 'idle'" class="pa-ws-halo" :style="{ background: agentColor[row.agent] }" />
      <div class="row pa-ws-line1">
        <span class="trunc grow pa-ws-name">{{ row.name }}</span>
        <span v-if="row.pr" class="pa-ws-pr" :class="{ trouble: row.pr.trouble }"
          :style="{ color: row.pr.trouble ? 'var(--pa-error)' : undefined }">
          <Icon name="pull_request" :size="11" :style="{ color: row.pr.trouble ? 'var(--pa-error)' : prColor[row.pr.tone] }" />
          <span :class="{ muted: !row.pr.trouble }">{{ row.pr.count }}</span>
        </span>
      </div>
      <div v-if="second(row)" class="row pa-ws-line2">
        <span v-if="row.ticket" class="mono placeholder pa-ws-key">{{ row.ticket }}</span>
        <span v-else-if="row.branch" class="mono placeholder pa-ws-key">{{ row.branch }}</span>
        <span v-if="row.status" class="row pa-ws-status">
          <i :style="{ background: statusColor[row.status[1]] }" /><span class="muted">{{ row.status[0] }}</span>
        </span>
        <span v-if="row.trouble" :style="{ color: `var(--pa-${row.trouble[1]})` }">{{ row.trouble[0] }}</span>
        <span v-if="row.running" class="row pa-ws-running">
          <i /><span class="placeholder">{{ row.ticket ? row.running : row.running + ' running' }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style>
.pa-ws { padding: 10px; display: flex; flex-direction: column; gap: 2px; }
.pa-ws-head { height: 24px; display: flex; align-items: center; justify-content: space-between; padding-left: 8px;
  font-size: 12px; color: var(--pa-text-muted); }
.pa-ws-plus { width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center;
  color: var(--pa-icon-muted); }
.pa-ws-plus:hover { background: var(--pa-ghost-element-hover); }
.pa-ws-row { position: relative; height: 30px; padding: 6px 8px 6px 18px; border-radius: 6px; display: flex;
  flex-direction: column; gap: 2px; color: var(--pa-text-muted); }
.pa-ws-row.two { height: 42px; padding-top: 4px; padding-bottom: 4px; }
.pa-ws-row:hover { background: var(--pa-element-hover); color: var(--pa-text); }
.pa-ws-row.current { background: var(--pa-element-selected); color: var(--pa-text); }
.pa-ws-row.current .pa-ws-name { font-weight: 500; }
.pa-ws-accent { position: absolute; left: 0; top: 9px; bottom: 9px; width: 2px; border-radius: 1px; background: var(--pa-text-accent); }
.pa-ws-dot { position: absolute; left: 7px; top: 10px; width: 6px; height: 6px; border-radius: 50%; }
.pa-ws-halo { position: absolute; left: 4px; top: 7px; width: 12px; height: 12px; border-radius: 50%; opacity: 0.2; }
.pa-ws-line1 { height: 18px; gap: 6px; font-size: 13px; }
.pa-ws-pr { height: 18px; padding: 0 5px; gap: 3px; border-radius: 4px; display: inline-flex; align-items: center; font-size: 11px; }
.pa-ws-pr.trouble { background: color-mix(in srgb, var(--pa-error) 12%, transparent); }
.pa-ws-line2 { height: 16px; gap: 8px; font-size: 11px; white-space: nowrap; overflow: hidden; }
.pa-ws-key { font-size: 10.5px; }
.pa-ws-status { gap: 5px; }
.pa-ws-status i { width: 6px; height: 6px; border-radius: 2px; display: block; }
.pa-ws-running { gap: 5px; }
.pa-ws-running i { width: 5px; height: 5px; border-radius: 50%; background: var(--pa-success); display: block; }
</style>
