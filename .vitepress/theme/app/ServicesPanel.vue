<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'

// state: running | crashed | port | stopped | starting.
const props = defineProps({
  branch: { type: String, default: 'feat-login' },
  ticket: { type: String, default: 'PROJ-101' },
  repos: {
    type: Array,
    default: () => [
      { name: 'api', engines: ['postgresql', 'redis', 'minio'], services: [
        { name: 'server', mode: 'dev', state: 'running', port: 4101, up: '41m' },
        { name: 'jobs', mode: 'dev', state: 'crashed', ago: '2m ago', detail: 'KeyError: key not found: "REDIS_URL"', exit: 'exit 1' },
        { name: 'mailer', state: 'stopped' },
      ] },
      { name: 'web', engines: [], services: [
        { name: 'vite', mode: 'dev', state: 'running', port: 5173, up: '41m' },
        { name: 'storybook', state: 'port', port: 6006, detail: 'port 6006 is already in use by node (pid 4812)' },
      ] },
    ],
  },
  shared: {
    type: Array,
    default: () => [
      { name: 'postgres', engine: 'postgresql', state: 'running', port: 26678, users: 'api' },
      { name: 'redis', engine: 'redis', state: 'running', port: 28476, users: 'api' },
      { name: 'files', engine: 'minio', state: 'running', port: 29416, users: 'api' },
      { name: 'mail', engine: '', state: 'stopped', port: 27686, users: '' },
    ],
  },
  attention: { type: Boolean, default: true },
})

const filter = ref('all')
const all = computed(() => props.repos.flatMap(r => r.services.map(s => ({ ...s, repo: r.name }))))
const count = kind => all.value.filter(s => match(s, kind)).length
const match = (s, kind) => kind === 'all' || (kind === 'running' && s.state === 'running')
  || (kind === 'failed' && (s.state === 'crashed' || s.state === 'port'))
  || (kind === 'stopped' && s.state === 'stopped')
const segments = [['all', 'All'], ['running', 'Running'], ['failed', 'Failed'], ['stopped', 'Stopped']]
const running = computed(() => count('running'))
const failing = computed(() => all.value.filter(s => s.state === 'crashed' || s.state === 'port'))
const stopped = computed(() => count('stopped'))
const total = computed(() => all.value.length)
const pct = n => (n / Math.max(1, total.value)) * 100
const hoverRepo = ref('')
const hoverShared = ref('')
const usesShared = (repo, shared) => shared.users.split(', ').includes(repo)
const trailing = s => s.state === 'running' ? `:${s.port}` : s.state === 'crashed' ? 'crashed' : s.state === 'port' ? `:${s.port} in use` : ''
</script>

<template>
  <div class="pa-svc">
    <div class="pa-panel-head">
      <span class="pa-panel-title">Services</span>
      <span class="mono placeholder pa-panel-branch">{{ branch }}</span>
      <span class="grow" />
      <div class="pa-icon-btn"><Icon name="key" :size="12" /></div>
      <div class="pa-icon-btn"><Icon name="server" :size="12" /></div>
    </div>
    <div class="pa-svc-filter">
      <div class="pa-field"><Icon name="search" :size="12" class="placeholder" /><span class="placeholder">Filter by name</span></div>
      <div class="row pa-segments">
        <div v-for="[id, text] in segments" :key="id" class="pa-segment" :class="{ on: filter === id }" @click="filter = id">
          {{ text }}<span class="placeholder">{{ count(id) }}</span>
        </div>
      </div>
    </div>
    <div class="pa-svc-scroll">
      <div class="pa-svc-card-wrap">
        <div class="pa-svc-card">
          <div class="row pa-svc-card-title">
            <span class="pa-strong">{{ branch }}</span>
            <span v-if="ticket" class="pa-tag mono">{{ ticket }}</span>
            <span class="grow" />
            <span class="muted pa-small">{{ running }} of {{ total }} running</span>
          </div>
          <div class="pa-svc-bar">
            <span :style="{ width: pct(running) + '%', background: 'var(--pa-success)' }" />
            <span :style="{ width: pct(failing.length) + '%', background: 'var(--pa-error)' }" />
          </div>
          <div class="row pa-legend">
            <span><i style="background: var(--pa-success)" />{{ running }} running</span>
            <span v-if="failing.length"><i style="background: var(--pa-error)" />{{ failing.length }} need attention</span>
            <span v-if="stopped"><i style="background: var(--pa-border)" />{{ stopped }} stopped</span>
          </div>
          <div class="row pa-btns">
            <span class="pa-btn primary"><Icon name="play" :size="11" />Start all</span>
            <span class="pa-btn"><Icon name="stop" :size="11" />Stop all</span>
            <span v-if="failing.length" class="pa-btn"><Icon name="rotate_cw" :size="11" />Restart failed</span>
          </div>
        </div>
      </div>

      <template v-if="attention && failing.length && (filter === 'all' || filter === 'failed')">
        <div class="pa-section"><span>NEEDS ATTENTION</span><span>{{ failing.length }}</span></div>
        <div class="pa-attn-list">
          <div v-for="s in failing" :key="s.name" class="pa-attn" :class="s.state === 'port' ? 'tint-warn' : 'tint-err'">
            <div class="row pa-attn-title">
              <Icon :name="s.state === 'port' ? 'warning' : 'x_circle'" :size="12" class="pa-attn-icon" />
              <span class="pa-strong">{{ s.repo }} &gt; {{ s.name }}</span>
              <span class="muted">{{ s.state === 'port' ? `cannot bind :${s.port}` : 'crashed' }}</span>
              <span class="grow" />
              <span v-if="s.ago" class="placeholder pa-xs">{{ s.ago }}</span>
            </div>
            <div class="mono trunc pa-attn-detail">{{ s.detail }}</div>
            <div v-if="s.exit" class="muted pa-small">Stopped with {{ s.exit }}.</div>
            <div class="row pa-btns wrap">
              <span v-if="s.state === 'port'" class="pa-btn primary"><Icon name="arrow_up_right" :size="11" />Use a new port</span>
              <span class="pa-btn"><Icon name="file" :size="11" />View logs</span>
              <span class="pa-btn agent"><Icon name="sparkle" :size="11" />Fix with Claude</span>
              <span v-if="s.state === 'crashed'" class="pa-btn icon"><Icon name="rotate_cw" :size="11" /></span>
            </div>
          </div>
        </div>
      </template>

      <div class="pa-section"><span>THIS WORKSPACE</span></div>
      <template v-for="repo in repos" :key="repo.name">
        <div class="pa-tree-row pa-repo" :class="{ related: hoverShared && shared.find(x => x.name === hoverShared && usesShared(repo.name, x)) }"
          @mouseenter="hoverRepo = repo.name" @mouseleave="hoverRepo = ''">
          <Icon name="chevron_down" :size="12" class="icon-muted" />
          <span class="pa-strong">{{ repo.name }}</span>
          <Icon v-for="e in repo.engines" :key="e" :name="'engine-' + e" :size="12" />
          <span class="grow" />
          <span class="pa-pips"><i v-for="s in repo.services" :key="s.name" :class="s.state" /></span>
          <span class="pa-xs" :class="repo.services.some(s => s.state === 'crashed' || s.state === 'port') ? 'err' : 'muted'">
            {{ repo.services.filter(s => s.state === 'running').length }}/{{ repo.services.length }}
          </span>
        </div>
        <div v-for="s in repo.services.filter(s => match(s, filter))" :key="s.name" class="pa-tree-row pa-svc-row">
          <span class="pa-guide" />
          <span class="pa-state">
            <i v-if="s.state === 'running'" class="dot" />
            <Icon v-else-if="s.state === 'crashed'" name="x_circle" :size="12" class="err" />
            <Icon v-else-if="s.state === 'port'" name="warning" :size="12" class="warn" />
            <i v-else class="ring" />
          </span>
          <span>{{ s.name }}</span>
          <span v-if="s.mode" class="pa-mode mono">{{ s.mode }}</span>
          <span class="grow" />
          <span class="pa-trail">
            <span class="mono" :class="{ placeholder: s.state === 'running', err: s.state === 'crashed', warn: s.state === 'port' }">{{ trailing(s) }}</span>
          </span>
          <span class="pa-hover-btns">
            <Icon v-if="s.state === 'running'" name="rotate_cw" :size="12" />
            <Icon v-if="s.port" name="arrow_up_right" :size="12" />
            <Icon name="terminal" :size="12" />
            <Icon :name="s.state === 'running' ? 'stop' : 'play'" :size="12" />
            <Icon name="ellipsis" :size="12" />
          </span>
        </div>
      </template>
    </div>
    <div class="pa-shared">
      <div class="pa-section"><Icon name="chevron_down" :size="12" /><span class="grow">SHARED - ALL WORKSPACES</span>
        <span>{{ shared.filter(x => x.state === 'running').length }}/{{ shared.length }}</span></div>
      <div v-for="x in shared" :key="x.name" class="pa-tree-row pa-shared-row"
        :class="{ related: hoverRepo && usesShared(hoverRepo, x) }"
        @mouseenter="hoverShared = x.name" @mouseleave="hoverShared = ''">
        <span class="pa-state"><i :class="x.state === 'running' ? 'dot' : 'ring'" /></span>
        <Icon :name="x.engine ? 'engine-' + x.engine : 'cylinder'" :size="13" :class="{ 'icon-muted': !x.engine }" />
        <span>{{ x.name }}</span>
        <span class="mono placeholder pa-xs">:{{ x.port }}</span>
        <span class="grow" />
        <span class="muted pa-xs">{{ x.users || 'not used here' }}</span>
      </div>
    </div>
  </div>
</template>

<style>
.pa-svc { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.pa-panel-head { flex: none; height: 34px; padding: 0 6px 0 12px; display: flex; align-items: center; gap: 6px; }
.pa-panel-title { font-size: 13px; font-weight: 500; }
.pa-panel-branch { font-size: 12px; }
.pa-icon-btn { width: 20px; height: 20px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--pa-icon-muted); }
.pa-icon-btn:hover { background: var(--pa-element-hover); color: var(--pa-icon); }
.pa-svc-filter { flex: none; height: 64px; padding: 0 8px; display: flex; flex-direction: column; gap: 6px; }
.pa-field { height: 26px; padding: 0 8px; gap: 6px; border-radius: 5px; display: flex; align-items: center; font-size: 13px;
  background: var(--pa-editor-background); border: 1px solid var(--pa-border-variant); }
.pa-segments { gap: 2px; }
.pa-segment { height: 22px; padding: 0 7px; gap: 5px; border-radius: 4px; display: flex; align-items: center; font-size: 12px;
  color: var(--pa-text-muted); cursor: pointer; }
.pa-segment .placeholder { font-size: 11px; }
.pa-segment:hover { background: var(--pa-ghost-element-hover); }
.pa-segment.on { background: var(--pa-element-selected); color: var(--pa-text); }
.pa-svc-scroll { flex: 1; min-height: 0; overflow: hidden; }
.pa-svc-card-wrap { padding: 0 8px 6px; }
.pa-svc-card { padding: 10px; display: flex; flex-direction: column; gap: 8px; border-radius: 7px;
  border: 1px solid var(--pa-border-variant); background: rgba(0, 0, 0, 0.08); }
.pa-svc-card-title { gap: 6px; font-size: 13px; }
.pa .pa-strong { font-weight: 500; }
.pa .pa-small { font-size: 11.5px; }
.pa .pa-xs { font-size: 11px; }
.pa .err { color: var(--pa-error); }
.pa .warn { color: var(--pa-warning); }
.pa-tag { height: 16px; padding: 0 4px; border-radius: 3px; border: 1px solid var(--pa-border-variant); font-size: 10.5px;
  display: inline-flex; align-items: center; color: var(--pa-text-muted); }
.pa-svc-bar { height: 4px; border-radius: 2px; background: var(--pa-border-variant); display: flex; overflow: hidden; }
.pa-svc-bar span { display: block; height: 100%; }
.pa-legend { gap: 12px; font-size: 11.5px; color: var(--pa-text-muted); flex-wrap: wrap; }
.pa-legend span { display: inline-flex; align-items: center; gap: 5px; }
.pa-legend i { width: 7px; height: 7px; border-radius: 50%; display: block; }
.pa-btns { gap: 6px; }
.pa-btns.wrap { flex-wrap: wrap; }
.pa-btn { height: 22px; padding: 0 7px; gap: 4px; border-radius: 4px; display: inline-flex; align-items: center; font-size: 11.5px;
  background: var(--pa-element-background); border: 1px solid var(--pa-border-variant); color: var(--pa-text); white-space: nowrap; }
.pa-btn:hover { background: var(--pa-element-hover); }
.pa-btn.primary { background: var(--pa-info-background); border-color: var(--pa-info-border); }
.pa-btn.agent { background: color-mix(in srgb, var(--pa-ansi-5) 12%, transparent);
  border-color: color-mix(in srgb, var(--pa-ansi-5) 55%, transparent); }
.pa-btn.icon { padding: 0 5px; }
.pa-section { height: 26px; padding: 0 10px; display: flex; align-items: center; justify-content: space-between; gap: 6px;
  font-size: 11px; font-weight: 600; color: var(--pa-text-placeholder); }
.pa-attn-list { padding: 0 8px 6px; display: flex; flex-direction: column; gap: 6px; }
.pa-attn { padding: 9px; display: flex; flex-direction: column; gap: 6px; border-radius: 7px; font-size: 13px; }
.pa-attn.tint-err { --tint: var(--pa-error); }
.pa-attn.tint-warn { --tint: var(--pa-warning); }
.pa-attn { border: 1px solid color-mix(in srgb, var(--tint) 30%, transparent); background: color-mix(in srgb, var(--tint) 6%, transparent); }
.pa-attn:hover { background: color-mix(in srgb, var(--tint) 10%, transparent); }
.pa-attn-title { gap: 6px; }
.pa-attn-icon { color: var(--tint); }
.pa-attn-detail { font-size: 11.5px; }
.pa-tree-row { position: relative; height: 26px; padding: 0 6px 0 8px; gap: 6px; display: flex; align-items: center; font-size: 13px; }
.pa-tree-row:hover { background: var(--pa-ghost-element-hover); }
.pa-tree-row.related { background: color-mix(in srgb, var(--pa-text-accent) 8%, transparent); box-shadow: inset 2px 0 var(--pa-text-accent); }
.pa-pips { display: inline-flex; gap: 3px; }
.pa-pips i { width: 5px; height: 5px; border-radius: 50%; background: var(--pa-border); display: block; }
.pa-pips i.running { background: var(--pa-success); }
.pa-pips i.crashed { background: var(--pa-error); }
.pa-pips i.port { background: var(--pa-warning); }
.pa-guide { width: 10px; align-self: stretch; border-right: 1px solid var(--pa-panel-indent-guide); margin-right: 6px; }
.pa-state { width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; }
.pa-state .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--pa-success); display: block; }
.pa-state .ring { width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid var(--pa-icon-muted); display: block; }
.pa-mode { height: 16px; padding: 0 4px; border-radius: 3px; border: 1px solid var(--pa-border-variant); font-size: 10.5px;
  display: inline-flex; align-items: center; color: var(--pa-text-muted); }
.pa-trail { font-size: 11px; }
.pa-hover-btns { display: none; gap: 8px; color: var(--pa-icon-muted); }
.pa-svc-row:hover .pa-trail { display: none; }
.pa-svc-row:hover .pa-hover-btns { display: inline-flex; }
.pa-shared { flex: none; border-top: 1px solid var(--pa-border); background: rgba(0, 0, 0, 0.1); padding-bottom: 4px; }
.pa-shared .pa-section { justify-content: flex-start; }
</style>
