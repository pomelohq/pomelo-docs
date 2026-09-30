<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  folder: { type: String, default: 'exports/' },
  selected: { type: String, default: 'exports/orders-2026-09-27.json' },
})

const bucket = {
  '': [{ folder: 'avatars/', files: 2940, size: '1.2 GB' }, { folder: 'exports/', files: 6, size: '67.2 MB' }, { key: 'invoice-4412.pdf', size: '96.0 KB', at: '2026-09-29 14:02', type: 'application/pdf' }],
  'avatars/': [{ key: 'avatars/user-104.png', size: '48.0 KB', at: '2026-09-30 10:40', type: 'image/png' }, { key: 'avatars/user-109.png', size: '51.0 KB', at: '2026-09-30 10:12', type: 'image/png' }],
  'exports/': [
    { folder: 'exports/2025/', files: 214, size: '61.0 MB' },
    { key: 'exports/customers.csv', size: '3.4 MB', at: '2026-09-28 09:15', type: 'text/csv' },
    { key: 'exports/orders-2026-09-27.json', size: '5.1 MB', at: '2026-09-27 18:42', type: 'application/json' },
    { key: 'exports/report.xlsx', size: '60.0 KB', at: '2026-09-26 08:00', type: 'application/vnd.ms-excel' },
  ],
}
const PREVIEWS = {
  'application/json': [
    ['[', ''], ['  { "id": 5120, "status": "paid", "total_cents": 4900 },', ''],
    ['  { "id": 5119, "status": "refunded", "total_cents": 1200 }', ''], [']', ''], ['... the first 64.0 KB of 5.1 MB shown', 'placeholder'],
  ],
  'text/csv': [['id,email,plan', ''], ['101,ann@example.com,team', ''], ['104,di@example.com,free', ''], ['... the first 64.0 KB of 3.4 MB shown', 'placeholder']],
}
const prefix = ref(props.folder)
const chosen = ref(props.selected)
const find = ref('')
const confirm = ref(false)
const flash = ref('')
function say(text) {
  flash.value = text
  setTimeout(() => { if (flash.value === text) flash.value = '' }, 2200)
}
const name = entry => (entry.folder ? entry.folder.replace(/\/$/, '').split('/').pop() + '/' : entry.key.split('/').pop())
const entries = computed(() => (bucket[prefix.value] || []).filter(e => name(e).toLowerCase().includes(find.value.toLowerCase())))
const crumbs = computed(() => {
  const parts = [['uploads', '']]
  let path = ''
  for (const part of prefix.value.split('/').filter(Boolean)) parts.push([part, path += part + '/'])
  return parts
})
const current = computed(() => (bucket[prefix.value] || []).find(e => e.key === chosen.value))
function open(folder) {
  prefix.value = folder
  chosen.value = null
  find.value = ''
  confirm.value = false
}
function select(entry) {
  if (entry.folder) return open(entry.folder)
  chosen.value = entry.key
  confirm.value = false
}
</script>

<template>
  <div class="pa-bk">
    <div class="pa-bk-main">
      <div class="row pa-bk-bar">
        <Icon name="cylinder" :size="12" class="icon-muted" />
        <span class="muted">api</span><span class="placeholder">/</span><span class="muted">files</span><span class="placeholder">/</span>
        <template v-for="([part, path], i) in crumbs" :key="path">
          <span v-if="i" class="placeholder">/</span>
          <span :class="i === crumbs.length - 1 ? 'pa-bk-strong' : 'muted pa-bk-crumb'" @click="i < crumbs.length - 1 && open(path)">{{ part }}</span>
        </template>
        <span class="placeholder pa-bk-on">on</span><Icon name="branch" :size="11" class="accent" /><span class="mono accent pa-bk-small">feat-login</span>
        <span class="grow" />
        <label class="row pa-bk-input" style="width:200px"><Icon name="search" :size="11" class="icon-muted" /><input v-model="find" placeholder="name in this folder" /></label>
        <span class="pa-bk-btn pa-click" @click="say('Opens the file picker; the files go into this folder')">Upload here</span>
        <span class="pa-click icon-muted" @click="say('Lists the folder again')"><Icon name="rotate_cw" :size="12" /></span>
      </div>
      <div class="row pa-bk-row pa-bk-th"><span class="pa-bk-ic" /><span class="grow">Name</span><span class="pa-bk-size">Size</span><span class="pa-bk-at">Modified</span></div>
      <div class="pa-bk-list">
        <div v-for="entry in entries" :key="entry.folder || entry.key" class="row pa-bk-row pa-click" :class="{ on: entry.key && entry.key === chosen }" @click="select(entry)" @dblclick="entry.key && say(`Opens ${name(entry)} in its own tab`)">
          <span class="pa-bk-ic"><Icon :name="entry.folder ? 'folder' : 'file'" :size="13" :class="entry.folder ? 'accent' : 'icon-muted'" /></span>
          <span class="grow trunc" :class="{ mono: !entry.folder }">{{ name(entry) }}</span>
          <span class="pa-bk-size muted">{{ entry.size }}</span>
          <span class="pa-bk-at placeholder">{{ entry.folder ? `${entry.files} files` : entry.at }}</span>
        </div>
        <div v-if="!entries.length" class="muted pa-bk-empty">{{ find ? `Nothing here is named like ${find}` : 'This folder is empty' }}</div>
      </div>
      <div class="row pa-bk-status"><span class="muted">{{ (bucket[prefix] || []).length }} items</span><span class="grow muted trunc">{{ flash }}</span></div>
    </div>
    <div class="pa-bk-side">
      <template v-if="current">
        <div class="mono trunc pa-bk-name">{{ name(current) }}</div>
        <div v-if="current.type.startsWith('image/')" class="pa-bk-image"><div class="pa-bk-avatar" /></div>
        <div v-else-if="PREVIEWS[current.type]" class="mono pa-bk-text">
          <div v-for="([line, cls], i) in PREVIEWS[current.type]" :key="i" class="trunc" :class="cls">{{ line }}</div>
        </div>
        <div v-else class="placeholder">No preview for this type. Download it to open.</div>
        <div class="pa-bk-sec">DETAILS</div>
        <div class="row pa-bk-kv"><span class="placeholder">size</span><span class="mono">{{ current.size }}</span></div>
        <div class="row pa-bk-kv"><span class="placeholder">content-type</span><span class="mono trunc">{{ current.type }}</span></div>
        <div class="row pa-bk-kv"><span class="placeholder">modified</span><span class="mono">{{ current.at }}</span></div>
        <div v-if="confirm" class="pa-bk-actions">
          <div class="pa-bk-danger">Delete it from the bucket? It cannot be recovered.</div>
          <div class="row pa-bk-gap"><span class="pa-bk-btn pa-click" @click="confirm = false; say(`Deleted ${current.key}`)">Delete</span><span class="pa-bk-btn ghost pa-click" @click="confirm = false">Cancel</span></div>
        </div>
        <div v-else class="pa-bk-actions">
          <div class="row pa-bk-gap"><span class="pa-bk-btn pa-click" @click="say('Downloaded to ~/Downloads')">Download</span><span class="pa-bk-btn ghost pa-click" @click="say('Copied a link that works for 1 hour')">Copy URL (1 hour)</span></div>
          <div class="row pa-bk-gap"><span class="pa-bk-btn ghost pa-click" @click="say(`Copied uploads/${current.key}`)">Copy Path</span><span class="pa-bk-btn pa-click" @click="confirm = true">Delete...</span></div>
        </div>
      </template>
      <div v-else class="placeholder">Select a file to preview it.</div>
    </div>
  </div>
</template>

<style>
.pa-bk { height: 100%; display: flex; background: var(--pa-editor-background); font-size: 12px; color: var(--pa-text); }
.pa-bk-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.pa-bk-bar { height: 36px; padding: 0 10px; gap: 6px; font-size: 12.5px; border-bottom: 1px solid var(--pa-border-variant); flex: none; }
.pa-bk-strong { font-weight: 500; }
.pa-bk-crumb { cursor: pointer; }
.pa-bk-crumb:hover { color: var(--pa-text); text-decoration: underline; }
.pa-bk-on { margin-left: 4px; font-size: 12px; }
.pa-bk-small { font-size: 11.5px; }
.pa-bk-input { height: 24px; gap: 6px; padding: 0 6px; border-radius: 4px; border: 1px solid var(--pa-border-variant); background: var(--pa-editor-background); }
.pa-bk-input input { flex: 1; min-width: 0; background: none; border: none; outline: none; color: var(--pa-text); font-size: 12px; }
.pa-bk-btn { height: 22px; padding: 0 7px; border-radius: 4px; border: 1px solid var(--pa-border-variant); display: inline-flex; align-items: center; flex: none; }
.pa-bk-btn.ghost { border-color: transparent; }
.pa-bk-btn:hover { background: var(--pa-ghost-element-hover); }
.pa-bk-row { height: 28px; padding: 0 12px; gap: 10px; }
.pa-bk-list .pa-bk-row:hover:not(.on) { background: var(--pa-ghost-element-hover); }
.pa-bk-row.on { background: var(--pa-element-selected); }
.pa-bk-th { height: 26px; color: var(--pa-text-placeholder); font-size: 11.5px; border-bottom: 1px solid var(--pa-border-variant); flex: none; }
.pa-bk-ic { width: 16px; flex: none; display: flex; }
.pa-bk-size { width: 90px; flex: none; }
.pa-bk-at { width: 120px; flex: none; }
.pa-bk-list { flex: 1; min-height: 0; overflow: hidden; }
.pa-bk-empty { padding: 6px 12px; }
.pa-bk-status { height: 28px; padding: 0 12px; gap: 10px; border-top: 1px solid var(--pa-border-variant); flex: none; }
.pa-bk-side { width: 300px; flex: none; padding: 12px; border-left: 1px solid var(--pa-border-variant); background: var(--pa-panel-background); display: flex; flex-direction: column; gap: 8px; overflow: hidden; }
.pa-bk-name { font-size: 12.5px; }
.pa-bk-text { padding: 6px 8px; border-radius: 6px; border: 1px solid var(--pa-border-variant); background: var(--pa-editor-background); font-size: 11.5px; line-height: 18px; }
.pa-bk-image { height: 150px; border-radius: 6px; border: 1px solid var(--pa-border-variant); background: repeating-conic-gradient(#2f343e 0 25%, #282c33 0 50%) 0 0 / 16px 16px; display: grid; place-items: center; }
.pa-bk-avatar { width: 84px; height: 84px; border-radius: 50%; background: linear-gradient(135deg, #74ade8, #b494e0); }
.pa-bk-sec { padding-top: 8px; font-size: 10.5px; font-weight: 600; color: var(--pa-text-placeholder); }
.pa-bk-kv { height: 22px; gap: 8px; }
.pa-bk-kv > span:first-child { width: 90px; flex: none; }
.pa-bk-actions { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
.pa-bk-gap { gap: 6px; }
.pa-bk-danger { color: var(--pa-error); }
</style>
