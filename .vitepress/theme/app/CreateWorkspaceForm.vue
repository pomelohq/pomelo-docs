<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'
import './kit.css'

const lists = {
  Web: [
    ['PROJ-118', 'Login page', 'In Progress', true],
    ['PROJ-101', 'Payments page crashes on submit', 'In Progress', true],
    ['PROJ-104', 'Add CSV export to reports', 'To Do', false],
    ['PROJ-107', 'Login redirect loses the query string', 'In Review', false],
  ],
  Platform: [['PROJ-210', 'Rotate the signing keys', 'To Do', false]],
  Backlog: [['PROJ-115', 'Dynamic pricing for lease options', 'To Do', false], ['PROJ-119', 'Archive old invoices', 'To Do', true]],
  'Assigned to me': [['PROJ-118', 'Login page', 'In Progress', true], ['PROJ-119', 'Archive old invoices', 'To Do', true]],
}
const sources = [['Web', 'current sprint'], ['Platform', 'current sprint'], ['Backlog', 'Web board'], ['Assigned to me', 'any board']]
const repos = ref([
  { name: 'api', on: true, branch: '', how: 'new, from main', outlook: 'installs once' },
  { name: 'web', on: true, branch: 'feat-checkout-ui', how: 'taken over from origin', outlook: 'node_modules instant' },
  { name: 'worker', on: true, branch: '', how: 'new, from main', outlook: 'installs' },
])
const tone = { 'installs once': 'var(--pa-warning)', 'node_modules instant': 'var(--pa-success)', installs: 'var(--pa-text-placeholder)' }

const source = ref('Web')
const menu = ref(false)
const listOpen = ref(false)
const query = ref('PROJ-118')
const highlighted = ref(0)
const ticket = ref(lists.Web[0])
const environment = ref(0)
const fresh = ref(0)

const suggestions = computed(() => lists[source.value].filter(([key, summary]) =>
  (key + ' ' + summary).toLowerCase().includes(query.value.toLowerCase())))
const name = computed(() => ticket.value ? ticket.value[1] : '')
const branch = computed(() => ticket.value ? ticket.value[0].toLowerCase() : '')
const picked = computed(() => repos.value.filter(r => r.on))
const summary = computed(() => {
  const parts = [`${picked.value.length} repos`]
  for (const kind of ['installs once', 'installs']) {
    const count = picked.value.filter(r => r.outlook === kind).length
    if (count) parts.push(`${count} ${kind}`)
  }
  parts.push(fresh.value ? 'databases seeded empty' : 'databases copied from main', environment.value ? 'staging' : 'local')
  return parts.join(', ')
})

function pickSource(entry) { source.value = entry; menu.value = false; listOpen.value = true; highlighted.value = 0; query.value = ''; ticket.value = null }
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
  <div class="pa-cw pk-overlay" @click="menu = false; listOpen = false">
    <div class="pa-cw-head"><span class="pk-heading">Create Workspace</span><span class="pk-btn sm icon ghost"><Icon name="close" :size="14" /></span></div>
    <div class="pa-cw-body">
      <div class="pa-cw-field">
        <span class="pa-cw-fhead">
          <span class="pk-label">Ticket</span>
          <span class="pa-cw-anchor">
            <span class="pa-cw-source" @click.stop="menu = !menu; listOpen = false">{{ source }} <Icon name="chevron_down" :size="10" /></span>
            <div v-if="menu" class="pa-cw-menu pk-overlay" @click.stop>
              <div v-for="entry in sources" :key="entry[0]" class="pa-cw-item" :class="{ on: entry[0] === source }" @click="pickSource(entry[0])">
                <span class="grow">{{ entry[0] }}</span><span class="pk-small pk-3">{{ entry[1] }}</span></div>
            </div>
          </span>
        </span>
        <div class="pa-cw-anchor">
          <label class="pk-input pa-cw-ticket-input" @click.stop>
            <Icon name="ticket" :size="16" class="pa-cw-ticket-icon" />
            <input v-model="query" class="pa-cw-bare" placeholder="PROJ-101" :style="{ width: (Math.max(query.length, 8) + 1) + 'ch' }"
              @focus="listOpen = true" @input="typed" @keydown="key" />
            <span v-if="ticket" class="pk-3 trunc">{{ ticket[1] }}</span>
          </label>
          <div v-if="listOpen && suggestions.length" class="pa-cw-list pk-overlay" @click.stop>
            <div v-for="(issue, i) in suggestions" :key="issue[0]" class="pa-cw-ticket" :class="{ sel: i === highlighted }"
              @mouseenter="highlighted = i" @click="pick(issue)">
              <span class="pk-code-small pa-cw-key">{{ issue[0] }}</span>
              <span class="trunc grow">{{ issue[1] }}</span>
              <span class="pa-cw-status" :class="{ prog: issue[2] !== 'To Do' }">{{ issue[2] }}</span>
              <span class="pk-3 pa-cw-mine">{{ issue[3] ? 'Mine' : '' }}</span>
            </div>
          </div>
        </div>
        <span class="pk-small pk-3">{{ ticket ? `Name and branch from ${ticket[0]}` : 'optional; pick one or type a key' }}</span>
      </div>
      <div class="pa-cw-two">
        <div class="pa-cw-field">
          <span class="pk-label">Name</span>
          <div class="pk-input focus"><span v-if="name" class="pk-value">{{ name }}</span><span v-else>Display name</span><span class="pk-caret" /></div>
        </div>
        <div class="pa-cw-field">
          <span class="pk-label">Branch</span>
          <div class="pk-input"><span v-if="branch" class="pk-value">{{ branch }}</span><span v-else>feat-login</span></div>
        </div>
      </div>
      <span class="pa-cw-refine pk-small"><Icon name="sparkle" :size="12" /> Refine name &amp; branch with Claude</span>
      <div class="pa-cw-field">
        <span class="pk-label">Repos</span>
        <div class="pa-cw-repos">
          <div v-for="repo in repos" :key="repo.name" class="pa-cw-repo" :class="{ off: !repo.on }">
            <span class="pk-box" :class="{ on: repo.on }" @click="repo.on = !repo.on"><Icon v-if="repo.on" name="check" :size="10" /></span>
            <span class="pa-cw-rname pk-small">{{ repo.name }}</span>
            <span class="pa-cw-branch pk-small">
              <Icon name="branch" :size="12" />
              <span class="pk-code-small" :class="{ taken: repo.branch }">{{ repo.branch || branch || 'feat-login' }}</span>
              <span class="pk-3 trunc">{{ repo.how }}</span>
            </span>
            <span class="pk-small" :style="{ color: tone[repo.outlook] }">{{ repo.on ? repo.outlook : '' }}</span>
          </div>
        </div>
        <span class="pk-small pk-3">click a branch to use another one in that repo</span>
      </div>
      <div class="pa-cw-two">
        <div class="pa-cw-field">
          <span class="pk-label">Environment</span>
          <div class="pk-seg"><span v-for="(option, i) in ['local', 'staging']" :key="option" :class="{ on: environment === i }" @click="environment = i">{{ option }}</span></div>
          <span class="pk-small pk-3">what the services point at</span>
        </div>
        <div class="pa-cw-field">
          <span class="pk-label">Data</span>
          <div class="pk-seg"><span v-for="(option, i) in ['Copy from main', 'Empty, run seeds']" :key="option" :class="{ on: fresh === i }" @click="fresh = i">{{ option }}</span></div>
          <span class="pk-small pk-3">the workspace's databases</span>
        </div>
      </div>
    </div>
    <div class="pa-cw-foot">
      <span class="pk-small pk-3 trunc grow">{{ summary }}</span>
      <span class="pk-btn secondary">Cancel <span class="pk-kbd">Esc</span></span>
      <span class="pk-btn primary" :class="{ off: !branch }">Create <span class="pk-kbd"><Icon name="return" :size="12" /></span></span>
    </div>
  </div>
</template>

<style>
.pa-cw { width: 620px; display: flex; flex-direction: column; overflow: hidden; }
.pa-cw-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 12px 6px 18px; }
.pa-cw-head .pk-btn { color: var(--pa-text); }
.pa-cw-body { display: flex; flex-direction: column; gap: 16px; padding: 10px 18px 18px; }
.pa-cw-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.pa-cw-fhead { display: flex; align-items: center; gap: 6px; height: 14px; }
.pa-cw-two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.pa-cw-anchor { position: relative; }
.pa-cw-source { display: inline-flex; align-items: center; gap: 4px; padding: 0 4px; font-size: 11px; line-height: 14px; color: var(--pa-text-muted); cursor: pointer; border-radius: 4px; }
.pa-cw-source:hover { background: var(--pa-ghost-element-hover); color: var(--pa-text); }
.pa-cw-ticket-input { cursor: text; }
.pa-cw-ticket-icon { color: var(--pa-text-muted); }
.pa-cw-bare { flex: none; min-width: 0; border: 0; outline: none; background: none; padding: 0; font: 500 13px/1 'IBM Plex Sans', system-ui, sans-serif; color: var(--pa-text); }
.pa-cw-bare::placeholder { color: var(--pa-text-placeholder); font-weight: 400; }
.pa-cw-menu, .pa-cw-list { position: absolute; z-index: 5; top: calc(100% + 4px); left: 0; padding: 4px; }
.pa-cw-menu { width: 240px; }
.pa-cw-list { right: 0; }
.pa-cw-item { display: flex; align-items: center; height: 26px; padding: 0 8px; gap: 8px; border-radius: 5px; font-size: 13px; cursor: pointer; }
.pa-cw-item:hover { background: var(--pa-element-hover); }
.pa-cw-item.on { color: var(--pa-text-accent); }
.pa-cw-ticket { display: flex; align-items: center; height: 28px; padding: 0 8px; gap: 10px; border-radius: 5px; font-size: 12px; cursor: pointer; }
.pa-cw-ticket.sel { background: var(--pa-overlay-selected); }
.pa-cw-key { width: 76px; flex: none; color: var(--pa-text-accent); }
.pa-cw-status { width: 90px; flex: none; font-size: 11px; color: var(--pa-text-muted); }
.pa-cw-status.prog { color: var(--pa-text-accent); }
.pa-cw-mine { width: 36px; flex: none; font-size: 11px; }
.pa-cw-refine { display: inline-flex; align-items: center; gap: 6px; color: var(--pa-text-accent); align-self: flex-start; }
.pa-cw-repos { display: flex; flex-direction: column; gap: 2px; border-radius: 6px; background: var(--pa-editor-background); padding: 4px; }
.pa-cw-repo { display: flex; align-items: center; gap: 10px; height: 34px; padding: 0 8px; border-radius: 4px; }
.pa-cw-rname { width: 80px; flex: none; font-family: 'Lilex', ui-monospace, monospace; color: var(--pa-text); }
.pa-cw-branch { flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; color: var(--pa-text-muted); white-space: nowrap; }
.pa-cw-branch .taken { color: var(--pa-warning); }
.pa-cw-repo.off .pa-cw-rname, .pa-cw-repo.off .pa-cw-branch { color: var(--pa-text-disabled); }
.pa-cw-foot { display: flex; align-items: center; gap: 8px; padding: 12px 14px; background: var(--pa-panel-background); }
</style>
