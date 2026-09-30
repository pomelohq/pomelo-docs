<script setup>
import { computed, ref } from 'vue'

const requests = [
  { time: '10:40:06', kind: 'proxy', method: 'GET', path: '/_pom_dev/api/server/v1/me', status: 200, ms: 12, service: 'api/server',
    headers: [['accept', 'application/json'], ['cookie', null], ['user-agent', 'Mozilla/5.0']],
    body: null, response: '{\n  "id": 7,\n  "email": "dev@example.com",\n  "role": "admin"\n}' },
  { time: '10:40:05', kind: 'webhook', method: 'POST', path: '/hooks/stripe', status: 502, ms: 84, service: 'api/server',
    headers: [['content-type', 'application/json'], ['stripe-signature', 't=1727671325,v1=5257a8c0d1'], ['user-agent', 'Stripe/1.0'], ['authorization', null]],
    body: '{\n  "id": "evt_1Q2xYz",\n  "type": "invoice.paid",\n  "data": {\n    "object": {\n      "id": "in_1Q2xAb",\n      "amount_paid": 4900,\n      "currency": "usd"\n    }\n  }\n}',
    fanout: [['main', 200, '31 ms'], ['feat-login', null, 'connection refused']], response: '{"ok":true,"service":"api/server","fanout":2}' },
  { time: '10:40:04', kind: 'proxy', method: 'POST', path: '/_pom_dev/api/server/v1/login', status: 401, ms: 31, service: 'api/server',
    headers: [['content-type', 'application/json'], ['cookie', null]],
    body: '{\n  "email": "dev@example.com",\n  "password": "..."\n}', response: '{\n  "error": "invalid credentials"\n}' },
  { time: '10:40:03', kind: 'proxy', method: 'GET', path: '/_pom_dev/web/app/assets/main.js', status: 200, ms: 4, service: 'web/app',
    headers: [['accept', '*/*']], body: null, response: null },
  { time: '10:40:02', kind: 'proxy', method: 'GET', path: '/_pom_dev/api/server/v1/orders', status: 503, ms: 2, service: 'api/server',
    headers: [['accept', 'application/json']], body: null, response: 'service api/server is not running in feat-login' },
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
const bytes = text => text ? `${new TextEncoder().encode(text).length} B` : ''
</script>

<template>
  <div class="pa-dr">
    <div class="row pa-dr-bar">
      <div class="row pa-seg">
        <span v-for="[id, text] in [['all', 'All'], ['proxy', 'Proxy'], ['webhook', 'Webhooks']]" :key="id"
          :class="{ on: kind === id }" @click="kind = id">{{ text }}</span>
      </div>
      <div class="row pa-seg">
        <span :class="{ on: !errorsOnly }" @click="errorsOnly = false">Any Status</span>
        <span :class="{ on: errorsOnly }" @click="errorsOnly = true">Errors</span>
      </div>
      <input v-model="query" class="pa-dr-filter" placeholder="Filter path or service" />
      <span class="grow" />
      <span class="row pa-dr-dot"><i />:8767</span>
      <span class="row pa-dr-dot"><i />:8766</span>
      <span class="pa-dr-restart">Restart</span>
    </div>
    <div class="row pa-dr-body">
      <div class="col pa-dr-list">
        <div v-for="r in shown" :key="r.index" class="row pa-dr-row" :class="{ sel: r.index === selected }" @click="pick(r.index)">
          <span class="mono muted pa-dr-time">{{ r.time }}</span>
          <span class="pa-dr-kind" :class="r.kind">{{ r.kind.toUpperCase() }}</span>
          <span class="pa-dr-method">{{ r.method }}</span>
          <span class="mono trunc grow">{{ r.path }}</span>
          <span class="pa-dr-status" :class="statusClass(r.status)">{{ r.status }}</span>
          <span class="muted pa-dr-ms">{{ r.ms }} ms</span>
        </div>
        <div v-if="!shown.length" class="muted pa-dr-empty">No request matches.</div>
      </div>
      <div class="col pa-dr-detail">
        <div class="row pa-dr-head">
          <span class="pa-dr-kind" :class="current.kind">{{ current.kind.toUpperCase() }}</span>
          <span class="mono">{{ current.method }}</span>
          <span class="mono trunc grow">{{ current.path }}</span>
          <span v-if="current.fanout" :class="failed ? 'err' : 'ok'">{{ failed ? `${failed} of ${current.fanout.length} failed` : 'all delivered' }}</span>
        </div>
        <div class="pa-dr-facts">
          <span class="muted">Service</span><span>{{ current.service }}</span>
          <span class="muted">Received</span><span>{{ current.time }} - {{ current.ms }} ms</span>
        </div>
        <div class="row pa-dr-tabs">
          <span :class="{ on: tab === 'request' }" @click="tab = 'request'">Request</span>
          <span v-if="current.fanout" :class="{ on: tab === 'fanout' }" @click="tab = 'fanout'">Fan-out ({{ current.fanout.length }})</span>
          <span :class="{ on: tab === 'response' }" @click="tab = 'response'">Response</span>
        </div>
        <template v-if="tab === 'request'">
          <div class="row pa-dr-sec"><span class="pa-dr-label">HEADERS</span><span class="grow" />
            <span class="pa-dr-link" @click="reveal = !reveal">{{ reveal ? 'Hide' : 'Show Hidden' }}</span></div>
          <div class="pa-dr-headers">
            <template v-for="[name, value] in current.headers" :key="name">
              <span class="mono muted">{{ name }}</span>
              <span class="mono trunc" :class="{ placeholder: value === null && !reveal }">{{ value === null ? (reveal ? 'Bearer eyJhbGciOi...' : '********') : value }}</span>
            </template>
          </div>
          <template v-if="current.body">
            <div class="row pa-dr-sec"><span class="pa-dr-label">BODY</span><span class="muted pa-dr-meta">JSON - {{ bytes(current.body) }}</span>
              <span class="grow" /><span class="pa-dr-link">Copy</span></div>
            <pre class="mono pa-dr-code">{{ current.body }}</pre>
          </template>
          <div v-else class="muted pa-dr-note">No body.</div>
        </template>
        <div v-else-if="tab === 'fanout'" class="col pa-dr-fan">
          <div v-for="[branch, status, detail] in current.fanout" :key="branch" class="row pa-dr-fanrow">
            <span class="mono grow">{{ branch }}</span>
            <span :class="status ? statusClass(status) : 'err'">{{ status || 'failed' }}</span>
            <span class="muted pa-dr-ms">{{ detail }}</span>
          </div>
        </div>
        <template v-else>
          <pre v-if="current.response" class="mono pa-dr-code">{{ current.response }}</pre>
          <div v-else class="muted pa-dr-note">Not captured (binary asset).</div>
        </template>
        <div class="muted pa-dr-note">Kept in memory for this session only.</div>
      </div>
    </div>
  </div>
</template>

<style>
.pa-dr { height: 100%; display: flex; flex-direction: column; background: var(--pa-editor-background); }
.pa-dr-bar { flex: none; height: 40px; padding: 0 12px; gap: 8px; background: var(--pa-panel-background); border-bottom: 1px solid var(--pa-border-variant); }
.pa-seg { gap: 2px; padding: 2px; border-radius: 5px; background: var(--pa-element-background); font-size: 11.5px; }
.pa-seg span { padding: 3px 10px; border-radius: 4px; color: var(--pa-text-muted); cursor: pointer; }
.pa-seg span:hover { background: var(--pa-ghost-element-hover); }
.pa-seg span.on { background: var(--pa-element-selected); color: var(--pa-text); }
.pa-dr-filter { width: 200px; height: 24px; padding: 0 8px; border-radius: 5px; border: 1px solid var(--pa-border-variant);
  background: var(--pa-editor-background); color: var(--pa-text); font: inherit; font-size: 12px; outline: none; }
.pa-dr-filter:focus { border-color: var(--pa-border-focused); }
.pa-dr-filter::placeholder { color: var(--pa-text-placeholder); }
.pa-dr-dot { gap: 5px; font-size: 11.5px; color: var(--pa-text-muted); }
.pa-dr-dot i { width: 7px; height: 7px; border-radius: 4px; background: var(--pa-success); }
.pa-dr-restart { font-size: 12px; padding: 2px 6px; border-radius: 4px; cursor: pointer; }
.pa-dr-restart:hover { background: var(--pa-ghost-element-hover); }
.pa .pa-dr-body { flex: 1; align-items: stretch; min-height: 0; }
.pa-dr-list { width: 56%; flex: none; border-right: 1px solid var(--pa-border-variant); overflow: auto; }
.pa-dr-row { height: 31px; padding: 0 12px; gap: 10px; font-size: 12px; border-bottom: 1px solid var(--pa-border-variant); cursor: pointer; }
.pa-dr-row:hover { background: var(--pa-ghost-element-hover); }
.pa-dr-row.sel { background: var(--pa-element-selected); }
.pa-dr-time { width: 64px; flex: none; }
.pa-dr-kind { width: 64px; flex: none; font-size: 11.5px; color: var(--pa-text-muted); }
.pa-dr-kind.webhook { color: var(--pa-hint); }
.pa-dr-head .pa-dr-kind { width: auto; }
.pa-dr-method { width: 44px; flex: none; }
.pa-dr-status { width: 36px; flex: none; text-align: right; }
.pa-dr-ms { width: 110px; flex: none; text-align: right; font-size: 11.5px; }
.pa-dr-row .pa-dr-ms { width: 44px; }
.pa .ok { color: var(--pa-success); }
.pa-dr-empty { padding: 14px; font-size: 12px; }
.pa-dr-detail { flex: 1; padding: 14px 16px; gap: 8px; overflow: auto; font-size: 12.5px; }
.pa-dr-head { gap: 8px; font-size: 13px; }
.pa-dr-facts { display: grid; grid-template-columns: 100px 1fr; gap: 4px 8px; font-size: 12px; }
.pa-dr-tabs { gap: 18px; border-bottom: 1px solid var(--pa-border-variant); font-size: 12px; margin-top: 4px; }
.pa-dr-tabs span { padding: 6px 2px; color: var(--pa-text-muted); cursor: pointer; border-bottom: 2px solid transparent; }
.pa-dr-tabs span.on { color: var(--pa-text); border-bottom-color: var(--pa-text-accent); }
.pa-dr-sec { gap: 8px; margin-top: 6px; }
.pa-dr-label { font-size: 11px; font-weight: 600; letter-spacing: 0.03em; color: var(--pa-text-muted); }
.pa-dr-meta { font-size: 11.5px; }
.pa-dr-link { font-size: 12px; padding: 1px 6px; border-radius: 4px; cursor: pointer; }
.pa-dr-link:hover { background: var(--pa-ghost-element-hover); }
.pa-dr-headers { display: grid; grid-template-columns: 150px 1fr; gap: 4px 8px; font-size: 11.5px; }
.pa-dr-code { margin: 0; padding: 10px 12px; border-radius: 6px; border: 1px solid var(--pa-border-variant); background: var(--pa-panel-background);
  font-size: 11.5px; line-height: 1.45; white-space: pre; overflow: auto; color: var(--pa-text); }
.pa-dr-note { font-size: 11.5px; margin-top: 4px; }
.pa-dr-fan { border: 1px solid var(--pa-border-variant); border-radius: 6px; margin-top: 6px; }
.pa-dr-fanrow { height: 32px; padding: 0 12px; gap: 12px; font-size: 12px; border-top: 1px solid var(--pa-border-variant); }
.pa-dr-fanrow:first-child { border-top: none; }
</style>
