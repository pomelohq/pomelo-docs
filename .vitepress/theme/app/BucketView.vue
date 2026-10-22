<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'
import './data.css'

const props = defineProps({
  folder: { type: String, default: 'exports/' },
  selected: { type: String, default: 'exports/orders-2026-09-27.json' },
})

const bucket = {
  '': [{ folder: 'avatars/', files: 2940, size: '1.2 GB' }, { folder: 'exports/', files: 6, size: '67.2 MB' }, { key: 'invoice-4412.pdf', size: '96.0 KB', at: '2026-09-29 14:02', type: 'application/pdf' }],
  'avatars/': [{ key: 'avatars/user-104.png', size: '48.0 KB', at: '2026-09-30 10:40', type: 'image/png' }, { key: 'avatars/user-109.png', size: '51.0 KB', at: '2026-09-30 10:12', type: 'image/png' }],
  'exports/': [
    { folder: 'exports/2025/', files: 214, size: '61.0 MB' },
    { folder: 'exports/archive/', files: 14, size: '1.2 MB' },
    { key: 'exports/customers.csv', size: '3.4 MB', at: '2026-09-28 09:15', type: 'text/csv' },
    { key: 'exports/invoice-4412.pdf', size: '96.0 KB', at: '2026-09-29 14:02', type: 'application/pdf' },
    { key: 'exports/orders-2026-09-27.json', size: '5.1 MB', at: '2026-09-27 18:42', type: 'application/json' },
    { key: 'exports/report.xlsx', size: '60.0 KB', at: '2026-09-26 08:00', type: 'application/vnd.ms-excel' },
  ],
}
const PREVIEWS = {
  'application/json': [
    ['[', ''], ['  { "id": 5120, "status": "paid", "total_cents": 4900 },', ''],
    ['  { "id": 5119, "status": "refunded", "total_cents": 1200 }', ''], [']', ''], ['... the first 121 B of 5.1 MB shown', ''],
  ],
  'text/csv': [['id,email,plan', ''], ['101,ann@example.com,team', ''], ['104,di@example.com,free', ''], ['... the first 64 B of 3.4 MB shown', '']],
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
  <div class="pa-dt pa-bk">
    <div class="pa-dt-bar">
      <span class="pa-dt-crumb"><Icon name="engine-minio" :size="13" class="pa-engine" />
        <template v-for="([part, path], i) in crumbs" :key="path">
          <i v-if="i">/</i>
          <b v-if="i === crumbs.length - 1">{{ part }}</b>
          <span v-else class="pa-bk-crumb" @click="open(path)">{{ part }}</span>
        </template>
      </span>
      <span class="grow" />
      <label class="pa-dt-field pa-bk-find"><Icon name="search" :size="11" class="icon-muted" /><input v-model="find" placeholder="name in this folder" /></label>
      <span class="pa-dt-btn secondary" @click="say('Opens the file picker; the files go into this folder')"><Icon name="arrow_up" :size="12" />Upload here</span>
      <span class="pa-dt-btn icon" @click="say('Lists the folder again')"><Icon name="rotate_cw" :size="13" /></span>
    </div>
    <div class="pa-dt-split">
      <div class="pa-dt-card grow">
        <div class="row pa-bk-row pa-bk-th pa-dt-label"><span class="pa-bk-ic" /><span class="grow">Name</span><span class="pa-bk-size">Size</span><span class="pa-bk-at">Modified</span></div>
        <div v-for="entry in entries" :key="entry.folder || entry.key" class="row pa-bk-row pa-click" :class="{ on: entry.key && entry.key === chosen }" @click="select(entry)" @dblclick="entry.key && say(`Opens ${name(entry)} in its own tab`)">
          <span class="pa-bk-ic"><Icon :name="entry.folder ? 'folder' : 'file'" :size="14" :class="entry.folder ? 'accent' : 'icon-muted'" /></span>
          <span class="grow trunc" :class="{ mono: !entry.folder }">{{ name(entry) }}</span>
          <span class="pa-bk-size muted">{{ entry.size }}</span>
          <span class="pa-bk-at placeholder">{{ entry.folder ? `${entry.files} files` : entry.at }}</span>
        </div>
        <div v-if="!entries.length" class="muted pa-bk-empty">{{ find ? `Nothing here is named like ${find}` : 'This folder is empty' }}</div>
      </div>
      <div class="pa-dt-card pa-bk-side">
        <template v-if="current">
          <div class="mono trunc pa-bk-name">{{ name(current) }}</div>
          <div v-if="current.type.startsWith('image/')" class="pa-bk-image"><div class="pa-bk-avatar" /></div>
          <div v-else-if="PREVIEWS[current.type]" class="mono pa-bk-text">
            <div v-for="([line], i) in PREVIEWS[current.type]" :key="i">{{ line.length > 43 ? line.slice(0, 40) + '...' : line }}</div>
          </div>
          <div v-else class="placeholder">No preview for this type. Download it to open.</div>
          <div class="pa-dt-label pa-bk-sec">Details</div>
          <div class="row pa-bk-kv"><span class="placeholder">size</span><span class="mono">{{ current.size }}</span></div>
          <div class="row pa-bk-kv"><span class="placeholder">content-type</span><span class="mono trunc">{{ current.type }}</span></div>
          <div class="row pa-bk-kv"><span class="placeholder">modified</span><span class="mono">{{ current.at }}</span></div>
          <div class="row pa-bk-kv"><span class="placeholder">etag</span><span class="mono">9b2cf5e1a4d0</span></div>
          <div v-if="confirm" class="pa-bk-actions">
            <div class="pa-bk-danger">Delete it from the bucket? It cannot be recovered.</div>
            <div class="row pa-bk-gap"><span class="pa-dt-btn secondary danger" @click="confirm = false; say(`Deleted ${current.key}`)">Delete</span><span class="pa-dt-btn" @click="confirm = false">Cancel</span></div>
          </div>
          <div v-else class="pa-bk-actions">
            <div class="row pa-bk-gap"><span class="pa-dt-btn secondary" @click="say('Downloaded to ~/Downloads')"><Icon name="download" :size="12" />Download</span><span class="pa-dt-btn secondary" @click="say('Copied a link that works for 1 hour')"><Icon name="copy" :size="12" />Copy URL (1 hour)</span></div>
            <div class="row pa-bk-gap"><span class="pa-dt-btn secondary" @click="say(`Copied uploads/${current.key}`)">Copy Path</span><span class="pa-dt-btn danger" @click="confirm = true">Delete...</span></div>
          </div>
        </template>
        <div v-else class="placeholder">Select a file to preview it.</div>
      </div>
    </div>
    <div class="pa-dt-status pa-bk-status"><span class="muted">{{ (bucket[prefix] || []).length }} items</span><span class="grow muted trunc" style="padding-left: 10px">{{ flash }}</span></div>
  </div>
</template>

<style>
.pa-bk-crumb { cursor: pointer; }
.pa-bk-crumb:hover { color: var(--pa-text); text-decoration: underline; }
.pa-bk-find { width: 220px; gap: 8px; font-size: 12.5px; }
.pa-bk .pa-dt-bar .pa-dt-btn.secondary { font-size: 12.5px; }
.pa-bk-row { flex: none; height: 30px; padding: 0 12px 0 12px; gap: 10px; font-size: 13px; }
.pa-bk-row:not(.pa-bk-th):hover:not(.on) { background: var(--pa-ghost-element-hover); }
.pa-bk-row.on { background: var(--pa-element-selected); }
.pa-bk-th { margin-top: 1px; height: 28px; box-shadow: inset 0 -1px 0 var(--pa-border-variant); }
.pa-bk-ic { width: 16px; flex: none; display: flex; }
.pa-bk-size { width: 110px; flex: none; font-size: 12px; }
.pa-bk-at { width: 130px; flex: none; font-size: 12px; }
.pa-bk-th .pa-bk-size, .pa-bk-th .pa-bk-at { font-size: 11px; }
.pa-bk-empty { padding: 6px 12px; }
.pa-bk-status { font-size: 12px; padding: 6px 8px 0 14px; }
.pa-bk-side { width: 340px; flex: none; padding: 12px; gap: 8px; }
.pa-bk-name { flex: none; font-size: 12.5px; height: 18px; }
.pa-bk-text { flex: none; padding: 6px 10px 8px; border-radius: 6px; box-shadow: inset 0 0 0 1px var(--pa-border-variant); font-size: 11.5px; line-height: 18px; white-space: pre; overflow: hidden; }
.pa-bk-image { flex: none; height: 150px; border-radius: 6px; box-shadow: inset 0 0 0 1px var(--pa-border-variant); display: grid; place-items: center; }
.pa-bk-avatar { width: 120px; height: 120px; border-radius: 50%; background: var(--pa-accent-fill); }
.pa-bk-sec { flex: none; padding-top: 10px; }
.pa-bk-kv { flex: none; height: 24px; gap: 8px; margin-top: -8px; font-size: 12px; }
.pa-bk-sec + .pa-bk-kv { margin-top: 3px; }
.pa-bk-kv > span:first-child { width: 90px; flex: none; }
.pa-bk-actions { display: flex; flex-direction: column; gap: 6px; margin-top: 9px; }
.pa-bk-actions .pa-dt-btn { height: 24px; padding: 0 8px; font-size: 12.5px; }
.pa-bk-gap { gap: 6px; }
.pa-bk-danger { color: var(--pa-error); }
</style>
