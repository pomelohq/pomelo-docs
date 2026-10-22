<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'

const lists = {
  'Team board': [
    ['PROJ-101', 'Payments page crashes on submit', 'In Progress', true],
    ['PROJ-104', 'Add CSV export to reports', 'To Do', false],
    ['PROJ-107', 'Login redirect loses the query string', 'In Review', true],
  ],
  'Platform board': [['PROJ-210', 'Rotate the signing keys', 'To Do', false]],
  Backlog: [['PROJ-115', 'Dynamic pricing for lease options', 'To Do', false], ['PROJ-118', 'Archive old invoices', 'To Do', true]],
  'Assigned to me': [['PROJ-101', 'Payments page crashes on submit', 'In Progress', true], ['PROJ-118', 'Archive old invoices', 'To Do', true]],
}
const sources = [['Team board', 'current sprint'], ['Platform board', 'current sprint'], null, ['Backlog', 'Team board'], ['Assigned to me', 'any board']]
const repos = ref([
  { name: 'api', on: true, nm: 'instant' },
  { name: 'web', on: true, nm: 'once' },
  { name: 'admin', on: true, nm: 'pnpm' },
  { name: 'infra', on: true, nm: '' },
])
const environments = ['local', 'staging', 'staging2', 'sandbox']

const source = ref('Team board')
const menu = ref(false)
const listOpen = ref(true)
const query = ref('')
const highlighted = ref(0)
const ticket = ref(null)
const envOpen = ref(false)
const environment = ref('local')
const fresh = ref(false)

const slug = t => t.toLowerCase()
const suggestions = computed(() => lists[source.value].filter(([key, summary]) =>
  (key + ' ' + summary).toLowerCase().includes(query.value.toLowerCase())))
const name = computed(() => ticket.value ? ticket.value[1] : '')
const branch = computed(() => ticket.value ? slug(ticket.value[0]) : '')
const picked = computed(() => repos.value.filter(r => r.on))
const once = computed(() => picked.value.filter(r => r.nm === 'once').length)
const summary = computed(() => [
  once.value ? `${once.value} installs once` : 'all instant',
  fresh.value ? 'databases seeded empty' : 'databases copied from main',
  environment.value,
].map(part => ' - ' + part).join(''))
const statusClass = status => status === 'To Do' ? '' : 'prog'

function pickSource(name) { source.value = name; menu.value = false; listOpen.value = true; highlighted.value = 0 }
function pick(issue) { ticket.value = issue; query.value = issue[0]; listOpen.value = false }
function key(event) {
  const count = suggestions.value.length
  if (event.key === 'Escape') { listOpen.value = false; return }
  if (event.key === 'ArrowDown' && count) { highlighted.value = (highlighted.value + 1) % count; event.preventDefault() }
  if (event.key === 'ArrowUp' && count) { highlighted.value = (highlighted.value + count - 1) % count; event.preventDefault() }
  if (event.key === 'Enter' && listOpen.value && suggestions.value[highlighted.value]) pick(suggestions.value[highlighted.value])
}
function typed() { listOpen.value = true; highlighted.value = 0; ticket.value = null }
</script>

<template>
  <div class="pa-cw" @click="menu = false; envOpen = false">
    <div class="row pa-cw-head"><span class="pa-cw-title">Create Workspace</span><span class="grow" /><Icon name="close" :size="12" /></div>
    <div class="col pa-cw-body">
      <div class="col pa-cw-field">
        <div class="row pa-cw-label">
          <span>Ticket</span>
          <span class="pa-cw-anchor">
            <span class="row pa-cw-source" :class="{ open: menu }" @click.stop="menu = !menu; envOpen = false">{{ source }} <Icon name="chevron_down" :size="10" /></span>
            <div v-if="menu" class="pa-cw-menu" @click.stop>
              <template v-for="(entry, i) in sources" :key="i">
                <div v-if="!entry" class="pa-cw-sep" />
                <div v-else class="row pa-cw-item" :class="{ on: entry[0] === source }" @click="pickSource(entry[0])">
                  <span class="grow">{{ entry[0] }}</span><span class="placeholder pa-xs">{{ entry[1] }}</span></div>
              </template>
            </div>
          </span>
          <span class="muted">optional; pick one or type a key</span>
        </div>
        <div class="pa-cw-anchor">
          <input v-model="query" class="pa-cw-input mono" placeholder="PROJ-101" @focus="listOpen = true" @input="typed" @keydown="key" @click.stop />
          <div v-if="listOpen && suggestions.length" class="pa-cw-list" @click.stop>
            <div v-for="(issue, i) in suggestions" :key="issue[0]" class="row pa-cw-ticket" :class="{ sel: i === highlighted }"
              @mouseenter="highlighted = i" @click="pick(issue)">
              <span class="mono pa-cw-key">{{ issue[0] }}</span>
              <span class="trunc grow">{{ issue[1] }}</span>
              <span class="pa-cw-status" :class="statusClass(issue[2])">{{ issue[2] }}</span>
              <span class="placeholder pa-cw-mine">{{ issue[3] ? 'Mine' : '' }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="row pa-cw-pair">
        <div class="col grow pa-cw-field">
          <div class="row pa-cw-label"><span>Name</span><span v-if="ticket" class="muted">from {{ ticket[0] }}</span></div>
          <div class="pa-cw-input" :class="{ placeholder: !name }">{{ name || 'Display name' }}</div>
        </div>
        <div class="col grow pa-cw-field">
          <div class="row pa-cw-label"><span>Branch</span><span class="muted">{{ ticket ? `from ${ticket[0]}` : 'of every repo, unless set below' }}</span></div>
          <div class="pa-cw-input mono" :class="{ placeholder: !branch }">{{ branch || 'feat-login' }}</div>
        </div>
      </div>
      <div class="col pa-cw-field">
        <div class="row pa-cw-label"><span>Repos</span><span class="muted">click a branch to use another one in that repo</span></div>
        <div class="pa-cw-repos">
          <div v-for="repo in repos" :key="repo.name" class="row pa-cw-repo" :class="{ off: !repo.on }">
            <span class="pa-cw-check" :class="{ on: repo.on }" @click="repo.on = !repo.on"><Icon v-if="repo.on" name="check" :size="11" /></span>
            <span class="pa-cw-rname">{{ repo.name }}</span>
            <span class="row grow pa-cw-branch"><Icon name="branch" :size="11" /><span class="mono">{{ branch || 'workspace branch' }}</span>
              <span class="grow" /><span class="placeholder pa-xs">new, from main</span><Icon name="chevron_down" :size="9" /></span>
            <span class="pa-cw-nm" :class="repo.nm">{{ !repo.on ? '' : repo.nm === 'instant' ? 'node_modules instant' : repo.nm === 'once' ? 'installs once' : repo.nm }}</span>
          </div>
        </div>
      </div>
      <div class="row pa-cw-pair">
        <div class="col grow pa-cw-field">
          <div class="row pa-cw-label"><span>Environment</span><span class="muted">what the services point at</span></div>
          <div class="pa-cw-anchor">
            <div class="row pa-cw-select" :class="{ open: envOpen }" @click.stop="envOpen = !envOpen; menu = false">
              <span class="grow">{{ environment }}</span><Icon name="chevron_down" :size="10" /></div>
            <div v-if="envOpen" class="pa-cw-menu wide" @click.stop>
              <div v-for="env in environments" :key="env" class="row pa-cw-item" :class="{ on: env === environment }"
                @click="environment = env; envOpen = false">{{ env }}</div>
            </div>
          </div>
        </div>
        <div class="col grow pa-cw-field">
          <div class="row pa-cw-label"><span>Data</span><span class="muted">the workspace's databases</span></div>
          <div class="row pa-cw-toggle">
            <span :class="{ on: !fresh }" @click="fresh = false">Copy from main</span>
            <span :class="{ on: fresh }" @click="fresh = true">Empty, run seeds</span>
          </div>
        </div>
      </div>
    </div>
    <div class="row pa-cw-foot">
      <span class="trunc grow"><span>{{ picked.length }} repos</span><span class="muted">{{ summary }}</span></span>
      <span class="pa-cw-btn">Cancel <span class="muted">Escape</span></span>
      <span class="pa-cw-btn" :class="{ off: !branch }">Create</span>
    </div>
  </div>
</template>

<style>
.pa-cw { width: 720px; margin: 0 auto; border-radius: 8px; border: 1px solid var(--pa-border-variant); background: var(--pa-elevated-surface-background);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.45); font-size: 12.5px; }
.pa-cw-head { padding: 10px 12px 4px; color: var(--pa-icon-muted); }
.pa-cw-title { font-size: 16px; color: var(--pa-text-muted); }
.pa-cw-body { padding: 0 12px 10px; gap: 10px; }
.pa-cw-field { gap: 4px; }
.pa .pa-cw-pair { gap: 12px; align-items: flex-start; }
.pa-cw-label { gap: 6px; font-size: 11.5px; }
.pa-cw-anchor { position: relative; }
.pa-cw-source { gap: 4px; height: 20px; padding: 0 6px; border-radius: 4px; color: var(--pa-text-muted); cursor: pointer; }
.pa-cw-source:hover, .pa-cw-source.open { background: var(--pa-ghost-element-hover); color: var(--pa-text); }
.pa-cw-input { width: 100%; height: 32px; padding: 0 8px; display: flex; align-items: center; border-radius: 6px; border: 1px solid var(--pa-border-variant);
  background: var(--pa-editor-background); color: var(--pa-text); font: inherit; font-size: 13px; outline: none; }
input.pa-cw-input.mono { font-family: 'Lilex', ui-monospace, monospace; }
.pa-cw-input:focus { border-color: var(--pa-border-focused); }
.pa-cw-input::placeholder { color: var(--pa-text-placeholder); }
.pa-cw-menu, .pa-cw-list { position: absolute; z-index: 5; top: calc(100% + 4px); left: 0; padding: 4px; border-radius: 8px; border: 1px solid var(--pa-border);
  background: var(--pa-elevated-surface-background); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45); }
.pa-cw-menu { width: 260px; }
.pa-cw-menu.wide { width: 100%; }
.pa-cw-list { right: 0; }
.pa-cw-item { height: 26px; padding: 0 8px; gap: 8px; border-radius: 4px; font-size: 13px; cursor: pointer; }
.pa-cw-item:hover { background: var(--pa-ghost-element-hover); }
.pa-cw-item.on { color: var(--pa-text-accent); }
.pa-cw-sep { height: 1px; margin: 4px 2px; background: var(--pa-border-variant); }
.pa-cw-ticket { height: 28px; padding: 0 8px; gap: 10px; border-radius: 5px; font-size: 12px; cursor: pointer; }
.pa-cw-ticket.sel { background: var(--pa-element-selected); }
.pa-cw-key { width: 76px; flex: none; color: var(--pa-text-accent); }
.pa-cw-status { width: 100px; flex: none; }
.pa-cw-status { font-size: 11px; color: var(--pa-text-muted); }
.pa-cw-status.prog { color: var(--pa-text-accent); }
.pa-cw-mine { width: 36px; flex: none; font-size: 11px; }
.pa-cw-repos { border: 1px solid var(--pa-border-variant); border-radius: 6px; }
.pa-cw-repo { height: 36px; padding: 0 8px 0 6px; gap: 8px; border-top: 1px solid var(--pa-border-variant); }
.pa-cw-repo:first-child { border-top: none; }
.pa-cw-repo.off .pa-cw-rname, .pa-cw-repo.off .pa-cw-branch { color: var(--pa-text-disabled); }
.pa-cw-check { width: 16px; height: 16px; border-radius: 2px; border: 1px solid var(--pa-border); display: flex; align-items: center; justify-content: center;
  color: var(--pa-text-accent); cursor: pointer; }
.pa-cw-rname { width: 140px; flex: none; font-size: 13px; }
.pa-cw-branch { gap: 6px; height: 26px; padding: 0 6px 0 8px; border-radius: 5px; color: var(--pa-icon-muted); font-size: 12px; cursor: pointer; }
.pa-cw-branch .mono { color: var(--pa-text); }
.pa-cw-branch:hover { background: var(--pa-ghost-element-hover); }
.pa-cw-nm { width: 130px; flex: none; text-align: right; font-size: 11px; color: var(--pa-text-muted); }
.pa-cw-nm.instant { color: var(--pa-success); }
.pa-cw-nm.once { color: var(--pa-warning); }
.pa-cw-select { height: 28px; padding: 0 10px; gap: 6px; border-radius: 6px; border: 1px solid var(--pa-border); font-size: 12px; cursor: pointer; }
.pa-cw-select:hover, .pa-cw-select.open { background: var(--pa-ghost-element-hover); }
.pa-cw-toggle { border-radius: 6px; border: 1px solid var(--pa-border); overflow: hidden; }
.pa-cw-toggle span { flex: 1; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; }
.pa-cw-toggle span + span { border-left: 1px solid var(--pa-border); }
.pa-cw-toggle span.on { background: var(--pa-info-background); color: var(--pa-text-accent); }
.pa-cw-foot { gap: 6px; padding: 8px 12px; border-top: 1px solid var(--pa-border-variant); font-size: 12px; }
.pa-cw-btn { padding: 3px 6px; border-radius: 4px; font-size: 13px; cursor: pointer; }
.pa-cw-btn:hover { background: var(--pa-ghost-element-hover); }
.pa-cw-btn.off { opacity: 0.45; }
</style>
