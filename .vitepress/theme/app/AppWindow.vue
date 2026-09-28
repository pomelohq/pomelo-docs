<script setup>
import Icon from './Icon.vue'
import Meter from './Meter.vue'

// The window chrome: title bar, the workspaces column (full height, with its footer strip) and the
// main column (docks around the center, the status bar under them).
defineProps({
  project: { type: String, default: 'myproject' },
  branch: { type: String, default: 'feat-login' },
  account: { type: String, default: 'dev' },
  session: { type: Number, default: 23 },
  weekly: { type: Number, default: 74 },
  today: { type: String, default: '$17.25' },
  sidebar: { type: Number, default: 260 },
  dock: { type: Number, default: 320 },
  right: { type: Number, default: 320 },
  bottom: { type: Number, default: 220 },
  active: { type: String, default: 'services' },
  running: { type: Boolean, default: true },
  cursor: { type: String, default: '8:54' },
  language: { type: String, default: 'Ruby' },
})
const leftButtons = [
  ['files', 'folder'], ['services', 'server'], ['git', 'branch'], ['database', 'cylinder'],
]
</script>

<template>
  <div class="pa-window">
    <div class="pa-title">
      <div class="pa-lights"><i /><i /><i /></div>
      <div class="pa-session">{{ project }}</div>
      <div class="pa-title-branch">{{ branch }}</div>
      <div class="pa-title-right">
        <div class="pa-chip">
          <Icon name="sparkle" :size="12" class="icon-muted" />
          <span class="mono">{{ account }}</span>
          <Meter :used="session" :width="36" />
          <span class="mono">{{ session }}%</span><span class="mono muted">5h</span>
          <span class="mono">{{ weekly }}%</span><span class="mono muted">wk</span>
        </div>
        <div class="pa-chevron"><Icon name="chevron_down" :size="12" /></div>
      </div>
    </div>
    <div class="pa-body">
      <div class="pa-sidebar" :style="{ width: sidebar + 'px' }">
        <div class="pa-sidebar-content"><slot name="sidebar" /></div>
        <div class="pa-sidebar-foot">
          <div class="pa-sbtn on"><Icon name="sidebar" :size="13" /></div>
        </div>
      </div>
      <div class="pa-main">
        <div class="pa-docks">
          <div v-if="$slots.dock" class="pa-dock-left" :style="{ width: dock + 'px' }"><slot name="dock" /></div>
          <div class="pa-center-col">
            <div class="pa-center"><slot /></div>
            <div v-if="$slots.bottom" class="pa-dock-bottom" :style="{ height: bottom + 'px' }"><slot name="bottom" /></div>
          </div>
          <div v-if="$slots.right" class="pa-dock-right" :style="{ width: right + 'px' }"><slot name="right" /></div>
        </div>
        <div class="pa-status">
          <div class="row pa-status-group">
            <div v-for="[id, icon] in leftButtons" :key="id" class="pa-sbtn" :class="{ on: active === id }">
              <Icon :name="icon" :size="13" />
              <span v-if="id === 'services' && running" class="pa-run-dot" />
            </div>
            <div class="pa-sep" />
            <div class="pa-sbtn"><Icon name="check" :size="14" class="text" /></div>
          </div>
          <div class="row pa-status-group">
            <span class="pa-status-text">{{ cursor }}</span>
            <div class="pa-sep" />
            <span class="pa-status-text muted">{{ language }}</span>
            <div class="pa-sep" />
            <div class="pa-today"><Icon name="sparkle" :size="12" class="icon-muted" /><span class="muted">{{ today }} today</span></div>
            <div class="pa-sep" />
            <div class="pa-sbtn" :class="{ on: !!$slots.bottom }"><Icon name="terminal" :size="13" /></div>
            <div class="pa-sep" />
            <div class="pa-sbtn" :class="{ on: !!$slots.right }"><Icon name="sparkle" :size="13" /></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.pa-window { display: flex; flex-direction: column; width: 100%; height: 100%; background: var(--pa-background); }
.pa .icon-muted { color: var(--pa-icon-muted); }
.pa .text { color: var(--pa-text); }
.pa-title { position: relative; flex: none; height: 38px; display: flex; align-items: center;
  background: var(--pa-title-bar-background); }
.pa-lights { position: absolute; left: 14px; display: flex; gap: 8px; }
.pa-lights i { width: 12px; height: 12px; border-radius: 50%; background: #ff5f57; }
.pa-lights i:nth-child(2) { background: #febc2e; }
.pa-lights i:nth-child(3) { background: #28c840; }
.pa-session { position: absolute; left: 88px; height: 24px; padding: 0 8px; border-radius: 6px;
  display: flex; align-items: center; font-size: 13px; }
.pa-session:hover { background: var(--pa-ghost-element-hover); }
.pa-title-branch { margin: 0 auto; font-size: 14px; color: var(--pa-text-muted); }
.pa-title-right { position: absolute; right: 10px; display: flex; align-items: center; gap: 4px; }
.pa-chip { height: 24px; padding: 0 8px; border-radius: 12px; display: flex; align-items: center; gap: 6px;
  background: rgba(255, 255, 255, 0.05); font-size: 12px; }
.pa-chip:hover { background: var(--pa-element-hover); }
.pa-chevron { width: 24px; height: 24px; border-radius: 5px; display: flex; align-items: center;
  justify-content: center; color: var(--pa-text-muted); }
.pa-chevron:hover { background: var(--pa-ghost-element-hover); color: var(--pa-text); }
.pa-body { flex: 1; display: flex; min-height: 0; }
.pa-sidebar { flex: none; display: flex; flex-direction: column; background: var(--pa-panel-background);
  border-right: 1px solid var(--pa-border); }
.pa-sidebar-content { flex: 1; min-height: 0; overflow: hidden; }
.pa-sidebar-foot { flex: none; height: 24px; display: flex; align-items: center; padding-left: 8px;
  background: var(--pa-title-bar-background); border-top: 1px solid var(--pa-border); }
.pa-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.pa-docks { flex: 1; display: flex; min-height: 0; }
.pa-dock-left { flex: none; background: var(--pa-panel-background); border-right: 1px solid var(--pa-border);
  overflow: hidden; display: flex; flex-direction: column; }
.pa-dock-right { flex: none; background: var(--pa-panel-background); border-left: 1px solid var(--pa-border);
  overflow: hidden; display: flex; flex-direction: column; }
.pa-center-col { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.pa-center { flex: 1; min-height: 0; background: var(--pa-editor-background); display: flex;
  flex-direction: column; overflow: hidden; }
.pa-dock-bottom { flex: none; background: var(--pa-panel-background); border-top: 1px solid var(--pa-border);
  display: flex; flex-direction: column; overflow: hidden; }
.pa-status { flex: none; height: 24px; padding: 0 8px; display: flex; align-items: center;
  justify-content: space-between; background: var(--pa-title-bar-background); border-top: 1px solid var(--pa-border); }
.pa-status-group { gap: 6px; }
.pa-sbtn { position: relative; width: 26px; height: 20px; border-radius: 5px; display: flex; align-items: center;
  justify-content: center; color: var(--pa-text-muted); }
.pa-sbtn:hover { background: var(--pa-element-hover); }
.pa-sbtn.on { color: var(--pa-icon-accent); }
.pa-run-dot { position: absolute; right: 4px; bottom: 2px; width: 6px; height: 6px; border-radius: 50%;
  background: var(--pa-success); }
.pa-sep { width: 1px; height: 14px; background: var(--pa-border); }
.pa-status-text { height: 20px; padding: 0 4px; display: flex; align-items: center; font-size: 12px; }
.pa-today { height: 20px; padding: 0 6px; border-radius: 4px; display: flex; align-items: center; gap: 6px; font-size: 12px; }
.pa-today:hover { background: var(--pa-ghost-element-hover); }
</style>
