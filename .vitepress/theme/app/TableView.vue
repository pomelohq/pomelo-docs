<script setup>
import { computed, nextTick, ref } from 'vue'
import Icon from './Icon.vue'
import './data.css'
// Where the fragment starts, so one page can show each of the tab's states.
const props = defineProps({
  view: { type: String, default: 'data' },
  side: { type: String, default: 'value' },
  cell: { type: Array, default: () => [1, 5] },
  edited: { type: Boolean, default: false },
})

const columns = [
  { name: 'id', type: 'bigint', width: 107, pk: true, first: true, nullable: 'no', default: "nextval('users_id_seq'::regclass)" },
  { name: 'email', type: 'varchar(255)', width: 154, nullable: 'no' },
  { name: 'name', type: 'varchar(120)', width: 146 },
  { name: 'org_id', type: 'bigint', width: 122.5, fk: 'orgs.id' },
  { name: 'role', type: 'text', width: 96 },
  { name: 'settings', type: 'jsonb', width: 92 },
  { name: 'last_seen_at', type: 'timestamptz', width: 180 },
]
const big = {
  theme: 'dark', beta: true, digest: 'weekly', locale: 'en-US',
  notifications: { email: { enabled: true }, push: { enabled: false } },
  saved_views: Array.from({ length: 180 }, (_, i) => ({ name: `View ${i + 1}`, sort: 'updated_at' })),
}
const orgs = { 1: ['Acme', 'pro'], 2: ['Globex', 'free'], 3: ['Initech', 'free'] }
const people = ['Ann', 'Bob', 'Cy', 'Di', 'Ed', 'Flo', 'Gus', 'Hal']
const loaded = Array.from({ length: 40 }, (_, i) => {
  const name = people[i % people.length]
  return [
    String(101 + i), `${name.toLowerCase()}@example.com`, name, String((i % 3) + 1), i % 3 === 0 ? 'admin' : 'member',
    i % 5 === 1 ? JSON.stringify(big) : i % 5 === 2 ? null : JSON.stringify({ theme: i % 2 ? 'light' : 'dark', beta: i % 3 === 0 }),
    `2026-09-${String(1 + (i % 28)).padStart(2, '0')} 10:${String(i % 60).padStart(2, '0')}:00`,
  ]
})
const indexes = [['users_pkey', 'id', 'primary'], ['users_email_key', 'email', 'unique'], ['index_users_on_org_id', 'org_id', '']]
const references = [['orders', 'user_id', i => 3 + (i % 4)], ['login_tokens', 'user_id', i => i % 3]]

const view = ref(props.view)
const side = ref(props.side)
const details = ref(true)
const selected = ref(props.cell)
const filters = ref({})
const edits = ref(props.edited ? { '6.2': 'Gus QA' } : {})
const editing = ref(null)
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
const isSummary = (r, c) => columns[c].type === 'jsonb' && value(r, c) !== null && value(r, c).length > 300
function cellText(r, c) {
  const v = value(r, c)
  if (v === null) return 'NULL'
  const text = isSummary(r, c) ? `${summary(JSON.parse(v))} ${bytes(v)}` : v
  // The grid cuts a JSON cell to its first characters, with three dots as the app draws them.
  return columns[c].type === 'jsonb' && text.length > 9 ? text.slice(0, 7) + '...' : text
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
const changes = computed(() => Object.keys(edits.value).length)
function say(text) {
  flash.value = text
  setTimeout(() => { if (flash.value === text) flash.value = '' }, 2200)
}
function apply() {
  const count = changes.value
  edits.value = {}
  say(`Saved ${count} ${count === 1 ? 'change' : 'changes'} in one transaction`)
}
const DDL = `CREATE TABLE "public"."users" (
    "id" bigint DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
    "email" character varying(255) NOT NULL,
    "org_id" bigint,
    "settings" jsonb,
    CONSTRAINT "users_pkey" PRIMARY KEY (id),
    CONSTRAINT "users_org_id_fkey" FOREIGN KEY (org_id) REFERENCES orgs(id)
);
CREATE INDEX index_users_on_org_id ON public.users USING btree (org_id);`
const SQL_KEYWORDS = new Set('create table view index unique on using not null default constraint primary key foreign references check as select from where and or in is cascade restrict set delete update no action with without time zone varying if exists alter add column generated always identity'.split(' '))
const ddl = DDL.split('\n').map(line => {
  const parts = []
  const re = /'[^']*'?|"[^"]*"?|\d[\d.]*|[A-Za-z_]\w*|[^A-Za-z0-9_'"]+/g
  for (const [token] of line.matchAll(re)) {
    const kind = token[0] === "'" ? 'str' : token[0] === '"' ? 'key' : /^\d/.test(token) ? 'num'
      : SQL_KEYWORDS.has(token.toLowerCase()) ? 'kw' : 'plain'
    parts.push([kind, token])
  }
  return parts
})
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
const treeOf = v => { const out = []; lines(JSON.parse(v), '$', 0, undefined, out); return out }
const current = computed(() => {
  const [r, c] = selected.value
  const v = value(r, c)
  return { r, c, v, tree: v !== null && columns[c].type === 'jsonb' ? treeOf(v) : null }
})
function toggle(path) {
  const next = new Set(open.value)
  next.has(path) ? next.delete(path) : next.add(path)
  open.value = next
}
function expandAll(v) {
  const next = new Set()
  const walk = (x, path) => {
    if (x && typeof x === 'object') {
      next.add(path)
      ;(Array.isArray(x) ? x : Object.values(x)).forEach((y, i) => walk(y, `${path}.${Array.isArray(x) ? i : Object.keys(x)[i]}`))
    }
  }
  walk(JSON.parse(v), '$')
  open.value = next
}
</script>

<template>
  <div class="pa-dt pa-tv">
    <div class="pa-dt-bar">
      <span class="pa-dt-crumb"><Icon name="table" :size="14" />api<i>/</i>dev<i>/</i><b>users</b></span>
      <span class="pa-dt-on">on<Icon name="branch" :size="12" /><span class="mono">feat-login</span></span>
      <span class="grow" />
      <div class="pa-dt-seg">
        <span v-for="[id, text] in [['data', 'Data'], ['structure', 'Structure'], ['ddl', 'DDL']]" :key="id"
          :class="{ on: view === id }" @click="view = id">{{ text }}</span>
      </div>
      <span v-if="view === 'data'" class="pa-dt-btn secondary" :class="{ on: details }" @click="details = !details">Details
        <span class="pa-dt-kbd"><Icon name="shift" :size="11" /><Icon name="return" :size="11" /></span></span>
      <span class="pa-dt-btn icon"><Icon name="rotate_cw" :size="13" /></span>
    </div>

    <template v-if="view === 'data'">
      <div class="row pa-tv-query">
        <div class="pa-dt-field grow"><b>Where</b><span class="mono placeholder">id &gt; 10</span></div>
        <div class="pa-dt-field grow"><b>Order by</b><span class="mono placeholder">id</span></div>
        <span class="pa-tv-rows">500 rows</span>
      </div>
      <div class="pa-dt-split">
        <div class="pa-dt-card grow pa-tv-grid mono">
          <div class="pa-tv-head">
            <span class="pa-tv-num" />
            <span v-for="col in columns" :key="col.name" class="pa-tv-h" :style="{ width: col.width + 'px' }">
              <Icon v-if="col.pk" name="key" :size="10" class="warn" /><Icon v-else-if="col.fk" name="arrow_up_right" :size="10" class="accent" />
              <span>{{ col.name }}</span><span v-if="col.width > 100" class="placeholder pa-tv-type">{{ col.type }}</span>
            </span>
          </div>
          <div class="pa-tv-filters">
            <span class="pa-tv-num" />
            <span v-for="(col, c) in columns" :key="col.name" class="pa-tv-fcell" :style="{ width: col.width + 'px' }">
              <input v-model="filters[c]" placeholder="filter" spellcheck="false" />
            </span>
          </div>
          <div v-for="(r, i) in shown" :key="r" class="pa-tv-row" :class="{ sel: selected[0] === r }">
            <span class="pa-tv-num pa-click" @click="pick(r, selected[1])">{{ i + 1 }}</span>
            <span v-for="(col, c) in columns" :key="col.name" class="pa-tv-c"
              :class="{ on: selected[0] === r && selected[1] === c, edited: `${r}.${c}` in edits }"
              :style="{ width: col.width + 'px', paddingLeft: col.first ? '6.5px' : undefined }" @click="pick(r, c)" @dblclick="startEdit(r, c)">
              <input v-if="editing && editing.r === r && editing.c === c" v-model="editing.text" class="pa-tv-edit"
                @keydown.enter="keep" @keydown.esc="editing = null" @blur="editing && keep()" />
              <template v-else-if="value(r, c) === null"><span class="pa-tv-null">NULL</span></template>
              <template v-else-if="col.fk">
                <span class="trunc grow muted"><u>{{ value(r, c) }}</u><span class="pa-tv-org">{{ orgs[value(r, c)][0] }}</span></span>
                <span class="pa-tv-go" title="Open the org" @click.stop="follow(r, c)"><Icon name="arrow_up_right" :size="10" /></span>
              </template>
              <span v-else class="trunc grow" :class="{ placeholder: isSummary(r, c), 'pa-j-str': col.type === 'jsonb' && !isSummary(r, c) }">{{ cellText(r, c) }}</span>
            </span>
          </div>
        </div>

        <div v-if="details" class="pa-dt-card pa-tv-side">
          <div class="row pa-tv-shead">
            <div class="pa-dt-seg">
              <span :class="{ on: side === 'value' }" @click="side = 'value'">Value</span>
              <span :class="{ on: side === 'row' }" @click="side = 'row'">Row</span>
            </div>
            <span class="grow" /><span class="pa-dt-btn icon" @click="details = false"><Icon name="close" :size="11" /></span>
          </div>
          <div v-if="side === 'value'" class="pa-tv-sbody">
            <div class="row pa-tv-vtitle">
              <span class="mono">{{ columns[current.c].name }}</span><span class="mono placeholder pa-tv-type">{{ columns[current.c].type }}</span>
              <span class="grow" /><span class="placeholder pa-tv-small">row {{ loaded[current.r][0] }}</span>
            </div>
            <div v-if="current.tree" class="pa-dt-json">
              <div class="pa-dt-json-bar"><span class="placeholder">{{ summary(JSON.parse(current.v)) }}</span><span class="grow" />
                <span class="pa-link" @click="expandAll(current.v)">Expand all</span><span class="pa-link" @click="open = new Set()">Collapse</span>
                <span class="pa-link" @click="say('Opens the value in an editor tab; saving it stages the change')">Open in tab</span></div>
              <div class="pa-dt-tree mono">
                <div v-for="(line, i) in current.tree.slice(0, 200)" :key="i" class="pa-dt-line" :style="{ paddingLeft: line.depth * 14 + 'px' }">
                  <span class="pa-dt-fold" @click="line.toggle && line.depth === 0 && toggle(line.toggle)"><Icon v-if="line.toggle && line.depth === 0" :name="line.isOpen ? 'chevron_down' : 'chevron_right'" :size="9" /></span>
                  <span v-for="([text, kind], j) in (line.head || [])" :key="`h${j}`" :class="`pa-j-${kind}`">{{ text }}</span>
                  <span v-if="line.toggle && line.depth > 0" class="pa-dt-fold" @click="toggle(line.toggle)"><Icon :name="line.isOpen ? 'chevron_down' : 'chevron_right'" :size="9" /></span>
                  <span v-if="line.more" class="pa-link" @click="more = new Set([...more, line.more])">show {{ line.hidden }} more</span>
                  <span v-for="([text, kind], j) in line.parts" :key="j" :class="`pa-j-${kind}`">{{ text }}</span>
                </div>
              </div>
            </div>
            <div v-else class="pa-tv-box mono" :class="{ placeholder: current.v === null, warn: `${current.r}.${current.c}` in edits }" @click="startEdit(current.r, current.c)">{{ current.v ?? 'NULL' }}</div>
            <div class="row pa-tv-small" style="gap: 6px">
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
              <div class="pa-dt-label pa-tv-sec">orgs where id = {{ current.v }}</div>
              <div class="row pa-tv-kv mono"><span class="muted">id</span><span>{{ current.v }}</span></div>
              <div class="row pa-tv-kv mono"><span class="muted">name</span><span>{{ orgs[current.v][0] }}</span></div>
              <div class="row pa-tv-kv mono"><span class="muted">plan</span><span>{{ orgs[current.v][1] }}</span></div>
            </template>
          </div>
          <div v-else class="pa-tv-sbody pa-tv-record">
            <template v-for="(col, c) in columns" :key="col.name">
              <template v-if="col.type === 'jsonb' && value(selected[0], c)">
                <div class="row pa-tv-kv mono pa-click" :class="{ on: selected[1] === c }" @click="pick(selected[0], c)"><span class="muted">{{ col.name }}</span></div>
                <div class="pa-dt-json pa-tv-rjson">
                  <div class="pa-dt-json-bar"><span class="placeholder">jsonb - {{ bytes(value(selected[0], c)) }}</span>
                    <span class="pa-link" @click="expandAll(value(selected[0], c))">Expand all</span><span class="pa-link" @click="open = new Set()">Collapse</span>
                    <span class="pa-link" @click="say('Copied')">Copy</span><span class="pa-link" @click="say('Opens the value in an editor tab')">...</span></div>
                  <div class="pa-dt-tree mono">
                    <div v-for="(line, i) in treeOf(value(selected[0], c)).slice(0, 60)" :key="i" class="pa-dt-line" :style="{ paddingLeft: line.depth * 14 + 'px' }">
                      <span class="pa-dt-fold" @click="line.toggle && line.depth === 0 && toggle(line.toggle)"><Icon v-if="line.toggle && line.depth === 0" :name="line.isOpen ? 'chevron_down' : 'chevron_right'" :size="9" /></span>
                      <span v-for="([text, kind], j) in (line.head || [])" :key="`h${j}`" :class="`pa-j-${kind}`">{{ text }}</span>
                      <span v-if="line.toggle && line.depth > 0" class="pa-dt-fold" @click="toggle(line.toggle)"><Icon :name="line.isOpen ? 'chevron_down' : 'chevron_right'" :size="9" /></span>
                      <span v-for="([text, kind], j) in line.parts" :key="j" :class="`pa-j-${kind}`">{{ text }}</span>
                    </div>
                  </div>
                </div>
              </template>
              <div v-else class="row pa-tv-kv mono pa-click" :class="{ on: selected[1] === c, edited: `${selected[0]}.${c}` in edits }" @click="pick(selected[0], c)">
                <span class="muted">{{ col.name }}</span>
                <span class="trunc" :class="{ muted: col.fk, placeholder: value(selected[0], c) === null }" @click.stop="col.fk ? follow(selected[0], c) : pick(selected[0], c)">{{ col.fk ? `${value(selected[0], c)} - ${orgs[value(selected[0], c)][0]} (orgs)` : value(selected[0], c) ?? 'NULL' }}</span>
                <Icon v-if="col.fk" name="arrow_up_right" :size="10" class="muted" />
              </div>
            </template>
            <div class="pa-dt-label pa-tv-sec">Referenced by</div>
            <div v-for="[table, column, count] in references" :key="table" class="row pa-tv-ref mono pa-click" @click="say(`Opens ${table} where ${column} = '${loaded[selected[0]][0]}'`)">
              <span class="grow">{{ table }}.{{ column }}</span><span class="pa-tv-count">{{ count(selected[0]) }}</span><Icon name="arrow_up_right" :size="10" class="icon-muted" />
            </div>
          </div>
        </div>
      </div>
      <div v-if="changes" class="row pa-tv-pending">
        <span class="warn pa-tv-changes">{{ changes }} {{ changes === 1 ? 'change' : 'changes' }}</span>
        <span class="muted">not saved - into myproject_feat-login</span><span class="grow" />
        <span class="pa-dt-btn" @click="say('Opens the UPDATE statements in an editor tab')">Review SQL</span>
        <span class="pa-dt-btn" @click="edits = {}">Discard</span>
        <span class="pa-dt-btn primary" @click="apply">Apply <span class="pa-dt-kbd"><Icon name="command" :size="10" />S</span></span>
      </div>
      <div class="pa-dt-status">
        <span class="pa-dt-btn icon"><Icon name="chevron_left" :size="12" /></span><span class="pa-dt-btn icon"><Icon name="arrow_left" :size="12" /></span>
        <span class="muted">1-{{ shown.length }} of {{ shown.length === loaded.length ? '1234' : shown.length }}</span>
        <span class="pa-dt-btn icon"><Icon name="arrow_right" :size="12" /></span>
        <span class="grow muted pa-tv-flash">{{ flash }}</span>
        <span class="pa-dt-btn"><Icon name="download" :size="13" />Export CSV</span>
      </div>
    </template>

    <div v-else-if="view === 'structure'" class="pa-dt-card pa-tv-sheet">
      <div class="pa-tv-srow head pa-dt-label"><span style="width: 188px">Column</span><span style="width: 168px">Type</span><span style="width: 58px">Null</span><span style="width: 410px">Default</span><span>Key</span></div>
      <div v-for="col in columns" :key="col.name" class="pa-tv-srow mono">
        <span style="width: 188px">{{ col.name }}</span><span class="muted" style="width: 168px">{{ col.type }}</span>
        <span class="muted" style="width: 58px">{{ col.nullable || 'yes' }}</span>
        <span class="placeholder trunc" style="width: 410px">{{ col.default || '' }}</span>
        <span v-if="col.pk" class="warn pa-tv-sans">primary</span>
        <span v-else-if="col.fk" class="accent pa-tv-sans row" style="gap: 4px"><Icon name="arrow_up_right" :size="10" />{{ col.fk }}</span>
      </div>
      <div class="pa-tv-srow head pa-dt-label gap"><span style="width: 268px">Index</span><span class="grow">Columns</span><span style="width: 120px">Kind</span></div>
      <div v-for="[name, cols, kind] in indexes" :key="name" class="pa-tv-srow mono">
        <span style="width: 268px">{{ name }}</span><span class="muted grow">{{ cols }}</span><span class="muted" style="width: 120px">{{ kind }}</span>
      </div>
      <div class="pa-tv-srow head pa-dt-label gap"><span style="width: 268px">Referenced by</span><span class="grow">Column</span><span style="width: 120px">On delete</span></div>
      <div v-for="[table, column] in references" :key="table" class="pa-tv-srow mono">
        <span class="accent" style="width: 268px">{{ table }}</span><span class="muted grow">{{ column }}</span><span class="muted" style="width: 120px">cascade</span>
      </div>
    </div>

    <div v-else class="pa-dt-card pa-tv-sheet">
      <pre class="mono pa-tv-ddl"><template v-for="(line, i) in ddl" :key="i"><span v-for="(part, j) in line" :key="j" :class="`pa-tv-sql-${part[0]}`">{{ part[1] }}</span>
</template></pre>
      <span class="pa-link pa-tv-copy" @click="say('Copied')">Copy</span>
    </div>
  </div>
</template>

<style>
.pa-tv { font-size: 13px; }
.pa-tv-query { flex: none; height: 36px; padding: 0 12px 8px 10px; }
.pa .pa-tv-query { flex: none; gap: 8px; }
.pa-tv-query .pa-tv-rows { line-height: 28px; }
.pa-tv-rows { flex: none; width: 66px; text-align: right; font-weight: 500; }
.pa-tv-grid { font-size: 12px; }
.pa-tv-head { flex: none; height: 31px; display: flex; box-shadow: inset 0 -1px 0 var(--pa-border-variant); }
.pa-tv-h { padding: 0 4px; gap: 5px; display: flex; align-items: center; flex: none; overflow: hidden; white-space: nowrap;
  box-shadow: inset -1px 0 0 var(--pa-border); }
.pa-tv-type { font-size: 11px; }
.pa-tv-filters { flex: none; height: 27px; display: flex; box-shadow: inset 0 -1px 0 var(--pa-border-variant); }
.pa-tv-fcell { padding: 3px 2px 4px 1px; flex: none; display: flex; }
.pa-tv-fcell input { width: 100%; border: 0; box-shadow: inset 0 0 0 1px var(--pa-border-variant); border-radius: 3px; background: none;
  color: var(--pa-text); font: inherit; font-size: 12px; padding: 0 6px; outline: none; }
.pa-tv-fcell input:focus { box-shadow: inset 0 0 0 1px var(--pa-border-focused); }
.pa-tv-fcell input::placeholder { color: var(--pa-text-placeholder); }
.pa-tv-row { flex: none; height: 26px; display: flex; box-shadow: inset 0 -1px 0 var(--pa-border-variant); }
.pa-tv-row.sel { background: var(--pa-element-selected); }
.pa-tv-num { width: 41px; flex: none; color: var(--pa-text-placeholder); font-size: 11px; padding-right: 10px;
  display: flex; align-items: center; justify-content: flex-end; }
.pa-tv-c { padding: 0 8px; display: flex; align-items: center; gap: 4px; overflow: hidden; white-space: nowrap; flex: none; }
.pa-tv-c.on { box-shadow: inset 0 0 0 1px var(--pa-text-accent); border-radius: 2px; }
.pa-tv-c.edited { background: color-mix(in srgb, var(--pa-warning) 13%, transparent); color: var(--pa-warning); }
.pa-tv-c u { text-decoration-color: var(--pa-text-placeholder); text-underline-offset: 3px; }
.pa-tv-org { margin-left: 7px; }
.pa-tv-null { color: var(--pa-text-placeholder); font-style: italic; }
.pa-tv-go { color: var(--pa-text-muted); cursor: pointer; display: none; }
.pa-tv-c.on .pa-tv-go, .pa-tv-c:hover .pa-tv-go { display: flex; }
.pa-tv-edit { width: 100%; font: inherit; color: var(--pa-text); background: var(--pa-editor-background); border: 1px solid var(--pa-border-focused);
  border-radius: 3px; outline: none; padding: 0 3px; height: 20px; }
.pa-tv-side { width: 300px; flex: none; }
.pa-tv-shead { flex: none; height: 38px; padding: 0 6px 0 12px; box-shadow: inset 0 -1px 0 var(--pa-border-variant); }
.pa-tv-sbody { flex: 1; min-height: 0; overflow: hidden; padding: 11px 10px 10px; display: flex; flex-direction: column; gap: 8px; }
.pa-tv-vtitle { gap: 6px; height: 18px; }
.pa-tv-small { font-size: 12px; }
.pa-tv-box { padding: 11px 10px; border-radius: 6px; box-shadow: inset 0 0 0 1px var(--pa-border-variant); white-space: pre-wrap; word-break: break-all; font-size: 12px; }
.pa-tv-sec { margin-top: 6px; }
.pa-tv-record .pa-tv-sec { margin: 12px 0 6px; }
.pa-tv-ref { flex: none; height: 28px; gap: 8px; padding: 0 4px 0 6px; border-radius: 4px; font-size: 12px; }
.pa-tv-ref:hover { background: var(--pa-ghost-element-hover); }
.pa-tv-record { gap: 0; padding: 10px 10px 6px; }
.pa-tv-record .pa-tv-kv { padding: 0 11px 0 10px; }
.pa-tv-kv { flex: none; height: 28px; gap: 8px; padding: 0 8px; border-radius: 4px; font-size: 12px; }
.pa-tv-kv > span:first-child { width: 110px; flex: none; }
.pa-tv-kv.on { background: var(--pa-element-selected); box-shadow: inset 2px 0 0 var(--pa-text-accent); }
.pa-tv-kv.edited { background: color-mix(in srgb, var(--pa-warning) 12%, transparent); }
.pa-tv-kv.pa-click:hover:not(.on) { background: var(--pa-ghost-element-hover); }
.pa-tv-rjson { margin: 0 0 6px 10px; flex: none; }
.pa-tv-count { height: 18px; padding: 0 7px; border-radius: 9px; font-size: 11px; display: inline-flex; align-items: center;
  box-shadow: inset 0 0 0 1px var(--pa-border-variant); color: var(--pa-text-muted); }
.pa-tv-pending { flex: none; height: 38px; margin: 6px 8px 0; padding: 0 8px 0 12px; gap: 8px; border-radius: 6px;
  background: color-mix(in srgb, var(--pa-warning) 9%, var(--pa-panel-background)); }
.pa-tv-pending > .muted { font-size: 12px; }
.pa-tv-pending .pa-dt-btn { font-size: 12.5px; }
.pa-tv-changes { font-weight: 500; }
.pa-tv .pa-tv-pending + .pa-dt-status { height: 38px; padding-top: 6px; }
.pa-tv-flash { padding-left: 8px; }
.pa-tv .pa-dt-status .pa-dt-btn.icon { width: 22px; }
.pa-tv .pa-dt-status { padding: 8px 7px 0 12px; }
.pa-tv-sheet { flex: 1; margin: 0 8px 40px; padding: 10px 12px; }
.pa-tv-sheet .pa-tv-srow.head { height: 30px; }
.pa-tv-srow { flex: none; height: 31px; padding: 0 8px; gap: 0; display: flex; align-items: center; font-size: 12px;
  box-shadow: inset 0 -1px 0 var(--pa-border-variant); white-space: nowrap; }
.pa-tv-srow > span { flex: none; }
.pa-tv-srow > .grow { flex: 1; }
.pa-tv-srow.head { height: 26px; }
.pa-tv-srow.gap { margin-top: 16px; }
.pa-tv-sans { font-family: 'IBM Plex Sans', system-ui, sans-serif; font-size: 13px; }
.pa-tv-ddl { margin: 2px 0 0; padding: 10px 10px 9px; border-radius: 6px; box-shadow: inset 0 0 0 1px var(--pa-border-variant);
  font-size: 12px; line-height: 18px; white-space: pre; color: var(--pa-text); overflow: hidden; }
.pa-tv-sql-kw { color: var(--pa-syntax-keyword); }
.pa-tv-sql-key { color: var(--pa-syntax-property); }
.pa-tv-sql-str { color: var(--pa-success); }
.pa-tv-sql-num { color: var(--pa-syntax-number); }
.pa-tv-copy { align-self: flex-start; margin-top: 16px; font-size: 12px; }
</style>

