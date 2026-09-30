<script setup>
import { computed, nextTick, ref } from 'vue'
import Icon from './Icon.vue'
// Where the fragment starts, so one page can show each of the tab's states.
const props = defineProps({
  view: { type: String, default: 'data' },
  side: { type: String, default: 'value' },
  cell: { type: Array, default: () => [1, 5] },
  edited: { type: Boolean, default: false },
  review: { type: Boolean, default: false },
})

const columns = [
  { name: 'id', type: 'bigint', width: 90, pk: true },
  { name: 'email', type: 'varchar(255)', width: 190 },
  { name: 'name', type: 'text', width: 100 },
  { name: 'org_id', type: 'bigint', width: 130, fk: 'orgs.id' },
  { name: 'role', type: 'text', width: 90 },
  { name: 'settings', type: 'jsonb', width: 260 },
]
const big = {
  theme: 'dark', beta: true, digest: 'weekly', locale: 'en-US',
  notifications: { email: { enabled: true }, push: { enabled: false } },
  saved_views: Array.from({ length: 180 }, (_, i) => ({ name: `View ${i + 1}`, sort: 'updated_at' })),
}
const orgs = { 1: ['Acme', 'pro'], 2: ['Globex', 'free'], 3: ['Initech', 'free'] }
const people = ['Ada', 'Alan', 'Grace', 'Linus', 'Margaret', 'Ken', 'Barbara', 'Dennis', 'Edsger', 'Frances']
const loaded = people.map((name, i) => [
  String(101 + i), `${name.toLowerCase()}@example.com`, name, String((i % 3) + 1), i % 4 === 0 ? 'admin' : 'member',
  i === 1 ? JSON.stringify(big) : i === 2 ? null : JSON.stringify({ theme: i % 2 ? 'dark' : 'light', beta: i % 3 === 0 }),
])
const references = [['orders.user_id', i => 3 + (i % 4)], ['login_tokens.user_id', i => i % 3]]

const view = ref(props.view)
const side = ref(props.side)
const details = ref(true)
const selected = ref(props.cell)
const filters = ref({})
const edits = ref(props.edited ? { '3.4': 'admin', '6.2': 'Ken T.' } : {})
const editing = ref(null)
const review = ref(props.review)
const open = ref(new Set(['$']))
const more = ref(new Set())
const flash = ref('')

const value = (r, c) => (`${r}.${c}` in edits.value ? edits.value[`${r}.${c}`] : loaded[r][c])
const shown = computed(() => loaded.map((_, r) => r).filter(r => columns.every((col, c) => {
  const q = (filters.value[c] || '').trim()
  if (!q) return true
  const v = value(r, c)
  if (q.toLowerCase() === 'null') return v === null
  if (q.startsWith('=')) return String(v) === q.slice(1).trim()
  return String(v ?? '').toLowerCase().includes(q.toLowerCase())
})))
const bytes = text => (text.length >= 1024 ? `${(text.length / 1024).toFixed(1)} KB` : `${text.length} B`)
const summary = v => (Array.isArray(v) ? `[ ${v.length} items ]` : `{ ${Object.keys(v).length} keys }`)
function cellText(r, c) {
  const v = value(r, c)
  if (v === null) return 'NULL'
  if (columns[c].type === 'jsonb' && v.length > 300) return `${summary(JSON.parse(v))} ${bytes(v)}`
  return v
}
const readOnly = c => (columns[c].pk ? 'Primary key' : null)

function pick(r, c) {
  if (editing.value) keep()
  selected.value = [r, c]
  open.value = new Set(['$'])
  more.value = new Set()
}
function startEdit(r, c) {
  if (readOnly(c)) return
  pick(r, c)
  editing.value = { r, c, text: value(r, c) ?? '' }
  nextTick(() => document.querySelector('.pa-tv-edit')?.select())
}
function keep() {
  const { r, c, text } = editing.value
  editing.value = null
  stage(r, c, text)
}
function stage(r, c, v) {
  const next = { ...edits.value }
  if (v === loaded[r][c]) delete next[`${r}.${c}`]
  else next[`${r}.${c}`] = v
  edits.value = next
}
const statements = computed(() => Object.entries(edits.value).map(([key, v]) => {
  const [r, c] = key.split('.').map(Number)
  const set = v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`
  return `UPDATE "public"."users" SET "${columns[c].name}" = ${set} WHERE "id" = '${loaded[r][0]}';`
}))
function say(text) {
  flash.value = text
  setTimeout(() => { if (flash.value === text) flash.value = '' }, 2200)
}
function apply() {
  const count = statements.value.length
  edits.value = {}
  review.value = false
  say(`Saved ${count} ${count === 1 ? 'change' : 'changes'} in one transaction`)
}
function follow(r, c) { say(`Opens orgs where "id" = '${value(r, c)}' in a new tab`) }

function lines(v, path, depth, key, out) {
  const head = key === undefined ? [] : [[key, 'key'], [': ', 'plain']]
  if (v === null || typeof v !== 'object') {
    const kind = v === null ? 'const' : typeof v === 'string' ? 'str' : typeof v === 'boolean' ? 'bool' : 'num'
    out.push({ depth, parts: [...head, [JSON.stringify(v), kind]] })
    return
  }
  const entries = Array.isArray(v) ? v.map((x, i) => [undefined, x, i]) : Object.entries(v).map(([k, x]) => [JSON.stringify(k), x, k])
  if (!open.value.has(path)) {
    out.push({ depth, toggle: path, isOpen: false, head, parts: [[summary(v), 'muted']] })
    return
  }
  out.push({ depth, toggle: path, isOpen: true, head, parts: [[Array.isArray(v) ? '[' : '{', 'plain']] })
  const limit = more.value.has(path) ? entries.length : 50
  entries.slice(0, limit).forEach(([k, x, id]) => lines(x, `${path}.${id}`, depth + 1, k, out))
  if (entries.length > limit) out.push({ depth: depth + 1, more: path, hidden: entries.length - limit, parts: [] })
  out.push({ depth, parts: [[Array.isArray(v) ? ']' : '}', 'plain']] })
}
const current = computed(() => {
  const [r, c] = selected.value
  const v = value(r, c)
  let tree = null
  if (v !== null && columns[c].type === 'jsonb') {
    tree = []
    lines(JSON.parse(v), '$', 0, undefined, tree)
  }
  return { r, c, v, tree }
})
function toggle(path) {
  const next = new Set(open.value)
  next.has(path) ? next.delete(path) : next.add(path)
  open.value = next
}
function expandAll() {
  const next = new Set()
  const walk = (v, path) => {
    if (v && typeof v === 'object') {
      next.add(path)
      ;(Array.isArray(v) ? v : Object.values(v)).forEach((x, i) => walk(x, `${path}.${Array.isArray(v) ? i : Object.keys(v)[i]}`))
    }
  }
  walk(JSON.parse(current.value.v), '$')
  open.value = next
}
</script>

<template>
  <div class="pa-tv">
    <div class="pa-tv-main">
      <div class="row pa-tv-bar">
        <Icon name="table" :size="12" class="icon-muted" />
        <span class="muted">api</span><span class="placeholder">/</span><span class="muted">dev</span><span class="placeholder">/</span>
        <span class="pa-strong">users</span>
        <span class="placeholder pa-tv-on">on</span><Icon name="branch" :size="11" class="accent" /><span class="mono accent pa-small">feat-login</span>
        <span class="grow" />
        <div class="row pa-tv-seg">
          <span v-for="[id, text] in [['data', 'Data'], ['structure', 'Structure'], ['ddl', 'DDL']]" :key="id"
            :class="{ on: view === id }" @click="view = id">{{ text }}</span>
        </div>
        <span v-if="view === 'data'" class="pa-rows pa-click pa-tv-keyed" :class="{ on: details }" @click="details = !details">Details <span class="pa-tv-kbd">shift-enter</span></span>
        <Icon name="rotate_cw" :size="13" class="icon-muted" />
      </div>
      <div v-if="view === 'data'" class="row pa-tv-query">
        <div class="pa-input grow"><span class="mono muted">WHERE</span><span class="mono placeholder">id &gt; 10</span></div>
        <div class="pa-input grow"><span class="mono muted">ORDER BY</span><span class="mono placeholder">id</span></div>
        <span class="pa-rows">500 rows</span>
      </div>

      <template v-if="view === 'data'">
        <div class="pa-tv-grid mono">
          <div class="pa-tv-head">
            <span class="pa-tv-num" />
            <span v-for="col in columns" :key="col.name" class="pa-tv-h" :style="{ width: col.width + 'px' }">
              <Icon v-if="col.pk" name="key" :size="10" class="warn" /><Icon v-else-if="col.fk" name="arrow_up_right" :size="10" class="pa-tv-hint" />
              <span>{{ col.name }}</span><span class="placeholder pa-tv-type">{{ col.type }}</span>
            </span>
          </div>
          <div class="pa-tv-filters mono">
          <span class="pa-tv-num" />
          <span v-for="(col, c) in columns" :key="col.name" class="pa-tv-fcell" :style="{ width: col.width + 'px' }">
            <input v-model="filters[c]" placeholder="filter" spellcheck="false" />
          </span>
        </div>

          <div v-for="(r, i) in shown" :key="r" class="pa-tv-row" :class="{ sel: selected[0] === r }">
            <span class="pa-tv-num pa-click" @click="pick(r, selected[1])">{{ i + 1 }}</span>
            <span v-for="(col, c) in columns" :key="col.name" class="pa-tv-c"
              :class="{ on: selected[0] === r && selected[1] === c, edited: `${r}.${c}` in edits, muted: value(r, c) === null || cellText(r, c) !== value(r, c) }"
              :style="{ width: col.width + 'px' }" @click="pick(r, c)" @dblclick="startEdit(r, c)">
              <input v-if="editing && editing.r === r && editing.c === c" v-model="editing.text" class="pa-tv-edit"
                @keydown.enter="keep" @keydown.esc="editing = null" @blur="editing && keep()" />
              <template v-else>
                <span class="trunc grow" :class="{ 'pa-tv-link': col.fk && value(r, c) !== null, 'pa-tv-json': col.type === 'jsonb' && value(r, c) !== null && cellText(r, c) === value(r, c) }">{{ cellText(r, c) }}<span v-if="col.fk && value(r, c) !== null" class="placeholder pa-tv-name">{{ orgs[value(r, c)][0] }}</span></span>
                <span v-if="col.fk && value(r, c) !== null" class="pa-tv-go pa-tv-hint" title="Open the org" @click.stop="follow(r, c)"><Icon name="arrow_up_right" :size="10" /></span>
              </template>
            </span>
          </div>
        </div>
        <div v-if="review && statements.length" class="pa-tv-review mono">
          <div class="row"><span class="muted pa-sans">Runs in one transaction; any error saves nothing</span></div>
          <div v-for="s in statements" :key="s" class="trunc">{{ s }}</div>
        </div>
        <div v-if="statements.length" class="row pa-tv-pending">
          <span class="warn pa-strong">{{ statements.length }} {{ statements.length === 1 ? 'change' : 'changes' }}</span>
          <span class="muted">not saved - into myproject_feat-login</span><span class="grow" />
          <span class="pa-rows pa-click" :class="{ on: review }" @click="review = !review">Review SQL</span>
          <span class="pa-rows pa-click" @click="edits = {}; review = false">Discard</span>
          <span class="pa-rows pa-click pa-tv-keyed" @click="apply">Apply <span class="pa-tv-kbd">cmd-s</span></span>
        </div>
        <div v-else class="row pa-tv-page">
          <Icon name="chevron_left" :size="12" class="icon-muted" /><Icon name="arrow_left" :size="12" class="icon-muted" />
          <span class="muted">1-{{ shown.length }} of {{ shown.length === loaded.length ? '1234' : shown.length }}</span>
          <Icon name="arrow_right" :size="12" class="icon-muted" />
          <span class="grow muted pa-tv-flash">{{ flash }}</span><span class="pa-rows">Export CSV</span>
        </div>
      </template>

      <div v-else-if="view === 'structure'" class="pa-tv-struct mono">
        <div class="pa-tv-shead pa-sans"><span style="width:120px">COLUMN</span><span style="width:120px">TYPE</span><span style="width:50px">NULL</span><span class="grow">DEFAULT</span><span style="width:110px">KEY</span></div>
        <div v-for="col in columns" :key="col.name" class="pa-tv-srow">
          <span style="width:120px">{{ col.name }}</span><span class="muted" style="width:120px">{{ col.type }}</span>
          <span class="muted" style="width:50px">{{ col.pk || col.name === 'email' ? 'no' : 'yes' }}</span>
          <span class="placeholder grow">{{ col.pk ? "nextval('users_id_seq')" : '' }}</span>
          <span style="width:110px" :class="col.pk ? 'warn' : 'accent'">{{ col.pk ? 'primary' : col.fk || '' }}</span>
        </div>
        <div class="pa-tv-shead pa-sans" style="margin-top:12px"><span class="grow">REFERENCED BY</span><span style="width:110px">ON DELETE</span></div>
        <div v-for="[name] in references" :key="name" class="pa-tv-srow"><span class="grow accent">{{ name }}</span><span class="muted" style="width:110px">cascade</span></div>
      </div>

      <div v-else class="pa-tv-struct mono"><pre class="pa-tv-ddl">CREATE TABLE "public"."users" (
    "id" bigint DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
    "email" character varying(255) NOT NULL,
    "org_id" bigint,
    "settings" jsonb,
    CONSTRAINT "users_pkey" PRIMARY KEY (id),
    CONSTRAINT "users_org_id_fkey" FOREIGN KEY (org_id) REFERENCES orgs(id)
);</pre></div>
    </div>

    <div v-if="view === 'data' && details" class="pa-tv-side">
      <div class="row pa-tv-shead2">
        <div class="row pa-tv-seg">
          <span :class="{ on: side === 'value' }" @click="side = 'value'">Value</span>
          <span :class="{ on: side === 'row' }" @click="side = 'row'">Row</span>
        </div>
        <span class="grow" /><span class="pa-click icon-muted" @click="details = false"><Icon name="close" :size="11" /></span>
      </div>
      <div v-if="side === 'value'" class="pa-tv-sbody">
        <div class="row" style="gap:6px">
          <span class="mono">{{ columns[current.c].name }}</span><span class="mono placeholder pa-xs">{{ columns[current.c].type }}</span>
          <span v-if="columns[current.c].pk" class="warn pa-xs pa-tv-pill">primary key</span><span class="grow" />
          <span class="placeholder pa-xs">row {{ loaded[current.r][0] }}</span>
        </div>
        <div v-if="current.tree" class="pa-tv-jbox">
          <div class="row pa-tv-jbar pa-xs"><span class="placeholder">{{ summary(JSON.parse(current.v)) }}</span><span class="grow" />
            <span class="pa-link" @click="expandAll">Expand all</span><span class="pa-link" @click="open = new Set()">Collapse</span>
            <span class="pa-link" @click="say('Opens the value in an editor tab; saving it stages the change')">Open in tab</span></div>
          <div class="pa-tv-tree mono">
            <div v-for="(line, i) in current.tree.slice(0, 400)" :key="i" class="row pa-tv-line" :style="{ paddingLeft: line.depth * 14 + 'px' }">
              <span class="pa-tv-fold" @click="line.toggle && line.depth === 0 && toggle(line.toggle)"><Icon v-if="line.toggle && line.depth === 0" :name="line.isOpen ? 'chevron_down' : 'chevron_right'" :size="9" /></span>
              <span v-for="([text, kind], j) in (line.head || [])" :key="`h${j}`" :class="`pa-tv-${kind}`">{{ text }}</span>
              <span v-if="line.toggle && line.depth > 0" class="pa-tv-fold" @click="toggle(line.toggle)"><Icon :name="line.isOpen ? 'chevron_down' : 'chevron_right'" :size="9" /></span>
              <span v-if="line.more" class="pa-link" @click="more = new Set([...more, line.more])">show {{ line.hidden }} more</span>
              <span v-for="([text, kind], j) in line.parts" :key="j" :class="`pa-tv-${kind}`">{{ text }}</span>
            </div>
          </div>
        </div>
        <div v-else class="pa-tv-box mono" :class="{ placeholder: current.v === null, warn: `${current.r}.${current.c}` in edits }" @click="startEdit(current.r, current.c)">{{ current.v ?? 'NULL' }}</div>
        <div class="row pa-xs" style="gap:8px">
          <span class="placeholder">{{ current.v === null ? '' : current.tree ? bytes(current.v) : `${current.v.length} chars` }}</span><span class="grow" />
          <template v-if="!readOnly(current.c)">
            <span v-if="current.v !== null" class="pa-link" @click="stage(current.r, current.c, null)">Set NULL</span>
            <span v-if="`${current.r}.${current.c}` in edits" class="pa-link" @click="stage(current.r, current.c, loaded[current.r][current.c])">Revert</span>
          </template>
          <span v-else class="placeholder">{{ readOnly(current.c) }}</span>
          <span v-if="current.v !== null && !current.tree" class="pa-link" @click="say('Opens the value in an editor tab; saving it stages the change')">Open in tab</span>
          <span class="pa-link" @click="say('Copied')">Copy</span>
        </div>
        <template v-if="columns[current.c].fk && current.v !== null">
          <div class="pa-tv-sec">ORGS WHERE ID = {{ current.v }}</div>
          <div class="row pa-tv-kv mono"><span class="muted">id</span><span>{{ current.v }}</span></div>
          <div class="row pa-tv-kv mono"><span class="muted">name</span><span>{{ orgs[current.v][0] }}</span></div>
          <div class="row pa-tv-kv mono"><span class="muted">plan</span><span>{{ orgs[current.v][1] }}</span></div>
          <div class="row pa-tv-kv pa-click" @click="follow(current.r, current.c)"><span class="grow pa-tv-hint">Open orgs #{{ current.v }}</span><Icon name="arrow_up_right" :size="10" class="icon-muted" /></div>
        </template>
      </div>
      <div v-else class="pa-tv-sbody">
        <template v-for="(col, c) in columns" :key="col.name">
          <template v-if="col.type === 'jsonb' && value(selected[0], c)">
            <div class="row pa-tv-kv mono pa-click" :class="{ on: selected[1] === c }" @click="pick(selected[0], c)"><span class="muted">{{ col.name }}</span></div>
            <div class="pa-tv-jbox" style="margin-left:10px">
              <div class="row pa-tv-jbar pa-xs"><span class="placeholder">jsonb - {{ bytes(value(selected[0], c)) }}</span><span class="grow" />
                <span class="pa-link" @click="say('Copied')">Copy</span><span class="pa-link" @click="say('Opens the value in an editor tab')">Open in tab</span></div>
              <div class="pa-tv-tree mono pa-small placeholder">{{ summary(JSON.parse(value(selected[0], c))) }}</div>
            </div>
          </template>
          <div v-else class="row pa-tv-kv mono pa-click" :class="{ on: selected[1] === c, edited: `${selected[0]}.${c}` in edits }" @click="pick(selected[0], c)">
            <span class="muted">{{ col.name }}</span>
            <span class="trunc grow" :class="{ 'pa-tv-hint': col.fk, placeholder: value(selected[0], c) === null }" @click.stop="col.fk ? follow(selected[0], c) : pick(selected[0], c)">{{ col.fk ? `${value(selected[0], c)} - ${orgs[value(selected[0], c)][0]} (orgs)` : value(selected[0], c) ?? 'NULL' }}</span>
            <Icon v-if="col.fk" name="arrow_up_right" :size="10" class="pa-tv-hint" />
          </div>
        </template>
        <div class="pa-tv-sec">REFERENCED BY</div>
        <div v-for="[name, count] in references" :key="name" class="row pa-tv-kv mono pa-click" @click="say(`Opens ${name.split('.')[0]} where ${name.split('.')[1]} = '${loaded[selected[0]][0]}'`)">
          <span class="grow">{{ name }}</span><span class="placeholder pa-xs pa-sans pa-tv-pill">{{ count(selected[0]) }} rows</span><Icon name="arrow_up_right" :size="10" class="icon-muted" />
        </div>
        <div class="placeholder pa-xs" style="margin-top:8px">Double-click a value to edit it.</div>
      </div>
    </div>
  </div>
</template>

<style>
.pa-tv { height: 100%; display: flex; background: var(--pa-editor-background); font-size: 12px; }
.pa-tv-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.pa-tv-bar { height: 36px; padding: 0 10px; gap: 6px; font-size: 12.5px; border-bottom: 1px solid var(--pa-border-variant); flex: none; }
.pa-tv-on { margin-left: 4px; font-size: 12px; }
.pa-tv-query { height: 32px; padding: 0 8px; gap: 8px; border-bottom: 1px solid var(--pa-border-variant); flex: none; }
.pa-tv-keyed { gap: 6px; }
.pa-tv .pa-input { height: 24px; padding: 0 6px; gap: 8px; border-radius: 4px; display: flex; align-items: center; font-size: 11px;
  border: 1px solid var(--pa-border-variant); background: var(--pa-editor-background); }
.pa-tv .pa-rows { height: 22px; padding: 0 6px; border-radius: 4px; border: 1px solid var(--pa-border-variant); font-size: 12px;
  display: inline-flex; align-items: center; white-space: nowrap; }
.pa-tv-kbd { font-size: 10px; color: var(--pa-text-placeholder); border: 1px solid var(--pa-border-variant); border-radius: 3px; padding: 0 4px; }
.pa-tv-name { margin-left: 6px; }
.pa-tv-pill { border: 1px solid var(--pa-border-variant); border-radius: 9px; padding: 0 7px; }
.pa-tv-jbox { border: 1px solid var(--pa-border-variant); border-radius: 6px; background: var(--pa-editor-background); }
.pa-tv-jbar { height: 26px; padding: 0 8px; gap: 4px; border-bottom: 1px solid var(--pa-border-variant); }
.pa-tv-plain { color: var(--pa-text); }
.pa .pa-click { cursor: pointer; }
.pa .pa-rows.on, .pa .pa-rows.pa-click:hover { background: var(--pa-element-selected); }
.pa-tv-seg { gap: 2px; padding: 2px; border-radius: 5px; background: var(--pa-element-background); font-size: 11.5px; }
.pa-tv-seg span { padding: 2px 9px; border-radius: 4px; color: var(--pa-text-muted); cursor: pointer; }
.pa-tv-seg span:hover { background: var(--pa-ghost-element-hover); }
.pa-tv-seg span.on { background: var(--pa-element-selected); color: var(--pa-text); }
.pa-tv-filters { height: 26px; display: flex; border-bottom: 1px solid var(--pa-border-variant); flex: none; background: var(--pa-editor-background); }
.pa-tv-fcell { padding: 2px; flex: none; display: flex; }
.pa-tv-fcell input { width: 100%; border: 1px solid var(--pa-border-variant); border-radius: 3px; background: none; color: var(--pa-text);
  font: inherit; font-size: 11px; padding: 0 6px; outline: none; }
.pa-tv-fcell input:focus { border-color: var(--pa-border-focused); }
.pa-tv-fcell input::placeholder { color: var(--pa-text-placeholder); }
.pa-tv-grid { flex: 1; min-height: 0; overflow: hidden; }
.pa-tv-head { height: 30px; display: flex; border-bottom: 1px solid var(--pa-border-variant); color: var(--pa-text-muted); background: var(--pa-panel-background); }
.pa-tv-h { padding: 0 8px; gap: 5px; display: flex; align-items: center; flex: none; overflow: hidden; white-space: nowrap; border-right: 1px solid color-mix(in srgb, var(--pa-border) 80%, transparent); }
.pa-tv-row { height: 26px; display: flex; border-bottom: 1px solid var(--pa-border-variant); }
.pa-tv-row:hover { background: color-mix(in srgb, var(--pa-text) 2.5%, transparent); }
.pa-tv-row.sel { background: var(--pa-element-selected); }
.pa-tv-type { font-size: 10.5px; }
.pa-tv-hint, .pa .pa-tv-link { color: var(--pa-hint); }
.pa-tv-link { text-decoration: underline; text-decoration-color: color-mix(in srgb, var(--pa-hint) 50%, transparent); }
.pa-tv-json { color: var(--pa-syntax-string); }
.pa-tv-num { width: 40px; flex: none; color: var(--pa-text-placeholder); font-size: 11px; padding-right: 8px;
  display: flex; align-items: center; justify-content: flex-end; }
.pa-tv-c { padding: 0 4px; display: flex; align-items: center; gap: 4px; overflow: hidden; white-space: nowrap; flex: none; cursor: default; }
.pa-tv-c.muted { color: var(--pa-text-muted); }
.pa-tv-c { padding: 0 8px; }
.pa-tv-c.on { outline: 1px solid var(--pa-text-accent); outline-offset: -1px; border-radius: 2px; }
.pa-tv-c.edited { background: color-mix(in srgb, var(--pa-warning) 12%, transparent); color: var(--pa-warning); }
.pa-tv-go { color: var(--pa-text-accent); cursor: pointer; opacity: 0; display: flex; }
.pa-tv-row:hover .pa-tv-go, .pa-tv-c.on .pa-tv-go { opacity: 1; }
.pa-tv-edit { width: 100%; font: inherit; color: var(--pa-text); background: var(--pa-editor-background); border: 1px solid var(--pa-border-focused);
  border-radius: 3px; outline: none; padding: 0 3px; height: 20px; }
.pa-tv-review { padding: 6px 10px; background: var(--pa-panel-background); border-top: 1px solid var(--pa-border-variant); line-height: 18px; font-size: 11.5px; }
.pa .pa-sans { font-family: 'IBM Plex Sans', system-ui, sans-serif; }
.pa-tv-pending { height: 34px; padding: 0 10px; gap: 8px; border-top: 1px solid var(--pa-border-variant); flex: none;
  background: color-mix(in srgb, var(--pa-warning) 7%, transparent); }
.pa-tv-page { height: 28px; padding: 0 8px; gap: 4px; border-top: 1px solid var(--pa-border-variant); flex: none; }
.pa-tv-flash { padding-left: 8px; }
.pa-tv-struct { flex: 1; padding: 12px; overflow: hidden; }
.pa-tv-shead { display: flex; gap: 8px; padding: 0 8px 6px; font-size: 10.5px; font-weight: 600; color: var(--pa-text-placeholder); border-bottom: 1px solid var(--pa-border-variant); }
.pa-tv-srow { display: flex; gap: 8px; height: 26px; align-items: center; padding: 0 8px; border-bottom: 1px solid var(--pa-border-variant); }
.pa .accent { color: var(--pa-text-accent); }
.pa-tv-ddl { margin: 0; padding: 10px; border-radius: 6px; border: 1px solid var(--pa-border-variant); background: var(--pa-panel-background);
  line-height: 18px; white-space: pre; color: var(--pa-text); }
.pa-tv-side { width: 330px; flex: none; border-left: 1px solid var(--pa-border-variant); background: var(--pa-panel-background); display: flex; flex-direction: column; }
.pa-tv-shead2 { height: 36px; padding: 0 10px; flex: none; }
.pa-tv-sbody { flex: 1; overflow: auto; padding: 4px 10px 10px; display: flex; flex-direction: column; gap: 6px; }
.pa-tv-box { padding: 8px; border-radius: 6px; border: 1px solid var(--pa-border-variant); background: var(--pa-editor-background); white-space: pre-wrap; word-break: break-all; }
.pa-link { color: var(--pa-text-accent); cursor: pointer; padding: 0 3px; border-radius: 3px; }
.pa-link:hover { background: var(--pa-ghost-element-hover); }
.pa-tv-tree { padding: 6px 6px 6px 8px; }
.pa-tv-line { height: 18px; white-space: pre; }
.pa-tv-fold { width: 12px; flex: none; color: var(--pa-icon-muted); cursor: pointer; display: flex; }
.pa-tv-key { color: var(--pa-syntax-property); } .pa-tv-str { color: var(--pa-syntax-string); } .pa-tv-num { }
.pa-tv-line .pa-tv-num { color: var(--pa-syntax-number); width: auto; background: none; display: inline; font-size: inherit; }
.pa-tv-bool { color: var(--pa-syntax-boolean); } .pa-tv-const { color: var(--pa-syntax-constant); }
.pa-tv-punct { color: var(--pa-syntax-punctuation-bracket); } .pa-tv-muted { color: var(--pa-text-placeholder); }
.pa-tv-sec { font-size: 10.5px; font-weight: 600; color: var(--pa-text-placeholder); margin-top: 8px; font-family: 'IBM Plex Sans', system-ui, sans-serif; }
.pa-tv-kv { height: 24px; gap: 8px; padding: 0 4px; border-radius: 4px; }
.pa-tv-kv > span:first-child { width: 110px; flex: none; }
.pa-tv-kv.on { box-shadow: inset 2px 0 0 var(--pa-text-accent); }
.pa-tv-kv.on { background: var(--pa-element-selected); }
.pa-tv-kv.edited { background: color-mix(in srgb, var(--pa-warning) 12%, transparent); }
.pa-tv-kv.pa-click:hover:not(.on) { background: var(--pa-ghost-element-hover); }
</style>
