<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({ selected: { type: String, default: 'bull:mail:id' } })

const keys = [
  { key: 'bull:mail:id', kind: 'string', value: '{"name":"welcome","data":{"to":"ann@example.com","template":"welcome"},"opts":{"attempts":3},"timestamp":1727700000000}' },
  { key: 'bull:mail:meta', kind: 'hash', value: [['opts', '{"maxLenEvents":10000}'], ['version', 'bullmq:5.12.0'], ['concurrency', '4']] },
  { key: 'bull:mail:wait', kind: 'list', value: ['41', '42', '43', '44', '45'] },
  { key: 'bull:mail:delayed', kind: 'zset', value: [['7', '1727700420000'], ['8', '1727700480000'], ['9', '1727700540000']] },
  ...[1, 2, 3].map(job => ({ key: `bull:mail:${job}`, kind: 'hash', ttl: 3600 * job, value: [['name', 'welcome'], ['attemptsMade', '0']] })),
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
  <div class="pa-kv">
    <div class="row pa-kv-bar">
      <Icon name="key" :size="12" class="icon-muted" />
      <span class="muted">shared</span><span class="placeholder">/</span><span class="muted">redis</span><span class="placeholder">/</span>
      <span class="pa-kv-strong">bull:*</span>
      <span class="placeholder pa-kv-on">on</span><Icon name="branch" :size="11" class="accent" /><span class="mono accent pa-kv-small">feat-login</span>
      <span class="grow" />
      <label class="row pa-kv-input" style="width:240px"><span class="mono muted">MATCH</span><input v-model="pattern" class="mono" placeholder="session:*" /></label>
      <span class="placeholder pa-kv-small">{{ shown.length }} keys</span>
      <span class="pa-click icon-muted" @click="say('Scans the keys again')"><Icon name="rotate_cw" :size="12" /></span>
    </div>
    <div class="row pa-kv-body">
      <div class="pa-kv-tree">
        <template v-for="group in groups" :key="group.name">
          <div v-if="groups.length > 1" class="row pa-kv-row pa-click" @click="toggle(group.name)">
            <Icon :name="folded.has(group.name) ? 'chevron_right' : 'chevron_down'" :size="10" class="icon-muted" />
            <span class="mono grow pa-kv-hint trunc">{{ group.name }}</span><span class="placeholder pa-kv-xs">{{ group.keys.length }}</span>
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
      <div class="pa-kv-detail">
        <template v-if="current">
          <div class="row pa-kv-head">
            <span class="pa-kv-badge mono" :class="current.kind">{{ current.kind }}</span>
            <span class="mono grow trunc pa-kv-name">{{ current.key }}</span>
            <label class="row pa-kv-input" style="width:140px"><span class="mono muted">TTL</span><input class="mono" :value="current.ttl ?? ''" placeholder="no expiry" @keydown.enter="say('Sets the key to expire in that many seconds')" /></label>
            <span class="pa-kv-btn pa-click" @click="say('Copied the value')">Copy value</span>
            <template v-if="confirm">
              <span class="pa-kv-btn danger pa-click" @click="confirm = false; say(`Deleted ${current.key}`)">Delete it</span>
              <span class="pa-kv-btn pa-click" @click="confirm = false">Keep</span>
            </template>
            <span v-else class="pa-kv-btn danger pa-click" @click="confirm = true">Delete key</span>
          </div>
          <template v-if="current.kind === 'string'">
            <div class="pa-kv-box">
              <div class="row pa-kv-boxbar"><span class="placeholder">{ {{ Object.keys(JSON.parse(current.value)).length }} keys }</span><span class="grow" /><span class="pa-kv-link">Expand all</span><span class="pa-kv-link">Collapse</span></div>
              <div class="mono pa-kv-json">
                <div v-for="(line, i) in jsonLines(current.value)" :key="i" class="row pa-kv-line" :style="{ paddingLeft: `${line.depth * 14 + (line.open ? 0 : 14)}px` }">
                  <Icon v-if="line.open" name="chevron_down" :size="10" class="icon-muted pa-kv-fold" />
                  <span v-for="(part, j) in line.parts" :key="j" :class="part[1] === 'muted' ? 'placeholder' : ''"
                    :style="part[1] && part[1] !== 'muted' ? { color: `var(--pa-syntax-${part[1]})` } : undefined">{{ part[0] }}</span>
                </div>
              </div>
            </div>
            <div class="placeholder pa-kv-xs">JSON detected - {{ current.value.length }} B</div>
          </template>
          <div v-else-if="current.kind === 'set'" class="row pa-kv-chips">
            <span v-for="member in current.value" :key="member" class="mono pa-kv-chip">{{ member }}</span>
          </div>
          <div v-else class="pa-kv-table">
            <div class="row pa-kv-trow pa-kv-th">
              <span :style="{ width: current.kind === 'list' ? '50px' : '160px' }">{{ { hash: 'FIELD', list: '#', zset: 'MEMBER' }[current.kind] }}</span>
              <span class="grow">{{ current.kind === 'zset' ? 'SCORE' : 'VALUE' }}</span>
            </div>
            <div v-for="(item, i) in current.value" :key="i" class="row pa-kv-trow mono">
              <span :class="current.kind === 'list' ? 'placeholder' : 'pa-kv-hint'" :style="{ width: current.kind === 'list' ? '50px' : '160px' }">{{ current.kind === 'list' ? i : item[0] }}</span>
              <span class="grow trunc">{{ current.kind === 'list' ? item : item[1] }}</span>
            </div>
          </div>
        </template>
        <div v-else class="muted">Select a key to see its value</div>
      </div>
    </div>
    <div class="row pa-kv-status">
      <span class="muted">{{ groups.length }} {{ groups.length === 1 ? 'prefix' : 'prefixes' }}</span>
      <span class="grow muted trunc">{{ flash }}</span>
      <span class="pa-kv-btn danger pa-click" @click="say(`Asks first, then deletes every key matching ${pattern}`)">Delete all matching...</span>
    </div>
  </div>
</template>

<style>
.pa-kv { height: 100%; display: flex; flex-direction: column; background: var(--pa-editor-background); font-size: 12px; color: var(--pa-text); }
.pa-kv-bar { height: 36px; padding: 0 10px; gap: 6px; font-size: 12.5px; border-bottom: 1px solid var(--pa-border-variant); flex: none; }
.pa-kv-strong { font-weight: 500; }
.pa-kv-on { margin-left: 4px; font-size: 12px; }
.pa-kv-small { font-size: 11.5px; }
.pa-kv-xs { font-size: 11px; }
.pa-kv-input { height: 24px; gap: 6px; padding: 0 6px; border-radius: 4px; border: 1px solid var(--pa-border-variant); background: var(--pa-editor-background); font-size: 11px; }
.pa-kv-input input { flex: 1; min-width: 0; background: none; border: none; outline: none; color: var(--pa-text); font-size: 12px; }
.pa .pa-kv-body { flex: 1; min-height: 0; align-items: stretch; }
.pa-kv-tree { width: 280px; flex: none; padding: 4px 0; background: var(--pa-panel-background); border-right: 1px solid var(--pa-border-variant); overflow: hidden; }
.pa-kv-row { height: 26px; gap: 8px; padding: 0 10px 0 8px; }
.pa-kv-row:hover:not(.on) { background: var(--pa-ghost-element-hover); }
.pa-kv-row.on { background: var(--pa-element-selected); }
.pa-kv-hint { color: var(--pa-hint, var(--pa-text-accent)); }
.pa-kv-badge { height: 16px; padding: 0 5px; border-radius: 3px; border: 1px solid var(--pa-border-variant); font-size: 10px; line-height: 14px; flex: none; }
.pa-kv-badge.string { color: var(--pa-syntax-string); }
.pa-kv-badge.hash { color: var(--pa-hint, var(--pa-text-accent)); }
.pa-kv-badge.list { color: var(--pa-syntax-number); }
.pa-kv-badge.set { color: var(--pa-text-accent); }
.pa-kv-badge.zset { color: var(--pa-syntax-constant); }
.pa-kv-empty { padding: 6px 12px; }
.pa-kv-detail { flex: 1; min-width: 0; padding: 14px; display: flex; flex-direction: column; gap: 10px; overflow: hidden; }
.pa-kv-head { gap: 8px; }
.pa-kv-name { font-size: 13px; }
.pa-kv-btn { height: 22px; padding: 0 7px; border-radius: 4px; border: 1px solid var(--pa-border-variant); display: inline-flex; align-items: center; font-size: 12px; flex: none; }
.pa-kv-btn:hover { background: var(--pa-ghost-element-hover); }
.pa-kv-btn.danger { color: var(--pa-error); border-color: color-mix(in srgb, var(--pa-error) 40%, transparent); }
.pa-kv-box { border: 1px solid var(--pa-border-variant); border-radius: 6px; }
.pa-kv-boxbar { height: 26px; padding: 0 8px; gap: 8px; border-bottom: 1px solid var(--pa-border-variant); font-size: 11.5px; }
.pa-kv-link { color: var(--pa-text-accent); cursor: pointer; }
.pa-kv-json { padding: 6px 8px; }
.pa-kv-line { height: 18px; white-space: pre; }
.pa-kv-fold { width: 14px; }
.pa-kv-chips { flex-wrap: wrap; gap: 6px; }
.pa-kv-chip { height: 22px; padding: 0 8px; border-radius: 4px; border: 1px solid var(--pa-border-variant); background: var(--pa-element-background); display: inline-flex; align-items: center; }
.pa-kv-table { border: 1px solid var(--pa-border-variant); border-radius: 6px; }
.pa-kv-trow { height: 26px; padding: 0 8px; gap: 8px; border-bottom: 1px solid var(--pa-border-variant); }
.pa-kv-trow:last-child { border-bottom: none; }
.pa-kv-th { font-size: 10.5px; font-weight: 600; color: var(--pa-text-placeholder); }
.pa-kv-status { height: 28px; padding: 0 10px; gap: 8px; border-top: 1px solid var(--pa-border-variant); flex: none; }
</style>
