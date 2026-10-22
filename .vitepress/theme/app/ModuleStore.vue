<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'
import './kit.css'

// trailing: new (New workspaces), swap (Use Shared Copy), save (Save to Store), free (Free, shown on hover).
const initial = [
  { name: 'web', manager: 'npm', total: '2.5 GB', versions: [
    { title: 'Current on main', detail: 'package-lock.json changed 6 days ago', mb: 980, users: ['main', 'feat-login', 'feat-react', 'PROJ-101', 'PROJ-104', 'PROJ-107', 'PROJ-110'], trailing: 'new' },
    { title: 'spike-cache has its own copy', detail: 'installed on its own; same package-lock.json as main', mb: 975, users: ['spike-cache'], trailing: 'swap' },
    { title: 'Changed on feat-vite', detail: 'package-lock.json changed 2 days ago', mb: 412, users: ['feat-vite'] },
    { title: '2 old versions', detail: 'no workspace uses these lockfiles any more', mb: 1126, users: [], trailing: 'free', faded: true },
  ] },
  { name: 'worker', manager: 'yarn', total: '310 MB', versions: [
    { title: 'Current on main', detail: 'yarn.lock changed 21 days ago', mb: 310, users: ['main', 'feat-login'], trailing: 'new' },
    { title: 'Changed on feat-queue', detail: 'no saved copy yet; its own install can be kept', mb: 0, users: ['feat-queue'], trailing: 'save' },
  ] },
  { name: 'admin', manager: 'pnpm', note: 'pnpm shares packages itself; Pomelo leaves it alone.' },
  { name: 'api', note: 'No package-lock.json, yarn.lock or bun.lock in its worktrees.' },
]

const repos = ref(structuredClone(initial))
const expanded = ref(false)
const confirm = ref(false)
const hover = ref('')
const size = mb => !mb ? '-' : mb >= 1000 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`
const all = computed(() => repos.value.flatMap(r => r.versions || []))
const unused = computed(() => all.value.filter(v => v.trailing === 'free').reduce((sum, v) => sum + v.mb, 0))
const shown = users => expanded.value ? users : users.slice(0, 5)

function act(repo, version) {
  if (version.trailing === 'swap') {
    repo.versions.find(v => v.trailing === 'new').users.push(...version.users)
    repo.versions = repo.versions.filter(v => v !== version)
  } else if (version.trailing === 'free') {
    repo.versions = repo.versions.filter(v => v !== version)
  } else if (version.trailing === 'save') {
    Object.assign(version, { mb: 318, detail: 'yarn.lock changed 1 day ago', trailing: undefined })
  }
}
function freeUnused() {
  for (const repo of repos.value) if (repo.versions) repo.versions = repo.versions.filter(v => v.trailing !== 'free')
}
function optimize() {
  for (const repo of repos.value) for (const version of [...(repo.versions || [])]) if (['swap', 'free', 'save'].includes(version.trailing)) act(repo, version)
  confirm.value = false
}
const refresh = () => { repos.value = structuredClone(initial); expanded.value = false; confirm.value = false }
const pending = computed(() => all.value.some(v => ['swap', 'free', 'save'].includes(v.trailing)))
</script>

<template>
  <div class="pa-ms">
    <div class="pa-ms-head">
      <span class="pk-heading">node_modules Store</span>
      <span class="pk-small pk-2">2.8 GB saved - copy-on-write, workspaces take no extra disk</span>
      <span class="grow" />
      <span class="pk-btn sm ghost" @click="refresh"><Icon name="rotate_cw" :size="14" />Refresh</span>
      <span class="pk-btn sm ghost" :class="{ off: !unused }" @click="freeUnused">Free {{ size(unused) }} unused</span>
      <span class="pa-ms-anchor">
        <span class="pk-btn sm primary" :class="{ off: !pending }" @click="pending && (confirm = !confirm)">Optimize</span>
        <div v-if="confirm" class="pa-ms-pop">
          <span class="pk-body">Optimize: 1 install kept as the shared copy, 1 workspace moved onto the shared copy, 2 unused copies removed</span>
          <span class="pk-small pk-2">Frees up to 2.1 GB. Each workspace keeps a working node_modules the whole time.</span>
          <span class="pk-small" style="color: var(--pa-warning)">Services are stopped and started again in spike-cache.</span>
          <span class="pa-ms-actions">
            <span class="pk-btn sm secondary" @click="confirm = false">Cancel <span class="pk-kbd">Esc</span></span>
            <span class="pk-btn sm primary" @click="optimize">Optimize <span class="pk-kbd"><Icon name="return" :size="12" /></span></span>
          </span>
        </div>
      </span>
    </div>
    <div class="pa-ms-grid pa-ms-cols pk-label"><span>Lockfile version</span><span class="pa-ms-size">Size</span><span>Used by</span><span /></div>
    <div v-for="repo in repos" :key="repo.name" class="pa-ms-group">
      <div class="pa-ms-ghead">
        <span class="pk-strong">{{ repo.name }}</span>
        <span v-if="repo.manager" class="pk-small pk-2">{{ repo.manager }}</span>
        <span v-if="repo.total" class="pk-small pk-2">- {{ repo.total }}</span>
      </div>
      <div v-if="repo.note" class="pa-ms-note pk-small">{{ repo.note }}</div>
      <div v-for="version in repo.versions" :key="version.title" class="pa-ms-grid pa-ms-row" :class="{ faded: version.faded }"
        @mouseenter="hover = repo.name + version.title" @mouseleave="hover = ''">
        <span class="pa-ms-what"><span class="pk-body">{{ version.title }}</span><span class="pk-small pk-3">{{ version.detail }}</span></span>
        <span class="pa-ms-size pk-code-small">{{ size(version.mb) }}</span>
        <span class="pa-ms-users">
          <span v-if="!version.users.length" class="pk-small pk-3">no workspace</span>
          <span v-for="user in shown(version.users)" :key="user" class="pa-ms-chip" :class="{ main: user === 'main' }">{{ user }}</span>
          <span v-if="!expanded && version.users.length > 5" class="pa-ms-more" @click="expanded = true">+{{ version.users.length - 5 }} more</span>
        </span>
        <span class="pa-ms-trailing">
          <span v-if="version.trailing === 'new'" class="pk-pill success"><span class="pk-dot" />New workspaces</span>
          <span v-else-if="version.trailing === 'swap'" class="pk-btn sm secondary" @click="act(repo, version)">Use Shared Copy</span>
          <span v-else-if="version.trailing === 'save'" class="pk-btn sm secondary" @click="act(repo, version)">Save to Store</span>
          <span v-else-if="version.trailing === 'free' && hover === repo.name + version.title" class="pk-btn sm ghost" @click="act(repo, version)">Free</span>
        </span>
      </div>
    </div>
    <div class="pa-ms-notes pk-small">
      <span>One copy per lockfile, patches/ folder, Node major version and platform.</span>
      <span>A new workspace with a matching one gets it in seconds; otherwise it installs once and that install is kept.</span>
      <span>Stored in ~/Library/Application Support/Pomelo/modules</span>
    </div>
  </div>
</template>

<style>
.pa-ms { height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 18px 28px; background: var(--pa-editor-background); overflow: hidden; }
.pa-ms-head { display: flex; align-items: center; gap: 10px; }
.pa-ms-anchor { position: relative; }
.pa-ms-pop { position: absolute; right: 0; top: calc(100% + 8px); z-index: 5; width: 380px; display: flex; flex-direction: column; gap: 8px; padding: 12px;
  border-radius: 10px; background: var(--pa-element-background); box-shadow: 0 0 0 1px var(--pa-border), 0 12px 32px rgba(0, 0, 0, 0.5); }
.pa-ms-actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 4px; }
.pa-ms-grid { display: grid; grid-template-columns: 280px 76px minmax(0, 1fr) 140px; gap: 10px; align-items: center; }
.pa-ms-cols { padding: 0 14px; }
.pa-ms-size { text-align: right; justify-self: end; }
.pa-ms-group { display: flex; flex-direction: column; border-radius: 10px; background: var(--pa-panel-background); box-shadow: inset 0 0 0 1px var(--pa-border-variant); overflow: hidden; flex: none; }
.pa-ms-ghead { display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; }
.pa-ms-note { padding: 9px 14px 11px; color: var(--pa-text-muted); box-shadow: inset 0 1px 0 var(--pa-border-variant); }
.pa-ms-row { min-height: 58px; padding: 6px 14px; box-shadow: inset 0 1px 0 var(--pa-border-variant); }
.pa-ms-row.faded .pa-ms-what .pk-body { color: var(--pa-text-muted); }
.pa-ms-what { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.pa-ms-what > span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pa-ms-users { display: flex; align-items: center; gap: 4px; overflow: hidden; }
.pa-ms-chip { flex: none; padding: 2px 7px; border-radius: 4px; background: var(--pa-element-background); box-shadow: inset 0 0 0 1px var(--pa-border-variant);
  color: var(--pa-text-muted); font: 11.5px/16px 'Lilex', ui-monospace, monospace; }
.pa-ms-chip.main { color: var(--pa-text); }
.pa-ms-more { flex: none; padding: 2px 7px; color: var(--pa-text-accent); font-size: 12px; cursor: pointer; }
.pa-ms-trailing { display: flex; justify-content: flex-end; }
.pa-ms-notes { display: flex; flex-direction: column; gap: 4px; padding-top: 4px; color: var(--pa-text-placeholder); }
</style>
