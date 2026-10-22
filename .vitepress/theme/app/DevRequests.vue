<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'
import './data.css'

const target = path => `http://server.api.feat-login.localhost:8767${path.replace('/_pom_dev/api/server', '')}`
const requests = [
  { time: '15:40:24', kind: 'proxy', method: 'GET', path: '/_pom_dev/api/server/v1/users/42', status: 200, ms: 6, service: 'api/server',
    headers: [['accept', 'application/json'], ['cookie', null]], body: null, response: '{\n  "id": 42,\n  "email": "dev@example.com",\n  "role": "admin"\n}' },
  { time: '15:40:19', kind: 'proxy', method: 'POST', path: '/_pom_dev/api/server/v1/sessions', status: 401, ms: 9, service: 'api/server',
    headers: [['content-type', 'application/json'], ['origin', 'http://app.web.feat-login.localhost:8767'], ['cookie', null]],
    body: '{\n  "email": "dev@example.com",\n  "password": "********"\n}', response: '{\n  "error": "invalid credentials"\n}' },
  { time: '15:40:11', kind: 'proxy', method: 'GET', path: '/_pom_dev/api/server/v1/users?page=2', status: 200, ms: 12, service: 'api/server',
    headers: [['accept', 'application/json']], body: null, response: '{\n  "users": [],\n  "page": 2\n}' },
  { time: '15:39:58', kind: 'webhook', method: 'POST', path: '/hooks/payments', status: 200, ms: 15, service: 'api/server',
    headers: [['content-type', 'application/json'], ['user-agent', 'Payments/1.0']],
    body: '{\n  "type": "invoice.paid",\n  "amount": 4900\n}', fanout: [['main', 200, '12 ms'], ['feat-login', 200, '15 ms']], response: '{"ok":true}' },
  { time: '15:39:40', kind: 'proxy', method: 'GET', path: '/_pom_dev/web/app/assets/main.js', status: 200, ms: 18, service: 'web/app',
    headers: [['accept', '*/*']], body: null, response: null },
  { time: '15:39:02', kind: 'webhook', method: 'POST', path: '/hooks/payments', status: 202, ms: 21, service: 'api/server',
    headers: [['content-type', 'application/json'], ['user-agent', 'Payments/1.0'], ['authorization', null]],
    body: '{\n  "type": "invoice.created",\n  "amount": 4900\n}', fanout: [['main', 202, '19 ms'], ['feat-login', null, 'connection refused']], response: '{"ok":true,"fanout":2}' },
  { time: '15:38:51', kind: 'proxy', method: 'GET', path: '/_pom_dev/api/server/health', status: 503, ms: 24, service: 'api/server',
    headers: [['accept', '*/*']], body: null, response: 'service api/server is not running in feat-login' },
]

const kind = ref('all')
const errorsOnly = ref(false)
const query = ref('')
const selected = ref(1)
const tab = ref('request')
const reveal = ref(false)

const shown = computed(() => requests.map((r, i) => ({ ...r, index: i })).filter(r =>
  (kind.value === 'all' || r.kind === kind.value)
  && (!errorsOnly.value || r.status >= 400)
  && (r.path + ' ' + r.service).toLowerCase().includes(query.value.toLowerCase())))
const current = computed(() => requests[selected.value])
const failed = computed(() => (current.value.fanout || []).filter(([, status]) => !status || status >= 400).length)
const statusClass = s => s >= 500 ? 'err' : s >= 400 ? 'warn' : 'ok'
const pick = i => { selected.value = i; tab.value = 'request'; reveal.value = false }
const cut = (text, n) => (text.length > n ? text.slice(0, n - 3) + '...' : text)
const isJson = text => { try { JSON.parse(text); return true } catch { return false } }
function runs(line) {
  const out = []
  const re = /(\s+)|("(?:[^"\\]|\\.)*")(\s*:)?|([{}\[\]])|([,:])|(true|false)|(null)|(-?\d[\d.eE+-]*)|([^\s,:"{}\[\]]+)/g
  let m
  while ((m = re.exec(line))) {
    if (m[1]) out.push(['', m[1]])
    else if (m[2]) { out.push([m[3] ? 'key' : 'str', m[2]]); if (m[3]) out.push(['', m[3].slice(0, -1)], ['', ':']) }
    else if (m[4] || m[5]) out.push(['', m[4] || m[5]])
    else if (m[6] || m[8]) out.push(['num', m[6] || m[8]])
    else if (m[7]) out.push(['const', m[7]])
    else out.push(['', m[9]])
  }
  return out
}
const bytes = text => text ? `${new TextEncoder().encode(JSON.stringify(JSON.parse(text))).length} B` : ''
</script>

<template>
  <div class="pa-dr">
    <div class="row pa-dr-bar">
      <div class="row pa-dr-seg">
        <span v-for="[id, text] in [['all', 'All'], ['proxy', 'Proxy'], ['webhook', 'Webhooks']]" :key="id"
          :class="{ on: kind === id }" @click="kind = id">{{ text }}</span>
      </div>
      <div class="row pa-dr-seg">
        <span :class="{ on: !errorsOnly }" @click="errorsOnly = false">Any Status</span>
        <span :class="{ on: errorsOnly }" @click="errorsOnly = true">Errors</span>
      </div>
      <label class="pa-dr-filter"><Icon name="filter" :size="13" class="icon-muted" /><input v-model="query" placeholder="Filter path or service" spellcheck="false" /></label>
      <span class="grow" />
      <span class="row pa-dr-dot"><i />proxy :8767</span>
      <span class="row pa-dr-dot"><i />webhooks :8766</span>
      <span class="row pa-dr-restart"><Icon name="rotate_cw" :size="11" />Restart</span>
    </div>
    <div class="row pa-dr-body">
      <div class="pa-dr-list">
        <div v-for="r in shown" :key="r.index" class="row pa-dr-row" :class="{ sel: r.index === selected }" @click="pick(r.index)">
          <span class="mono muted pa-dr-time">{{ r.time }}</span>
          <span class="mono pa-dr-kind" :class="r.kind">{{ r.kind.toUpperCase() }}</span>
          <span class="pa-dr-method">{{ r.method }}</span>
          <span class="mono grow pa-dr-path">{{ cut(r.path, 33) }}</span>
          <span class="mono pa-dr-status" :class="statusClass(r.status)">{{ r.status }}</span>
          <span class="muted pa-dr-ms">{{ r.ms }} ms</span>
        </div>
        <div v-if="!shown.length" class="muted pa-dr-empty">No request matches.</div>
      </div>
      <div class="pa-dr-detail">
        <div class="row pa-dr-head">
          <span class="mono placeholder">{{ current.kind.toUpperCase() }}</span>
          <span class="mono">{{ current.method }}</span>
          <span class="mono grow trunc">{{ current.path }}</span>
          <span class="mono" :class="statusClass(current.status)">{{ current.status }}</span>
        </div>
        <div class="pa-dr-facts">
          <span class="muted">Service</span><span>{{ current.service }}</span>
          <span class="muted">Received</span><span class="pa-dr-strong">{{ current.time }} - {{ current.ms }} ms</span>
          <span class="muted">Profile</span><span>local</span>
          <span class="muted">Target</span><span>{{ cut(target(current.path), 53) }}</span>
          <template v-if="current.fanout"><span class="muted">Fan-out</span><span :class="failed ? 'err' : 'ok'">{{ failed ? `${failed} of ${current.fanout.length} failed` : 'all delivered' }}</span></template>
        </div>
        <div class="row pa-dr-tabs">
          <span :class="{ on: tab === 'request' }" @click="tab = 'request'">Request</span>
          <span v-if="current.fanout" :class="{ on: tab === 'fanout' }" @click="tab = 'fanout'">Fan-out ({{ current.fanout.length }})</span>
          <span :class="{ on: tab === 'response' }" @click="tab = 'response'">Response</span>
        </div>
        <template v-if="tab === 'request'">
          <div class="row pa-dr-sec"><span class="pa-dt-label">Headers</span><span class="grow" />
            <span class="pa-dr-link" @click="reveal = !reveal">{{ reveal ? 'Hide' : 'Show Hidden' }}</span></div>
          <div class="pa-dr-headers mono">
            <template v-for="[name, value] in current.headers" :key="name">
              <span class="muted">{{ name }}</span>
              <span :class="{ placeholder: value === null && !reveal }">{{ value === null ? (reveal ? '_myproject_session=abc123' : '********') : cut(value, 37) }}</span>
            </template>
          </div>
          <template v-if="current.body">
            <div class="row pa-dr-sec"><span class="pa-dt-label">Body</span><span class="placeholder pa-dr-meta">JSON - {{ bytes(current.body) }}</span>
              <span class="grow" /><span class="row pa-dr-link"><Icon name="copy" :size="11" />Copy</span></div>
            <pre class="mono pa-dr-code"><template v-for="(line, i) in current.body.split('\n')" :key="i"><span v-for="(run, j) in runs(line)" :key="j"
              :class="run[0] ? `pa-j-${run[0]}` : undefined">{{ run[1] }}</span>{{ '\n' }}</template></pre>
          </template>
          <div v-else class="muted pa-dr-note">No body.</div>
        </template>
        <div v-else-if="tab === 'fanout'" class="pa-dr-fan">
          <div v-for="[branch, status, detail] in current.fanout" :key="branch" class="row pa-dr-fanrow">
            <span class="mono grow">{{ branch }}</span>
            <span class="mono" :class="status ? statusClass(status) : 'err'">{{ status || 'failed' }}</span>
            <span class="muted pa-dr-ms wide">{{ detail }}</span>
          </div>
        </div>
        <template v-else>
          <pre v-if="current.response && isJson(current.response)" class="mono pa-dr-code"><template v-for="(line, i) in current.response.split('\n')" :key="i"><span v-for="(run, j) in runs(line)" :key="j"
            :class="run[0] ? `pa-j-${run[0]}` : undefined">{{ run[1] }}</span>{{ '\n' }}</template></pre>
          <pre v-else-if="current.response" class="mono pa-dr-code">{{ current.response }}</pre>
          <div v-else class="muted pa-dr-note">Not captured (binary asset).</div>
        </template>
        <div class="grow" />
        <div class="placeholder pa-dr-foot">Kept in memory for this session only.</div>
      </div>
    </div>
  </div>
</template>

<style>
.pa-dr { height: 100%; display: flex; flex-direction: column; background: var(--pa-editor-background); font-size: 12px; }
.pa-dr-bar { flex: none; height: 45px; padding: 0 16px 0 8px; gap: 8px; }
.pa-dr-seg { height: 29px; gap: 0; padding: 3px; border-radius: 6px; background: var(--pa-element-background); }
.pa-dr-seg span { height: 23px; padding: 0 9px; border-radius: 4px; display: inline-flex; align-items: center; color: var(--pa-text-muted); cursor: pointer; }
.pa-dr-seg span:hover { color: var(--pa-text); }
.pa-dr-seg span.on { background: var(--pa-element-selected); color: var(--pa-text); }
.pa-dr-filter { width: 240px; height: 29px; padding: 0 10px; gap: 10px; border-radius: 6px; display: flex; align-items: center;
  background: var(--pa-editor-background); box-shadow: inset 0 0 0 1px var(--pa-border); }
.pa-dr-filter input { flex: 1; min-width: 0; border: 0; outline: 0; padding: 0; background: none; font: inherit; font-size: 13px; color: var(--pa-text); }
.pa-dr-filter input::placeholder { color: var(--pa-text-placeholder); }
.pa-dr-dot { gap: 6px; color: var(--pa-text-muted); margin-right: 4px; }
.pa-dr-dot i { width: 6px; height: 6px; border-radius: 50%; background: var(--pa-success); }
.pa-dr-restart { gap: 5px; cursor: pointer; margin-left: 5px; }
.pa .pa-dr-body { flex: 1; min-height: 0; align-items: stretch; gap: 8px; padding: 1px 8px 8px; }
.pa-dr-list { width: 571px; flex: none; border-radius: 6px; background: var(--pa-panel-background); overflow: hidden; }
.pa-dr-row { height: 30px; padding: 0 12px; gap: 0; cursor: pointer; white-space: nowrap; }
.pa-dr-row:hover:not(.sel) { background: var(--pa-ghost-element-hover); }
.pa-dr-row.sel { background: var(--pa-element-selected); }
.pa-dr-time { width: 72px; flex: none; }
.pa-dr-kind { width: 72px; flex: none; color: var(--pa-text-placeholder); }
.pa-dr-kind.webhook { color: var(--pa-info); }
.pa-dr-method { width: 50px; flex: none; font-size: 11.5px; }
.pa-dr-path { min-width: 0; overflow: hidden; }
.pa-dr-status { width: 46px; flex: none; }
.pa-dr-ms { width: 42px; flex: none; text-align: right; font-size: 11.5px; }
.pa-dr-ms.wide { width: 140px; }
.pa-dr-empty { padding: 14px; }
.pa-dr-detail { flex: 1; min-width: 0; padding: 12px 12px 12px; border-radius: 6px; background: var(--pa-panel-background); display: flex; flex-direction: column; overflow: hidden; }
.pa-dr-head { flex: none; height: 20px; gap: 6px; }
.pa-dr-facts { flex: none; display: grid; grid-template-columns: 108px 1fr; row-gap: 6px; margin-top: 14px; font-size: 11.5px; line-height: 16px; white-space: nowrap; }
.pa-dr-strong { font-weight: 500; }
.pa-dr-tabs { flex: none; margin-top: 15px; gap: 16px; box-shadow: inset 0 -1px 0 var(--pa-border-variant); }
.pa-dr-tabs span { height: 28px; padding: 0 2px; display: inline-flex; align-items: center; color: var(--pa-text-muted); cursor: pointer; }
.pa-dr-tabs span.on { color: var(--pa-text); box-shadow: inset 0 -2px 0 var(--pa-text-accent); }
.pa-dr-sec { flex: none; height: 20px; gap: 8px; margin-top: 13px; }
.pa-dr-headers + .pa-dr-sec { margin-top: 15px; }
.pa-dr-meta { font-size: 11px; }
.pa-dr-link { gap: 5px; font-weight: 500; cursor: pointer; }
.pa-dr-headers { flex: none; display: grid; grid-template-columns: 108px 1fr; row-gap: 6px; margin-top: 8px; font-size: 12px; line-height: 16px; white-space: nowrap; }
.pa-dr-code { flex: none; margin: 7px 0 0; padding: 10px 12px; border-radius: 4px; background: var(--pa-editor-background);
  font-size: 11.5px; line-height: 16px; white-space: pre; overflow: hidden; color: var(--pa-text); }
.pa-dr-note { margin-top: 10px; }
.pa-dr-foot { flex: none; font-size: 11.5px; }
.pa-dr-fan { flex: none; margin-top: 10px; border-radius: 6px; box-shadow: inset 0 0 0 1px var(--pa-border-variant); }
.pa-dr-fanrow { height: 32px; padding: 0 12px; gap: 12px; }
.pa-dr-fanrow + .pa-dr-fanrow { box-shadow: inset 0 1px 0 var(--pa-border-variant); }
</style>
