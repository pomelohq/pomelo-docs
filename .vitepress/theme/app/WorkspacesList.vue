<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'

// rows: [{ id, title, branch, key, group, agent, running, pr: { count, trouble }, current }]
//   agent: idle | thinking | tools | compacting | waiting; pr.trouble: pending | changes | ci | conflict.
// creating: [{ title, key, step, progress, failed }]. rail: the folded column of tiles.
const props = defineProps({
  rows: {
    type: Array,
    default: () => [
      { id: 'main', title: 'main', branch: 'main', running: 2 },
      { id: '101', title: 'Login with Google', branch: 'proj-101-login-google', key: 'PROJ-101', group: 'In progress', agent: 'tools', running: 3, pr: { count: 2 }, current: true },
      { id: '102', title: 'Rate limit the public API', branch: 'api-102-rate-limit', key: 'API-102', group: 'In progress', agent: 'waiting' },
      { id: '107', title: 'Invoice PDF export', branch: 'web-107-invoice-pdf', key: 'WEB-107', group: 'In review', running: 1, pr: { count: 1, trouble: 'ci' } },
      { id: '112', title: 'Upgrade the queue worker', branch: 'ops-112-queue-upgrade', key: 'OPS-112', group: 'In review', pr: { count: 2, trouble: 'pending' } },
      { id: 'inv', title: 'investigate flaky spec', branch: 'investigate-0917-5fwg', agent: 'thinking' },
    ],
  },
  creating: {
    type: Array,
    default: () => [{ title: 'Export audit log', key: 'PROJ-118', step: 'Running setup commands (5 of 8)', progress: 0.5 }],
  },
  rail: { type: Boolean, default: false },
  head: { type: Boolean, default: true },
})

const GROUPS = ['In progress', 'In review', 'Backlog', 'Done']
const isMain = row => row.id === 'main'
const working = row => ['thinking', 'tools', 'compacting'].includes(row.agent)
const failing = row => !isMain(row) && row.pr?.trouble && row.pr.trouble !== 'pending'

// The single most important thing about a workspace, so a row never says two things at once.
function headline(row) {
  if (row.agent === 'waiting') return { text: 'Waiting for you', tone: 'attention' }
  if (failing(row)) return { text: { ci: 'CI failed', conflict: 'Conflict', changes: 'Changes requested' }[row.pr.trouble], tone: 'danger' }
  if (working(row)) return { text: 'Agent working', tone: 'info' }
  if (!isMain(row) && row.pr?.trouble === 'pending') return { text: 'Checks running', tone: 'warning' }
  return null
}
function label(row) {
  const [project, number] = row.key?.split('-') ?? []
  if (project && number) return { prefix: project.slice(0, 4), name: number }
  const parts = (row.branch || row.title || '').split(/[-_/]/).filter(Boolean)
  return { name: (parts[parts.length - 1] ?? row.title).slice(0, 5) }
}
const need = row => row.agent === 'waiting' ? 'attention' : failing(row) ? 'danger' : ''

const main = computed(() => props.rows.find(isMain))
const groups = computed(() => {
  const rest = props.rows.filter(r => !isMain(r))
  const out = GROUPS.map(g => ({ title: g, rows: rest.filter(r => r.group === g) })).filter(g => g.rows.length)
  const loose = rest.filter(r => !r.group)
  if (loose.length) out.push({ title: 'Other', rows: loose })
  return out
})
</script>

<template>
  <div class="pa-ws" :class="{ rail }">
    <template v-if="!rail">
      <div v-if="head" class="pa-ws-head"><span>Workspaces</span><span class="pa-ws-btn"><Icon name="plus" :size="14" /></span></div>
      <template v-for="row in main ? [main] : []" :key="row.id">
        <div class="pa-ws-row single" :class="{ current: row.current }">
          <span class="pa-tile" :style="{ width: '32px', height: '32px' }"><Icon name="branch" :size="14" />
            <span v-if="row.running" class="pa-tile-pips"><i v-for="n in Math.min(row.running, 3)" :key="n" /></span></span>
          <span class="pa-ws-text"><span class="pa-ws-title">{{ row.title }}</span></span>
        </div>
      </template>
      <div v-for="op in creating" :key="op.title" class="pa-ws-row creating">
        <span class="pa-tile creating" :class="{ 'need-danger': op.failed }" style="width: 32px; height: 32px">
          <i class="pa-tile-level" :style="{ height: (op.progress || 0) * 100 + '%' }" />
          <span class="pa-tile-label"><small v-if="op.key">{{ op.key.split('-')[0].slice(0, 4) }}</small>{{ op.key ? op.key.split('-')[1] : op.title.slice(0, 3) }}</span>
        </span>
        <span class="pa-ws-text"><span class="pa-ws-title">{{ op.title }}</span>
          <span class="pa-ws-sub"><span class="pa-ws-line" :class="op.failed ? 'tone-danger' : 'tone-muted'">{{ op.failed ? 'Failed - ' + op.step : op.step }}</span></span></span>
        <span v-if="!op.failed" class="pa-ws-pct mono">{{ Math.round((op.progress || 0) * 100) }}%</span>
      </div>
      <div v-for="group in groups" :key="group.title" class="pa-ws-group">
        <div class="pa-ws-group-head"><span>{{ group.title }}</span><span class="pa-ws-count">{{ group.rows.length }}</span></div>
        <div v-for="row in group.rows" :key="row.id" class="pa-ws-row" :class="{ current: row.current, single: !headline(row) }">
          <span class="pa-tile" :class="{ current: row.current, long: label(row).name.length > 4 }" style="width: 32px; height: 32px">
            <span class="pa-tile-label"><small v-if="label(row).prefix">{{ label(row).prefix }}</small>{{ label(row).name }}</span>
            <span v-if="row.running" class="pa-tile-pips"><i v-for="n in Math.min(row.running, 3)" :key="n" /></span>
          </span>
          <span class="pa-ws-text">
            <span class="pa-ws-title">{{ row.title }}</span>
            <span v-if="headline(row)" class="pa-ws-sub">
              <span v-if="headline(row).tone === 'attention'" class="pa-pill-attention">{{ headline(row).text }}</span>
              <span v-else class="pa-ws-line" :class="'tone-' + headline(row).tone">{{ headline(row).text }}</span>
            </span>
          </span>
          <span v-if="failing(row)" class="pa-ws-pr"><Icon name="pull_request" :size="12" />{{ row.pr.count }}</span>
        </div>
      </div>
    </template>
    <template v-else>
      <span class="pa-ws-btn pa-rail-add"><Icon name="plus" :size="14" /></span>
      <div v-if="main" class="pa-cell" :class="{ current: main.current }">
        <span class="pa-tile" :class="{ current: main.current }" style="width: 36px; height: 36px"><Icon name="branch" :size="14" />
          <span v-if="main.running" class="pa-tile-pips"><i v-for="n in Math.min(main.running, 3)" :key="n" /></span></span>
      </div>
      <div v-for="op in creating" :key="op.title" class="pa-cell">
        <span class="pa-tile creating" style="width: 36px; height: 36px">
          <i class="pa-tile-level" :style="{ height: (op.progress || 0) * 100 + '%' }" />
          <span class="pa-tile-label"><small v-if="op.key">{{ op.key.split('-')[0].slice(0, 4) }}</small>{{ op.key ? op.key.split('-')[1] : op.title.slice(0, 3) }}</span>
        </span>
      </div>
      <div v-for="group in groups" :key="group.title" class="pa-rail-group">
        <i class="pa-rule" />
        <div v-for="row in group.rows" :key="row.id" class="pa-cell" :class="{ current: row.current }">
          <span class="pa-tile" :class="[{ current: row.current, long: label(row).name.length > 4 }, need(row) && 'need-' + need(row)]" style="width: 36px; height: 36px">
            <span class="pa-tile-label"><small v-if="label(row).prefix">{{ label(row).prefix }}</small>{{ label(row).name }}</span>
            <i v-if="working(row)" class="pa-tile-scan" />
            <span v-else-if="row.running" class="pa-tile-pips"><i v-for="n in Math.min(row.running, 3)" :key="n" /></span>
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<style>
.pa-ws { display: flex; flex-direction: column; gap: 2px; padding: 4px 8px 8px; min-height: 0; overflow: hidden; }
.pa-ws.rail { align-items: center; gap: 4px; padding: 4px 0 8px; }
.pa-ws-head { flex: none; height: 32px; padding: 0 2px 4px 8px; display: flex; align-items: center; justify-content: space-between;
  font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--pa-text-placeholder); }
.pa-ws-btn { width: 24px; height: 24px; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; color: var(--pa-text-placeholder); }
.pa-ws-btn:hover { background: var(--pa-element-hover); color: var(--pa-text); }
.pa-rail-add { flex: none; width: 36px; height: 28px; }
.pa-ws-row { position: relative; flex: none; min-height: 54px; padding: 5px 8px; gap: 10px; border-radius: 6px; display: flex; align-items: center;
  color: var(--pa-text-muted); overflow: hidden; }
.pa-ws-row.single { min-height: 50px; }
.pa-ws-row:hover { background: var(--pa-element-hover); }
.pa-ws-row.current { background: var(--pa-element-selected); color: var(--pa-text); }
.pa-ws-row.creating .pa-ws-title { color: var(--pa-text-placeholder); }
.pa-ws-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.pa-ws-title { font-size: 13px; line-height: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pa-ws-row.current .pa-ws-title { font-weight: 500; }
.pa-ws-sub { display: flex; align-items: center; gap: 8px; min-width: 0; font-size: 11.5px; line-height: 14px; }
.pa-ws-line { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pa .tone-attention { color: var(--pa-attention); }
.pa .tone-danger { color: var(--pa-error); }
.pa .tone-warning { color: var(--pa-warning); }
.pa .tone-info { color: var(--pa-info); }
.pa .tone-muted { color: var(--pa-text-placeholder); }
.pa-pill-attention { flex: none; height: 20px; padding: 0 7px; border-radius: 999px; display: inline-flex; align-items: center;
  font-size: 11px; font-weight: 500; line-height: 1; white-space: nowrap; background: var(--pa-attention); color: var(--pa-on-attention); }
html:not(.dark) .pa-pill-attention { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--pa-on-attention) 22%, transparent); }
.pa-ws-pr { flex: none; align-self: flex-start; margin-top: 3px; height: 20px; padding: 0 6px; gap: 3px; border-radius: 10px;
  display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; line-height: 1;
  color: var(--pa-error); background: color-mix(in srgb, var(--pa-error) 14%, transparent); }
.pa-ws-pct { flex: none; align-self: flex-start; margin-top: 6px; font-size: 11px; line-height: 1; color: var(--pa-text-placeholder); }
.pa-ws-group { display: flex; flex-direction: column; gap: 2px; padding-top: 12px; }
.pa-ws-group-head { height: 20px; padding: 0 8px; gap: 6px; display: flex; align-items: center; font-size: 10.5px; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase; color: var(--pa-text-placeholder); }
.pa-ws-count { font-weight: 400; letter-spacing: 0; opacity: 0.8; }

.pa-tile { position: relative; flex: none; display: inline-flex; align-items: center; justify-content: center; border-radius: 10px;
  font-size: 11.5px; font-weight: 500; line-height: 1; color: var(--pa-text-muted); background: color-mix(in srgb, var(--pa-text) 6%, transparent); }
.pa-tile.long { font-size: 10px; }
.pa-tile.current { background: var(--pa-accent-fill); color: var(--pa-on-accent); }
.pa-tile.creating { color: var(--pa-text-placeholder); overflow: hidden; }
.pa-tile-level { position: absolute; left: 0; right: 0; bottom: 0; background: color-mix(in srgb, var(--pa-text-accent) 28%, transparent); }
.pa-tile.need-attention { background: var(--pa-attention); color: var(--pa-on-attention); }
.pa-tile.need-danger { box-shadow: 0 0 0 2px var(--pa-background), 0 0 0 3.5px var(--pa-error); }
.pa-tile-label { position: relative; display: inline-flex; flex-direction: column; align-items: center; gap: 1px; line-height: 1; }
.pa-tile-label small { font-size: 8px; font-weight: 600; letter-spacing: 0.04em; opacity: 0.6; }
.pa-tile:has(> .pa-tile-pips) .pa-tile-label, .pa-tile:has(> .pa-tile-scan) .pa-tile-label { transform: translateY(-2px); }
.pa-tile-pips { position: absolute; bottom: 3px; left: 0; right: 0; display: flex; justify-content: center; gap: 2px; }
.pa-tile-pips i { width: 3px; height: 3px; border-radius: 50%; background: currentColor; opacity: 0.55; }
.pa-tile-scan { position: absolute; bottom: 3px; left: 9px; right: 9px; height: 2px; border-radius: 1px; overflow: hidden;
  background: color-mix(in srgb, currentColor 18%, transparent); }
.pa-tile-scan::after { content: ''; position: absolute; inset: 0; width: 40%; border-radius: inherit; background: var(--pa-info); }
.pa-tile.current .pa-tile-scan::after { background: var(--pa-on-accent); }
.pa-tile.need-attention .pa-tile-scan::after { background: var(--pa-on-attention); }
.pa-cell { position: relative; flex: none; width: 56px; height: 42px; display: flex; align-items: center; justify-content: center; }
.pa-cell.current::before { content: ''; position: absolute; left: 0; top: 13px; width: 3px; height: 16px; border-radius: 0 2px 2px 0;
  background: var(--pa-text-accent); }
.pa-rail-group { display: flex; flex-direction: column; align-items: center; gap: 4px; padding-top: 4px; }
.pa-rule { width: 20px; height: 1px; margin: 4px 0; background: var(--pa-border); }
</style>
