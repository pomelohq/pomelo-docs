<script setup>
import { ref } from 'vue'
import Icon from './Icon.vue'
defineProps({ branch: { type: String, default: 'feat-login' } })
const selected = ref('users')
const open = ref({ api: true, main: true, users: true, redis: false })
const tables = [['articles', 128], ['sessions', 42], ['users', 8]]
const columns = [['id', 'bigint', true], ['email', 'text'], ['name', 'text'], ['role', 'text'], ['created_at', 'timestamptz']]
</script>

<template>
  <div class="pa-db">
    <div class="pa-panel-head">
      <span class="pa-panel-title">Database</span>
      <span class="placeholder pa-panel-branch">{{ branch }}</span>
      <span class="grow" />
      <div class="pa-icon-btn big"><Icon name="plus" :size="14" /></div>
      <div class="pa-icon-btn big"><Icon name="rotate_cw" :size="14" /></div>
      <div class="pa-icon-btn big"><Icon name="chevron_up" :size="14" /></div>
    </div>
    <div class="pa-db-filter"><div class="pa-field tall"><Icon name="search" :size="13" class="placeholder" /><span class="placeholder">Filter tables and columns</span></div></div>
    <div class="pa-db-section">CONSOLES</div>
    <div class="pa-db-row" style="padding-left: 8px"><Icon name="terminal" :size="14" class="icon-muted" /><span>query 1</span><span class="placeholder pa-sm">main</span></div>
    <div class="pa-db-section">DATABASES</div>
    <div class="pa-db-row" @click="open.api = !open.api"><Icon :name="open.api ? 'chevron_down' : 'chevron_right'" :size="12" class="icon-muted" /><span class="pa-strong">api</span></div>
    <template v-if="open.api">
      <div class="pa-db-row" :style="{ paddingLeft: '24px' }" @click="open.main = !open.main">
        <Icon :name="open.main ? 'chevron_down' : 'chevron_right'" :size="12" class="icon-muted" />
        <Icon name="engine-postgresql" :size="14" /><span>myproject_feat_login</span><span class="grow" /><i class="pa-db-dot" />
      </div>
      <template v-if="open.main">
        <template v-for="[name, rows] in tables" :key="name">
          <div class="pa-db-row" :class="{ on: selected === name }" :style="{ paddingLeft: '40px' }" @click="selected = name; open[name] = !open[name]">
            <Icon :name="open[name] ? 'chevron_down' : 'chevron_right'" :size="12" class="icon-muted" />
            <Icon name="table" :size="14" class="icon-muted" /><span>{{ name }}</span><span class="placeholder pa-sm">{{ rows }}</span>
          </div>
          <template v-if="open[name] && name === 'users'">
            <div v-for="[col, type, key] in columns" :key="col" class="pa-db-row" :style="{ paddingLeft: '74px' }">
              <Icon :name="key ? 'key' : 'column'" :size="13" :class="key ? 'warn' : 'icon-muted'" />
              <span class="muted">{{ col }}</span><span class="mono placeholder pa-xs">{{ type }}</span>
            </div>
          </template>
        </template>
      </template>
      <div class="pa-db-row" :style="{ paddingLeft: '24px' }" @click="open.redis = !open.redis">
        <Icon :name="open.redis ? 'chevron_down' : 'chevron_right'" :size="12" class="icon-muted" />
        <Icon name="engine-redis" :size="14" /><span>redis</span><span class="placeholder pa-sm">shared</span><span class="grow" /><i class="pa-db-dot" />
      </div>
      <template v-if="open.redis">
        <div v-for="k in ['cache:*', 'login:*', 'sidekiq:*']" :key="k" class="pa-db-row" :style="{ paddingLeft: '56px' }">
          <Icon name="key" :size="13" class="icon-muted" /><span class="mono">{{ k }}</span>
        </div>
      </template>
      <div class="pa-db-row" :style="{ paddingLeft: '24px' }">
        <Icon name="chevron_right" :size="12" class="icon-muted" />
        <Icon name="engine-minio" :size="14" /><span>files</span><span class="placeholder pa-sm">shared</span><span class="grow" /><i class="pa-db-dot" />
      </div>
    </template>
  </div>
</template>

<style>
.pa-db { height: 100%; display: flex; flex-direction: column; }
.pa-icon-btn.big { width: 24px; height: 24px; }
.pa-db-filter { height: 34px; padding: 0 8px 6px; }
.pa-field.tall { height: 28px; }
.pa-db-section { height: 26px; padding: 4px 10px 0; display: flex; align-items: center; font-size: 11px; font-weight: 500; color: var(--pa-text-placeholder); }
.pa-db-row { height: 22px; padding: 0 8px; gap: 6px; display: flex; align-items: center; font-size: 13px; cursor: pointer; white-space: nowrap; }
.pa-db-row:hover { background: var(--pa-ghost-element-hover); }
.pa-db-row.on { background: var(--pa-element-selected); }
.pa .pa-sm { font-size: 11.5px; }
.pa-db-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--pa-success); display: block; }
</style>
