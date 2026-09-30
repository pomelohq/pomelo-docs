<script setup>
import { computed, ref } from 'vue'

// action: new (New workspaces), shared (Use Shared Copy), save (Save to Store), free (Free), none.
const initial = [
  { repo: 'api', manager: 'npm', rows: [
    { title: 'Current on main', sub: 'package-lock.json changed 12 days ago', size: 1.4, users: ['main', 'feat-login', 'feat-pay', 'PROJ-101', 'PROJ-102', 'PROJ-104', 'PROJ-107', 'PROJ-110', 'PROJ-111', 'PROJ-115', 'PROJ-118'], action: 'new' },
    { title: 'Changed on feat-react', sub: 'package-lock.json changed 3 days ago', size: 1.5, users: ['feat-react'], action: 'none' },
    { title: '2 old versions', sub: 'no workspace uses these lockfiles any more', size: 2.1, users: [], action: 'free' },
  ] },
  { repo: 'web', manager: 'yarn', rows: [
    { title: 'Current on main', sub: 'yarn.lock changed 2 days ago', size: 1.2, users: ['main', 'feat-login'], action: 'new' },
    { title: 'feat-pay has its own copy', sub: 'installed on its own; same yarn.lock as main', size: 1.2, users: ['feat-pay'], action: 'shared' },
  ] },
  { repo: 'admin', manager: 'yarn', rows: [
    { title: 'Current on main', sub: 'no saved copy yet; its own install can be kept', size: null, users: ['main'], action: 'save' },
  ] },
  { repo: 'docs', manager: 'pnpm', note: 'pnpm shares packages itself; Pomelo leaves it alone.' },
]

const groups = ref(structuredClone(initial))
const expanded = ref(false)
const confirm = ref(false)
const shownUsers = users => expanded.value ? users : users.slice(0, 5)
const gb = size => `${size.toFixed(1)} GB`
const total = rows => (rows || []).reduce((sum, row) => sum + (row.size || 0), 0)
const unused = computed(() => groups.value.flatMap(g => g.rows || []).filter(r => r.action === 'free' || r.action === 'shared')
  .reduce((sum, r) => sum + r.size, 0))
const saved = computed(() => groups.value.flatMap(g => g.rows || []).reduce((sum, r) => sum + (r.size || 0) * Math.max(0, r.users.length - 1), 0))

function act(group, row) {
  if (row.action === 'shared') {
    const main = group.rows.find(r => r.title === 'Current on main')
    main.users.push(...row.users)
    group.rows = group.rows.filter(r => r !== row)
  } else if (row.action === 'free') {
    group.rows = group.rows.filter(r => r !== row)
  } else if (row.action === 'save') {
    row.size = 3.4; row.sub = 'saved from main'; row.action = 'new'
  }
}
function optimize() {
  for (const group of groups.value) for (const row of [...(group.rows || [])]) if (row.action !== 'new' && row.action !== 'none') act(group, row)
  confirm.value = false
}
const reset = () => { groups.value = structuredClone(initial); expanded.value = false }
const done = computed(() => unused.value === 0 && !groups.value.some(g => (g.rows || []).some(r => r.action === 'save')))
</script>

<template>
  <div class="pa-ms">
    <div class="row pa-ms-head">
      <span class="pa-ms-title">node_modules Store</span>
      <span class="muted">{{ gb(saved) }} saved - copy-on-write, workspaces take no extra disk</span>
      <span class="grow" />
      <span class="pa-ms-link" @click="reset">Refresh</span>
      <span class="pa-ms-link" :class="{ off: !unused }">Free {{ gb(unused) }} unused</span>
      <span class="pa-ms-anchor">
        <span class="pa-ms-btn accent" :class="{ off: done }" @click="!done && (confirm = !confirm)">Optimize</span>
        <div v-if="confirm" class="pa-ms-pop">
          <div class="pa-strong">Optimize the store?</div>
          <div class="muted">Keeps admin's install, moves feat-pay onto the shared copy (its services restart) and frees the unused copies: up to {{ gb(unused) }}.</div>
          <div class="row pa-ms-popbtns"><span class="grow" /><span class="pa-ms-link" @click="confirm = false">Cancel</span>
            <span class="pa-ms-btn accent" @click="optimize">Optimize</span></div>
        </div>
      </span>
    </div>
    <div class="row pa-ms-cols"><span class="pa-ms-c1">LOCKFILE VERSION</span><span class="pa-ms-c2">SIZE</span><span>USED BY</span></div>
    <div v-for="group in groups" :key="group.repo" class="pa-ms-group">
      <div class="row pa-ms-ghead"><span class="pa-strong">{{ group.repo }}</span><span class="muted">{{ group.manager }}</span>
        <span v-if="group.rows && total(group.rows)" class="muted">- {{ gb(total(group.rows)) }}</span></div>
      <div v-if="group.note" class="pa-ms-note">{{ group.note }}</div>
      <div v-for="row in group.rows" :key="row.title" class="row pa-ms-row">
        <div class="col pa-ms-c1"><span :class="{ muted: row.action === 'free' }">{{ row.title }}</span><span class="muted pa-small">{{ row.sub }}</span></div>
        <span class="pa-ms-c2">{{ row.size ? gb(row.size) : '-' }}</span>
        <div class="row grow pa-ms-users">
          <span v-if="!row.users.length" class="muted">no workspace</span>
          <span v-for="user in shownUsers(row.users)" :key="user" class="pa-ms-chip">{{ user }}</span>
          <span v-if="!expanded && row.users.length > 5" class="pa-ms-more" @click="expanded = true">+{{ row.users.length - 5 }} more</span>
        </div>
        <span v-if="row.action === 'new'" class="pa-ms-badge">New workspaces</span>
        <span v-else-if="row.action === 'shared'" class="pa-ms-btn accent" @click="act(group, row)">Use Shared Copy</span>
        <span v-else-if="row.action === 'save'" class="pa-ms-btn accent" @click="act(group, row)">Save to Store</span>
        <span v-else-if="row.action === 'free'" class="pa-ms-btn" @click="act(group, row)">Free</span>
      </div>
    </div>
    <div class="muted pa-ms-foot">One copy per lockfile, patches/ folder, Node major version and platform. A new workspace with a matching one gets it in seconds; otherwise it installs once and that install is kept.</div>
  </div>
</template>

<style>
.pa-ms { height: 100%; padding: 18px 28px; background: var(--pa-editor-background); overflow: hidden; font-size: 12.5px; }
.pa-ms-head { gap: 10px; margin-bottom: 14px; }
.pa-ms-title { font-size: 16px; }
.pa-ms-link { padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; }
.pa-ms-link:hover { background: var(--pa-ghost-element-hover); }
.pa-ms-link.off, .pa-ms-btn.off { opacity: 0.45; pointer-events: none; }
.pa-ms-btn { padding: 3px 9px; border-radius: 5px; border: 1px solid var(--pa-border); font-size: 12px; cursor: pointer; white-space: nowrap; }
.pa-ms-btn:hover { background: var(--pa-ghost-element-hover); }
.pa-ms-btn.accent { color: var(--pa-text-accent); border-color: var(--pa-border-focused); }
.pa-ms-anchor { position: relative; }
.pa-ms-pop { position: absolute; right: 0; top: calc(100% + 6px); width: 300px; z-index: 5; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px;
  border-radius: 8px; border: 1px solid var(--pa-border); background: var(--pa-elevated-surface-background); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4); font-size: 12px; }
.pa-ms-popbtns { gap: 6px; margin-top: 4px; }
.pa-ms-cols { padding: 0 12px 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.03em; color: var(--pa-text-muted); }
.pa-ms-c1 { width: 300px; flex: none; }
.pa-ms-c2 { width: 70px; flex: none; text-align: right; margin-right: 10px; }
.pa-ms-group { border: 1px solid var(--pa-border-variant); border-radius: 6px; margin-bottom: 12px; overflow: hidden; }
.pa-ms-ghead { gap: 8px; height: 34px; padding: 0 14px; background: var(--pa-panel-background); border-bottom: 1px solid var(--pa-border-variant); }
.pa-ms-row { min-height: 48px; padding: 6px 12px; gap: 0; border-top: 1px solid var(--pa-border-variant); }
.pa-ms-ghead + .pa-ms-row { border-top: none; }
.pa-ms-users { gap: 5px; flex-wrap: nowrap; overflow: hidden; }
.pa-ms-chip { padding: 1px 6px; border-radius: 4px; border: 1px solid var(--pa-border-variant); font-size: 11.5px; white-space: nowrap; }
.pa-ms-more { color: var(--pa-text-accent); font-size: 11.5px; cursor: pointer; white-space: nowrap; }
.pa-ms-badge { padding: 2px 9px; border-radius: 10px; border: 1px solid var(--pa-success); color: var(--pa-success); font-size: 11.5px; white-space: nowrap; }
.pa-ms-note { padding: 12px; }
.pa-ms-foot { font-size: 11.5px; line-height: 1.5; }
</style>
