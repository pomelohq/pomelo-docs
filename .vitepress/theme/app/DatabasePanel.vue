<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'
import './data.css'
defineProps({ branch: { type: String, default: 'feat-login' } })

// kind: section | label | repo | db | group | table | column | console | object | folder | more | failure
const tree = [
  { id: 'consoles', kind: 'section', text: 'Consoles', count: 2, children: [
    { id: 'q1', kind: 'console', text: 'query 1', meta: 'api > dev' },
    { id: 'q2', kind: 'console', text: 'query 2', meta: 'api > dev' },
  ] },
  { id: 'databases', kind: 'label', text: 'Databases' },
  { id: 'api', kind: 'repo', text: 'api', dot: 'err', engines: ['postgresql', 'redis', 'minio'], children: [
    { id: 'dev', kind: 'db', engine: 'postgresql', text: 'dev', meta: 'myproject_feat-login', dot: 'ok', children: [
      { id: 'tables', kind: 'group', text: 'tables', count: 4, children: [
        { id: 'users', kind: 'table', text: 'users', count: '1.3k', children: [
          { id: 'c-id', kind: 'column', text: 'id', meta: 'bigint', key: true },
          { id: 'c-email', kind: 'column', text: 'email', meta: 'varchar(255)' },
          { id: 'c-name', kind: 'column', text: 'name', meta: 'varchar(120)' },
          { id: 'c-created', kind: 'column', text: 'created_at', meta: 'timestamptz' },
        ] },
        { id: 'login_tokens', kind: 'table', text: 'login_tokens', count: '37', children: [
          { id: 'c-token', kind: 'column', text: 'token', meta: 'text' },
          { id: 'c-user', kind: 'column', text: 'user_id', meta: 'bigint' },
        ] },
        { id: 'orders', kind: 'table', text: 'orders', count: '5.1k' },
        { id: 'schema_migrations', kind: 'table', text: 'schema_migrations', count: '42' },
      ] },
      { id: 'views', kind: 'group', text: 'views', count: 1, children: [{ id: 'active_users', kind: 'table', text: 'active_users', view: true }] },
    ] },
    { id: 'dev_tx', kind: 'db', engine: 'postgresql', text: 'dev_tx', meta: 'myproject_transaction_feat-login', dot: 'off', children: [] },
    { id: 'test', kind: 'db', engine: 'postgresql', text: 'test', meta: 'myproject_feat-login_test', dot: 'err', children: [
      { id: 'failure', kind: 'failure' },
    ] },
    { id: 'redis', kind: 'db', engine: 'redis', text: 'redis', meta: 'db 0 - shared with web', dot: 'ok', children: [
      { id: 'k-cache', kind: 'table', text: 'cache:*', keyspace: true },
      { id: 'k-bull', kind: 'table', text: 'bull:*', keyspace: true },
    ] },
    { id: 'files', kind: 'db', engine: 'minio', text: 'files', dot: 'ok', children: [
      { id: 'uploads', kind: 'folder', text: 'uploads', open: true, children: [
        { id: 'avatars', kind: 'folder', text: 'avatars', meta: '2.9k - 1.2 GB', children: [] },
        { id: 'exports', kind: 'folder', text: 'exports', children: [] },
        { id: 'invoice', kind: 'object', text: 'invoice-4412.pdf', meta: '96.0 KB' },
        { id: 'import', kind: 'object', text: 'import-2026-09.csv', meta: '3.4 MB' },
        { id: 'more', kind: 'more', text: 'Show 50 more' },
      ] },
    ] },
  ] },
  { id: 'web', kind: 'repo', text: 'web', engines: ['postgresql', 'redis'], children: [
    { id: 'web-main', kind: 'db', engine: 'postgresql', text: 'main', meta: 'myproject_web_feat-login', dot: 'off', children: [] },
    { id: 'web-redis', kind: 'db', engine: 'redis', text: 'redis', meta: 'db 0 - shared with api', dot: 'ok', children: [] },
  ] },
  { id: 'other', kind: 'repo', text: 'Other services', engines: ['rabbitmq'], children: [
    { id: 'queue', kind: 'db', engine: 'rabbitmq', text: 'queue', meta: 'no repo refers to it', dot: 'off', children: [] },
  ] },
]
const open = ref(new Set(['consoles', 'api', 'dev', 'tables', 'users', 'files', 'uploads', 'web', 'other']))
const selected = ref('')
const query = ref('')
const rows = computed(() => {
  const out = []
  const q = query.value.trim().toLowerCase()
  const matches = node => !q || node.text?.toLowerCase().includes(q) || (node.children || []).some(matches)
  const walk = (nodes, depth) => {
    for (const node of nodes) {
      if (!matches(node)) continue
      out.push({ ...node, depth, isOpen: open.value.has(node.id) || !!q })
      if (node.children && (open.value.has(node.id) || q)) walk(node.children, node.kind === 'label' ? depth : depth + 1)
    }
  }
  walk(tree, 0)
  return out
})
function click(row) {
  if (row.children) {
    const next = new Set(open.value)
    next.has(row.id) ? next.delete(row.id) : next.add(row.id)
    open.value = next
  }
  if (['table', 'console', 'object'].includes(row.kind)) selected.value = row.id
}
const engineIcon = { postgresql: 'engine-postgresql', redis: 'engine-redis', minio: 'engine-minio', rabbitmq: 'engine-rabbitmq' }
</script>

<template>
  <div class="pa-db">
    <div class="pa-db-head">
      <span class="pa-db-title">Database</span>
      <span class="placeholder">{{ branch }}</span>
      <span class="grow" />
      <span class="pa-db-tool"><Icon name="plus" :size="14" /></span>
      <span class="pa-db-tool"><Icon name="rotate_cw" :size="14" /></span>
      <span class="pa-db-tool"><Icon name="chevron_up" :size="14" /></span>
    </div>
    <label class="pa-db-filter"><Icon name="search" :size="12" class="icon-muted" /><input v-model="query" placeholder="Filter tables and columns" spellcheck="false" /></label>
    <div class="pa-db-tree">
      <template v-for="row in rows" :key="row.id">
        <div v-if="row.kind === 'label'" class="pa-db-label">{{ row.text }}</div>
        <div v-else-if="row.kind === 'failure'" class="pa-db-failure" :style="{ marginLeft: 8 + row.depth * 16 + 'px' }">
          <div class="row pa-db-fail-title"><Icon name="warning" :size="12" />Database myproject_feat-login_test does not exist</div>
          <div class="muted">Postgres is running and answered, but this workspace's database was never created (or was dropped).</div>
          <div class="row" style="gap: 6px; margin-top: 4px"><span class="pa-dt-btn primary">Create database</span><span class="pa-dt-btn"><Icon name="sparkle" :size="12" />Fix with Claude</span></div>
        </div>
        <div v-else class="row pa-db-row" :class="[row.kind, { on: selected === row.id }]" :style="{ paddingLeft: 8 + row.depth * 16 + 'px' }" @click="click(row)">
          <span v-for="d in row.depth" :key="d" class="pa-db-guide" :style="{ left: 15 + (d - 1) * 16 + 'px' }" />
          <span class="pa-db-chev"><Icon v-if="row.children && row.kind !== 'failure'" :name="row.isOpen ? 'chevron_down' : 'chevron_right'" :size="12" /></span>
          <Icon v-if="row.kind === 'db'" :name="engineIcon[row.engine]" :size="14" />
          <Icon v-else-if="row.kind === 'table'" :name="row.keyspace ? 'key' : 'table'" :size="14" class="icon-muted" />
          <Icon v-else-if="row.kind === 'console' || row.kind === 'object'" :name="row.kind === 'object' ? 'file' : 'file'" :size="14" :class="row.kind === 'object' ? 'pa-db-obj' : 'icon-muted'" />
          <Icon v-else-if="row.kind === 'folder'" :name="row.isOpen ? 'folder_open' : 'folder'" :size="14" class="icon-muted" />
          <Icon v-else-if="row.kind === 'column'" :name="row.key ? 'key' : 'column'" :size="12" :class="row.key ? 'warn' : 'icon-muted'" />
          <span class="pa-db-text trunc" :class="{ muted: row.kind === 'group' || row.kind === 'section', accent: row.kind === 'more' }">{{ row.text }}</span>
          <span v-if="row.kind === 'db' && row.meta" class="placeholder pa-db-meta trunc">{{ row.meta }}</span>
          <span class="grow" />
          <span v-if="row.kind === 'repo'" class="row pa-db-engines">
            <i v-if="row.dot" class="pa-db-dot" :class="row.dot" />
            <Icon v-for="e in row.engines" :key="e" :name="engineIcon[e]" :size="12" />
          </span>
          <span v-if="row.count !== undefined" class="placeholder pa-db-count">{{ row.count }}</span>
          <span v-if="row.kind === 'console' || row.kind === 'object' || (row.kind === 'folder' && row.meta)" class="placeholder pa-db-count">{{ row.meta }}</span>
          <span v-if="row.kind === 'column'" class="mono placeholder pa-db-type">{{ row.meta }}</span>
          <i v-if="row.kind === 'db'" class="pa-db-dot" :class="row.dot" />
        </div>
      </template>
    </div>
  </div>
</template>

<style>
.pa-db { height: 100%; display: flex; flex-direction: column; background: var(--pa-panel-background); font-size: 13px; }
.pa-db-head { flex: none; height: 34px; padding: 0 5px 0 12px; gap: 2px; display: flex; align-items: center; }
.pa-db-title { font-weight: 500; margin-right: 6px; }
.pa-db-head > .placeholder { font-size: 12.5px; }
.pa-db-tool { width: 26px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: var(--pa-icon-muted); }
.pa-db-tool:hover { background: var(--pa-ghost-element-hover); color: var(--pa-icon); }
.pa-db-filter { flex: none; margin: 1px 8px 12px; height: 26px; padding: 0 9px; gap: 8px; border-radius: 6px; display: flex; align-items: center;
  background: var(--pa-editor-background); box-shadow: inset 0 0 0 1px var(--pa-border); }
.pa-db-filter input { font-size: 12.5px !important; flex: 1; min-width: 0; border: 0; outline: 0; padding: 0; background: none; font: inherit; color: var(--pa-text); }
.pa-db-filter input::placeholder { color: var(--pa-text-placeholder); }
.pa-db-tree { flex: 1; min-height: 0; overflow: hidden; }
.pa-db-label { height: 25px; padding: 1px 8px 0; display: flex; align-items: center; font-size: 11px; font-weight: 500; letter-spacing: 0.04em;
  text-transform: uppercase; color: var(--pa-text-muted); }
.pa-db-row { position: relative; height: 22px; padding-right: 8px; gap: 6px; white-space: nowrap; cursor: pointer; }
.pa-db-row:hover:not(.on) { background: var(--pa-ghost-element-hover); }
.pa-db-row.on { background: var(--pa-element-selected); }
.pa-db-row.section .pa-db-text { font-size: 11px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; }
.pa-db-row.repo .pa-db-text { font-weight: 500; }
.pa-db-guide { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--pa-panel-indent-guide); }
.pa-db-chev { width: 12px; flex: none; display: flex; color: var(--pa-icon-muted); }
.pa-db-row.column .pa-db-chev, .pa-db-row.console .pa-db-chev, .pa-db-row.object .pa-db-chev, .pa-db-row.more .pa-db-chev { width: 12px; }
.pa-db-text { flex: none; max-width: 170px; }
.pa-db-meta { font-size: 12px; min-width: 0; }
.pa-db-count { flex: none; font-size: 12px; }
.pa-db-type { flex: none; font-size: 11px; }
.pa-db-engines { gap: 4px; }
.pa-db-obj { color: var(--pa-info); }
.pa-db-dot { width: 8px; height: 8px; border-radius: 50%; display: block; flex: none; box-shadow: inset 0 0 0 1.5px var(--pa-icon-muted); }
.pa-db-dot.ok { background: var(--pa-success); box-shadow: none; }
.pa-db-dot.err { background: var(--pa-error); box-shadow: none; }
.pa-db-failure { margin: 2px 8px 6px; padding: 8px 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 4px; font-size: 12px; line-height: 16px;
  background: color-mix(in srgb, var(--pa-error) 12%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--pa-error) 30%, var(--pa-panel-background)); }
.pa-db-fail-title { gap: 6px; align-items: flex-start; color: var(--pa-error); font-size: 12.5px; }
.pa-db-failure .pa-dt-btn { height: 24px; font-size: 12px; }
</style>
