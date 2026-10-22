<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'
import './data.css'

const props = defineProps({ selected: { type: String, default: 'bull:mail:id' } })

const keys = [
  { key: 'bull:mail:id', kind: 'string', value: '{"name":"welcome","data":{"to":"anna@example.com","template":"welcome_mail","locale":"en-US"},"opts":{"attempts":3,"backoff":{"type":"exponential","delay":1000}},"timestamp":1727700000000}' },
  { key: 'bull:mail:meta', kind: 'hash', value: [['opts', '{"maxLenEvents":10000}'], ['version', 'bullmq:5.12.0'], ['concurrency', '4']] },
  { key: 'bull:mail:wait', kind: 'list', value: ['41', '42', '43', '44', '45'] },
  { key: 'bull:mail:delayed', kind: 'zset', value: [['7', '1727700420000'], ['8', '1727700480000'], ['9', '1727700540000']] },
  ...[1, 2, 3, 4, 5].map(job => ({ key: `bull:mail:${job}`, kind: 'hash', ttl: 3600 * job, value: [['name', 'welcome'], ['attemptsMade', '0']] })),
  { key: 'bull:sms:wait', kind: 'list', value: ['12', '13'] },
  { key: 'bull:sms:workers', kind: 'set', ttl: 95, value: ['worker-a1', 'worker-b7', 'worker-c3', 'worker-d9'] },
]
const pattern = ref('bull:*')
const chosen = ref(props.selected)
const folded = ref(new Set())
const confirm = ref(false)
const flash = ref('')
function say(text) {
  flash.value = text
  setTimeout(() => { if (flash.value === text) flash.value = '' }, 2200)
}

const stem = computed(() => pattern.value.split(/[*?[]/)[0])
const shown = computed(() => keys.filter(k => k.key.startsWith(stem.value)))
function groupOf(key) {
  const rest = key.slice(stem.value.length)
  const at = rest.indexOf(':')
  return at < 0 ? stem.value : stem.value + rest.slice(0, at + 1)
}
const groups = computed(() => {
  const out = []
  for (const k of shown.value) {
    const name = groupOf(k.key)
    let group = out.find(g => g.name === name)
    if (!group) out.push(group = { name, keys: [] })
    group.keys.push(k)
  }
  return out
})
const current = computed(() => shown.value.find(k => k.key === chosen.value))
function toggle(name) {
  const next = new Set(folded.value)
  next.has(name) ? next.delete(name) : next.add(name)
  folded.value = next
}
function shortTtl(s) {
  if (s >= 86400) return `${Math.floor(s / 86400)}d`
  if (s >= 3600) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
  if (s >= 60) return `${Math.floor(s / 60)}m`
  return `${s}s`
}
function jsonLines(value) {
  const out = []
  const walk = (v, depth, key) => {
    const head = key === undefined ? [] : [[JSON.stringify(key), 'property'], [': ', '']]
    if (v !== null && typeof v === 'object') {
      const n = Object.keys(v).length
      if (depth > 0) return out.push({ depth, parts: [...head, [Array.isArray(v) ? `[ ${n} items ]` : `{ ${n} keys }`, 'muted']] })
      out.push({ depth, open: true, parts: [...head, ['{', '']] })
      Object.entries(v).forEach(([k, x]) => walk(x, depth + 1, k))
      return out.push({ depth, parts: [['}', '']] })
    }
    const kind = typeof v === 'string' ? 'string' : typeof v === 'boolean' ? 'boolean' : v === null ? 'constant' : 'number'
    out.push({ depth, parts: [...head, [JSON.stringify(v), kind]] })
  }
  walk(JSON.parse(value), 0)
  return out
}
</script>

<template>
  <div class="pa-dt pa-kv">
    <div class="pa-dt-bar">
      <span class="pa-dt-crumb"><Icon name="engine-redis" :size="13" class="pa-engine" />shared<i>/</i>redis<i>/</i><b>bull:*</b></span>
      <span class="pa-dt-on">on<Icon name="branch" :size="12" /><span class="mono">feat-login</span></span>
      <span class="grow" />
      <label class="pa-dt-field" style="width: 280px"><b>Match</b><input v-model="pattern" class="mono" placeholder="session:*" /></label>
      <span class="placeholder pa-kv-count">{{ shown.length }} keys</span>
      <span class="pa-dt-btn icon" @click="say('Scans the keys again')"><Icon name="rotate_cw" :size="13" /></span>
    </div>
    <div class="pa-dt-split">
      <div class="pa-dt-card pa-kv-tree">
        <template v-for="group in groups" :key="group.name">
          <div v-if="groups.length > 1" class="row pa-kv-row pa-click" @click="toggle(group.name)">
            <Icon :name="folded.has(group.name) ? 'chevron_right' : 'chevron_down'" :size="10" class="icon-muted" />
            <span class="mono grow muted trunc">{{ group.name }}</span><span class="placeholder pa-kv-xs">{{ group.keys.length }}</span>
          </div>
          <template v-if="!folded.has(group.name)">
            <div v-for="k in group.keys" :key="k.key" class="row pa-kv-row pa-click" :class="{ on: k.key === chosen }"
              :style="{ paddingLeft: groups.length > 1 ? '24px' : '10px' }" @click="chosen = k.key; confirm = false">
              <span class="pa-kv-badge mono" :class="k.kind">{{ k.kind }}</span>
              <span class="mono grow trunc">{{ k.key.slice(groups.length > 1 ? group.name.length : stem.length) }}</span>
              <span v-if="k.ttl" class="placeholder pa-kv-xs">{{ shortTtl(k.ttl) }}</span>
            </div>
          </template>
        </template>
        <div v-if="!shown.length" class="muted pa-kv-empty">No key matches</div>
      </div>
      <div class="pa-dt-card grow pa-kv-detail">
        <template v-if="current">
          <div class="row pa-kv-head">
            <span class="pa-kv-badge mono" :class="current.kind">{{ current.kind }}</span>
            <span class="mono grow trunc pa-kv-name">{{ current.key }}</span>
            <label class="pa-dt-field" style="width: 150px"><b>TTL</b><input class="mono" :value="current.ttl ?? ''" placeholder="no expiry" @keydown.enter="say('Sets the key to expire in that many seconds')" /></label>
            <span class="pa-dt-btn" @click="say('Copied the value')"><Icon name="copy" :size="12" />Copy value</span>
            <template v-if="confirm">
              <span class="pa-dt-btn danger" @click="confirm = false; say(`Deleted ${current.key}`)">Delete it</span>
              <span class="pa-dt-btn" @click="confirm = false">Keep</span>
            </template>
            <span v-else class="pa-dt-btn danger" @click="confirm = true">Delete key</span>
          </div>
          <template v-if="current.kind === 'string'">
            <div class="pa-dt-json">
              <div class="pa-dt-json-bar"><span class="placeholder">{ {{ Object.keys(JSON.parse(current.value)).length }} keys }</span><span class="grow" /><span class="pa-link">Expand all</span><span class="pa-link">Collapse</span></div>
              <div class="mono pa-dt-tree pa-kv-json">
                <div v-for="(line, i) in jsonLines(current.value)" :key="i" class="pa-dt-line" :style="{ paddingLeft: `${line.depth * 14 + (line.open ? 0 : 14)}px` }">
                  <span v-if="line.open" class="pa-dt-fold"><Icon name="chevron_down" :size="9" /></span>
                  <template v-for="(part, j) in line.parts" :key="j"><span v-if="part[1] === 'muted'" class="pa-dt-fold pa-kv-sub"><Icon name="chevron_right" :size="9" /></span><span
                    :class="{ property: 'pa-j-key', string: 'pa-j-str', number: 'pa-j-num', boolean: 'pa-j-bool', constant: 'pa-j-const', muted: 'pa-j-muted' }[part[1]] || 'pa-j-plain'">{{ part[0] }}</span></template>
                </div>
              </div>
            </div>
            <div class="placeholder pa-kv-small">JSON detected - {{ current.value.length }} B</div>
          </template>
          <div v-else-if="current.kind === 'set'" class="row pa-kv-chips">
            <span v-for="member in current.value" :key="member" class="mono pa-kv-chip">{{ member }}</span>
          </div>
          <div v-else class="pa-kv-table">
            <div class="row pa-kv-trow pa-dt-label">
              <span :style="{ width: current.kind === 'list' ? '50px' : '168px' }">{{ { hash: 'Field', list: '#', zset: 'Member' }[current.kind] }}</span>
              <span class="grow">{{ current.kind === 'zset' ? 'Score' : 'Value' }}</span>
            </div>
            <div v-for="(item, i) in current.value" :key="i" class="row pa-kv-trow mono">
              <span class="placeholder" :style="{ width: current.kind === 'list' ? '50px' : '168px' }">{{ current.kind === 'list' ? i : item[0] }}</span>
              <span class="grow trunc">{{ current.kind === 'list' ? item : item[1] }}</span>
            </div>
          </div>
        </template>
        <div v-else class="muted">Select a key to see its value</div>
      </div>
    </div>
    <div class="pa-dt-status pa-kv-status">
      <span class="muted">{{ groups.length }} {{ groups.length === 1 ? 'prefix' : 'prefixes' }}</span>
      <span class="grow muted trunc" style="padding-left: 10px">{{ flash }}</span>
      <span class="pa-dt-btn danger" @click="say(`Asks first, then deletes every key matching ${pattern}`)">Delete all matching...</span>
    </div>
  </div>
</template>

<style>
.pa-kv-count { flex: none; font-size: 12px; margin-right: -2px; }
.pa-kv .pa-dt-json, .pa-kv-table { background: var(--pa-editor-background); }
.pa-kv-detail > .pa-kv-small { margin-top: 3px; }
.pa-kv-small { font-size: 12px; }
.pa-kv-xs { font-size: 11px; }
.pa-kv-tree { width: 300px; flex: none; padding: 4px 0; }
.pa-kv-row { flex: none; height: 26px; gap: 8px; padding: 0 12px 0 8px; font-size: 13px; }
.pa-kv-row:hover:not(.on) { background: var(--pa-ghost-element-hover); }
.pa-kv-row.on { background: var(--pa-element-selected); }
.pa-kv-badge { height: 17px; padding: 0 3px; border-radius: 3px; box-shadow: inset 0 0 0 1px var(--pa-border-variant); font-size: 11px; line-height: 17px; flex: none;
  color: var(--pa-text-placeholder); }
.pa-kv-badge.string { color: var(--pa-success); }
.pa-kv-badge.list, .pa-kv-badge.zset { color: var(--pa-warning); }
.pa-kv-badge.set { color: var(--pa-text-accent); }
.pa-kv-empty { padding: 6px 12px; }
.pa-kv-detail { padding: 14px; gap: 10px; }
.pa-kv-head { flex: none; gap: 8px; height: 28px; }
.pa-kv-name { font-size: 13px; }
.pa-kv-head .pa-dt-btn { font-size: 12.5px; gap: 4px; }
.pa-kv-table .pa-dt-label { font-size: 10.5px; }
.pa-kv-json { font-size: 12px; padding: 6px 6px 5px; }
.pa-kv .pa-dt-json-bar { height: 27px; }
.pa-kv-json .pa-dt-line { height: 18px; }
.pa-kv-sub { margin-right: 2px; }
.pa-kv-chips { flex-wrap: wrap; gap: 6px; }
.pa-kv-chip { height: 22px; padding: 0 8px; border-radius: 4px; box-shadow: inset 0 0 0 1px var(--pa-border-variant); background: var(--pa-element-background); display: inline-flex; align-items: center; }
.pa-kv-table { border-radius: 6px; box-shadow: inset 0 0 0 1px var(--pa-border-variant); }
.pa-kv-trow { height: 27px; padding: 0 8px; gap: 0; font-size: 12px; box-shadow: inset 0 -1px 0 var(--pa-border-variant); }
.pa-kv-status { font-size: 12px; }
.pa-kv .pa-dt-status { height: 38px; padding: 5px 8px 0 14px; }
.pa-kv .pa-dt-status .pa-dt-btn { font-size: 12.5px; }
</style>
