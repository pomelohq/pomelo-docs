<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'
import './data.css'

// state: running | crashed | port | stopped | starting.
const props = defineProps({
  branch: { type: String, default: 'feat-login' },
  ticket: { type: String, default: 'PROJ-101' },
  repos: {
    type: Array,
    default: () => [
      { name: 'api', engines: ['postgresql', 'redis', 'minio', 'cylinder'], services: [
        { name: 'server', mode: 'dev', state: 'running', port: 3000, up: '41m' },
        { name: 'jobs', mode: 'dev', state: 'crashed', ago: '2m ago', detail: 'KeyError: key not found: "REDIS_URL"', exit: 'exit 1' },
        { name: 'mailer', state: 'stopped' },
      ] },
      { name: 'web', engines: [], services: [
        { name: 'app', mode: 'hmr', state: 'running', port: 5173, up: '41m' },
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
      { name: 'mock-as', engine: '', icon: 'terminal', state: 'stopped', port: 29734, users: 'api' },
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
    <div class="pa-svc-head">
      <span class="pa-svc-title">Services</span>
      <span class="mono placeholder">{{ branch }}</span>
    </div>
    <label class="pa-svc-filter"><Icon name="search" :size="12" class="icon-muted" /><input placeholder="Filter by name" spellcheck="false" /></label>
    <div class="row pa-svc-segs">
      <span v-for="[id, text] in segments" :key="id" :class="{ on: filter === id }" @click="filter = id">{{ text }}<i>{{ count(id) }}</i></span>
    </div>
    <div class="pa-svc-scroll">
      <div class="pa-svc-card">
        <div class="row pa-svc-card-title">
          <span class="pa-svc-strong">{{ branch }}</span>
          <span v-if="ticket" class="pa-svc-tag mono">{{ ticket }}</span>
          <span class="grow" />
          <span class="muted">{{ running }} of {{ total }} running</span>
        </div>
        <div class="pa-svc-bar">
          <span :style="{ width: pct(running) + '%', background: 'var(--pa-success)' }" />
          <span :style="{ width: pct(failing.length) + '%', background: 'var(--pa-error)' }" />
        </div>
        <div class="row pa-svc-legend">
          <span><i style="background: var(--pa-success)" />{{ running }} running</span>
          <span v-if="failing.length"><i style="background: var(--pa-error)" />{{ failing.length }} need attention</span>
          <span v-if="stopped"><i style="background: var(--pa-border)" />{{ stopped }} stopped</span>
        </div>
        <div class="row pa-svc-btns pa-svc-card-btns">
          <span class="pa-svc-btn info"><Icon name="play" :size="10" />Start all</span>
          <span class="pa-svc-btn"><Icon name="stop" :size="10" />Stop all</span>
          <span v-if="failing.length" class="pa-svc-btn"><Icon name="rotate_cw" :size="11" />Restart failed</span>
        </div>
      </div>

      <template v-if="attention && failing.length && (filter === 'all' || filter === 'failed')">
        <div class="pa-svc-section pa-svc-needs"><span>Needs attention</span><span>{{ failing.length }}</span></div>
        <div v-for="s in failing" :key="s.name" class="pa-svc-attn" :class="s.state === 'port' ? 'warn-tint' : 'err-tint'">
          <div class="row pa-svc-attn-title">
            <Icon :name="s.state === 'port' ? 'warning' : 'x_circle'" :size="12" class="pa-svc-attn-icon" />
            <span class="pa-svc-strong">{{ s.repo }} &gt; {{ s.name }}</span>
            <span class="muted">{{ s.state === 'port' ? `cannot bind :${s.port}` : 'crashed' }}</span>
            <span class="grow" />
            <span v-if="s.ago" class="placeholder pa-svc-ago">{{ s.ago }}</span>
          </div>
          <div class="mono pa-svc-detail">{{ s.detail.length > 41 ? s.detail.slice(0, 38) + '...' : s.detail }}</div>
          <div v-if="s.exit" class="muted pa-svc-exit">Stopped with {{ s.exit }}.</div>
          <div class="row pa-svc-btns wrap">
            <span v-if="s.state === 'port'" class="pa-svc-btn info"><Icon name="arrow_up_right" :size="11" />Use a new port</span>
            <span class="pa-svc-btn"><Icon name="file" :size="11" />View logs</span>
            <span class="pa-svc-btn agent"><Icon name="sparkle" :size="11" />Fix with Claude</span>
            <span v-if="s.state === 'crashed'" class="pa-svc-btn icon"><Icon name="rotate_cw" :size="11" /></span>
          </div>
        </div>
      </template>

      <div class="pa-svc-section pa-svc-mine"><span>This workspace</span></div>
      <template v-for="repo in repos" :key="repo.name">
        <div class="pa-svc-row pa-svc-repo" :class="{ related: hoverShared && shared.find(x => x.name === hoverShared && usesShared(repo.name, x)) }"
          @mouseenter="hoverRepo = repo.name" @mouseleave="hoverRepo = ''">
          <Icon name="chevron_down" :size="12" class="icon-muted" />
          <span class="pa-svc-repo-name">{{ repo.name }}</span>
          <Icon v-for="e in repo.engines" :key="e" :name="e === 'cylinder' ? e : 'engine-' + e" :size="12" :class="{ 'icon-muted': e === 'cylinder' }" />
          <span class="grow" />
          <span class="pa-svc-pips"><i v-for="s in repo.services" :key="s.name" :class="s.state" /></span>
          <span class="pa-svc-ratio" :class="repo.services.some(s => s.state === 'crashed' || s.state === 'port') ? 'err' : 'muted'">
            {{ repo.services.filter(s => s.state === 'running').length }}/{{ repo.services.length }}
          </span>
        </div>
        <div v-for="s in repo.services.filter(s => match(s, filter))" :key="s.name" class="pa-svc-row pa-svc-service">
          <span class="pa-svc-guide" />
          <span class="pa-svc-state">
            <i v-if="s.state === 'running'" class="dot" />
            <Icon v-else-if="s.state === 'crashed'" name="x_circle" :size="12" class="err" />
            <Icon v-else-if="s.state === 'port'" name="warning" :size="12" class="warn" />
            <i v-else class="ring" />
          </span>
          <span>{{ s.name }}</span>
          <span v-if="s.mode" class="pa-svc-tag mono">{{ s.mode }}</span>
          <span class="grow" />
          <span class="pa-svc-trail" :class="{ mono: s.state !== 'crashed', placeholder: s.state === 'running', err: s.state === 'crashed', warn: s.state === 'port' }">{{ trailing(s) }}</span>
          <span class="pa-svc-hover">
            <Icon v-if="s.state === 'running'" name="rotate_cw" :size="12" />
            <Icon v-if="s.port" name="arrow_up_right" :size="12" />
            <Icon name="terminal" :size="12" />
            <Icon :name="s.state === 'running' ? 'stop' : 'play'" :size="12" />
            <Icon name="ellipsis" :size="12" />
          </span>
        </div>
      </template>
    </div>
    <div class="pa-svc-shared">
      <div class="pa-svc-section"><span class="row" style="gap: 4px"><Icon name="chevron_down" :size="12" class="icon-muted" />Shared - all workspaces</span>
        <span>{{ shared.filter(x => x.state === 'running').length }}/{{ shared.length }}</span></div>
      <div v-for="x in shared" :key="x.name" class="pa-svc-row pa-svc-shared-row"
        :class="{ related: hoverRepo && usesShared(hoverRepo, x) }"
        @mouseenter="hoverShared = x.name" @mouseleave="hoverShared = ''">
        <span class="pa-svc-state"><i :class="x.state === 'running' ? 'dot' : 'ring'" /></span>
        <Icon :name="x.engine ? 'engine-' + x.engine : (x.icon || 'cylinder')" :size="13" :class="{ 'icon-muted': !x.engine }" />
        <span>{{ x.name }}</span>
        <span class="mono placeholder pa-svc-port">:{{ x.port }}</span>
        <span class="grow" />
        <span class="muted pa-svc-users">{{ x.users || 'not used here' }}</span>
      </div>
    </div>
  </div>
</template>

<style>
.pa-svc { display: flex; flex-direction: column; height: 100%; min-height: 0; background: var(--pa-panel-background); font-size: 13px; }
.pa-svc-head { flex: none; height: 34px; padding: 0 12px; gap: 8px; display: flex; align-items: center; }
.pa-svc-title { font-weight: 500; }
.pa-svc-head > .mono { font-size: 11.5px; }
.pa-svc-filter { flex: none; margin: 0 8px; height: 26px; padding: 0 9px; gap: 8px; border-radius: 6px; display: flex; align-items: center;
  background: var(--pa-editor-background); box-shadow: inset 0 0 0 1px var(--pa-border); }
.pa-svc-filter input { font-size: 12.5px; flex: 1; min-width: 0; border: 0; outline: 0; padding: 0; background: none; font: inherit; color: var(--pa-text); }
.pa-svc-filter input::placeholder { color: var(--pa-text-placeholder); }
.pa-svc-segs { flex: none; height: 22px; margin: 6px 8px 10px; gap: 2px; }
.pa-svc-segs span { height: 22px; padding: 0 7px; font-size: 12px; gap: 5px; border-radius: 4px; display: inline-flex; align-items: center; color: var(--pa-text-muted); cursor: pointer; }
.pa-svc-segs i { font-style: normal; font-size: 11px; color: var(--pa-text-placeholder); }
.pa-svc-segs span:hover { background: var(--pa-ghost-element-hover); }
.pa-svc-segs span.on { background: var(--pa-element-background); color: var(--pa-text); }
.pa-svc-scroll { flex: 1; min-height: 0; overflow: hidden; }
.pa-svc-card { margin: 0 8px 4px; padding: 10px; display: flex; flex-direction: column; gap: 8px; border-radius: 6px;
  background: color-mix(in srgb, var(--pa-background) 25%, var(--pa-panel-background)); box-shadow: inset 0 0 0 1px var(--pa-border-variant); }
.pa-svc-card-title { gap: 6px; height: 18px; }
.pa-svc-card-title .muted { font-size: 11.5px; }
.pa-svc-strong { font-weight: 500; }
.pa-svc-tag { height: 17px; padding: 0 4px; border-radius: 3px; box-shadow: inset 0 0 0 1px var(--pa-border-variant); font-size: 11px;
  display: inline-flex; align-items: center; color: var(--pa-text-muted); }
.pa-svc-bar { height: 4px; border-radius: 2px; background: var(--pa-border-variant); display: flex; overflow: hidden; }
.pa-svc-bar span { display: block; height: 100%; }
.pa-svc-legend { gap: 10px; font-size: 11.5px; line-height: 16.2px; color: var(--pa-text-muted); }
.pa-svc-legend span { display: inline-flex; align-items: center; gap: 5px; }
.pa-svc-legend i { width: 7px; height: 7px; border-radius: 50%; display: block; }
.pa-svc-btns { gap: 6px; }
.pa-svc-card-btns { margin-top: 2px; }
.pa-svc-btns.wrap { flex-wrap: wrap; }
.pa-svc-btn { height: 22px; padding: 0 7px; gap: 6px; border-radius: 4px; display: inline-flex; align-items: center; font-size: 11.5px;
  background: var(--pa-element-background); box-shadow: inset 0 0 0 1px var(--pa-border-variant); color: var(--pa-text); white-space: nowrap; cursor: pointer; }
.pa-svc-btn:hover { background: var(--pa-element-hover); }
.pa-svc-btn.info { background: var(--pa-info-background); box-shadow: inset 0 0 0 1px var(--pa-info-border); }
.pa-svc-btn.agent { background: color-mix(in srgb, var(--pa-text-accent) 12%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--pa-text-accent) 55%, transparent); }
.pa-svc-btn.icon { padding: 0 6px; }
.pa-svc-section { flex: none; height: 26px; padding: 2px 10px 0; display: flex; align-items: center; justify-content: space-between; gap: 6px;
  font-size: 11px; font-weight: 500; letter-spacing: 0.03em; text-transform: uppercase; color: var(--pa-text-muted); }
.pa-svc-attn { margin: 0 8px 5px; padding: 9px; display: flex; flex-direction: column; gap: 5px; border-radius: 6px; }
.pa-svc-attn.err-tint { --tint: var(--pa-error); }
.pa-svc-attn.warn-tint { --tint: var(--pa-warning); }
.pa-svc-attn { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tint) 30%, transparent); background: color-mix(in srgb, var(--tint) 6%, transparent); }
.pa-svc-attn-title { gap: 4px; height: 18px; }
.pa-svc-attn-icon { color: var(--tint); }
.pa-svc-ago { font-size: 11px; }
.pa-svc-detail { font-size: 11.5px; line-height: 16.2px; white-space: nowrap; overflow: hidden; }
.pa-svc-exit { font-size: 11.5px; line-height: 16.2px; }
.pa-svc-row { position: relative; height: 26px; padding: 0 4px 0 8px; gap: 6px; display: flex; align-items: center; white-space: nowrap; }
.pa-svc-row:hover { background: var(--pa-ghost-element-hover); }
.pa-svc-row.related { background: color-mix(in srgb, var(--pa-text-accent) 8%, transparent); box-shadow: inset 2px 0 var(--pa-text-accent); }
.pa-svc-repo-name { margin-right: 0; }
.pa-svc-repo { gap: 4px; }
.pa-svc-repo > .pa-svc-repo-name { margin: 0 0 0 2px; }
.pa-svc-pips { display: inline-flex; gap: 3px; }
.pa-svc-pips i { width: 5px; height: 5px; border-radius: 50%; background: var(--pa-border); display: block; }
.pa-svc-pips i.running { background: var(--pa-success); }
.pa-svc-pips i.crashed { background: var(--pa-error); }
.pa-svc-pips i.port { background: var(--pa-warning); }
.pa-svc-ratio { font-size: 11.5px; }
.pa-svc-guide { width: 10px; align-self: stretch; border-right: 1px solid var(--pa-panel-indent-guide); margin-right: 6px; }
.pa-svc-state { width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; flex: none; }
.pa-svc-state .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--pa-success); display: block; }
.pa-svc-state .ring { width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid var(--pa-icon-muted); display: block; }
.pa-svc-trail { font-size: 11.5px; }
.pa-svc-hover { display: none; gap: 8px; color: var(--pa-icon-muted); }
.pa-svc-service:hover .pa-svc-trail { display: none; }
.pa-svc-service:hover .pa-svc-hover { display: inline-flex; }
.pa-svc-shared { flex: none; padding-bottom: 0; background: color-mix(in srgb, var(--pa-background) 33%, var(--pa-panel-background)); box-shadow: inset 0 1px 0 var(--pa-border-variant); }
.pa-svc-shared .pa-svc-section { justify-content: space-between; height: 30px; padding: 4px 7px 0 8px; color: var(--pa-text-placeholder); }
.pa-svc-section.pa-svc-mine { height: 28px; padding-top: 0; }
.pa-svc-port { font-size: 11px; }
.pa-svc-users { font-size: 11px; }
.pa-svc-shared-row { padding-right: 6px !important; }
</style>
